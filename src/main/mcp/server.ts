import http from 'http'
import { Server } from '@modelcontextprotocol/sdk/server'
import { SSEServerTransport } from '@modelcontextprotocol/sdk/server/sse.js'
import { ListToolsRequestSchema, CallToolRequestSchema } from '@modelcontextprotocol/sdk/types.js'
import { readAllAxioms, findMethodologyByTopic } from '../agent/reader'
import { searchKnowledgeCards, findCardById } from '../knowledge/search'

interface MCPServerConfig {
  port: number
  kbDirectoryFn: () => string | null
}

// Active SSE transports keyed by session ID
const activeTransports = new Map<string, SSEServerTransport>()

let httpServer: http.Server | null = null
let mcpServer: Server | null = null
let currentPort = 7777
let isRunning = false

function createMCPServer(kbDirectoryFn: () => string | null): Server {
  const server = new Server(
    { name: 'life-console', version: '1.0.0' },
    { capabilities: { tools: {} } }
  )

  server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: [
      {
        name: 'listAxioms',
        description: 'List axioms from the Agent Layer. Optionally filter by category.',
        inputSchema: {
          type: 'object' as const,
          properties: {
            category: {
              type: 'string',
              description: 'Filter by category: architecture | methodology | technical | values'
            }
          }
        }
      },
      {
        name: 'getMethodology',
        description: 'Get the most relevant methodology for a given topic.',
        inputSchema: {
          type: 'object' as const,
          properties: {
            topic: { type: 'string', description: 'The topic or context to find a methodology for' }
          },
          required: ['topic']
        }
      },
      {
        name: 'searchKnowledge',
        description: 'Full-text search across all KnowledgeCards in the knowledge base.',
        inputSchema: {
          type: 'object' as const,
          properties: {
            query: { type: 'string', description: 'Search terms' },
            limit: { type: 'number', description: 'Max results (default 10)' }
          },
          required: ['query']
        }
      },
      {
        name: 'getCard',
        description: 'Get a specific KnowledgeCard by its id.',
        inputSchema: {
          type: 'object' as const,
          properties: {
            id: { type: 'string', description: 'The card id from frontmatter' }
          },
          required: ['id']
        }
      }
    ]
  }))

  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args = {} } = request.params
    const a = args as Record<string, unknown>

    try {
      switch (name) {
        case 'listAxioms': {
          const axioms = readAllAxioms(a.category as string | undefined)
          const result = axioms.map((ax) => ({
            id: ax.frontmatter.id,
            title: ax.frontmatter.title,
            category: ax.frontmatter.category,
            content: ax.content
          }))
          return { content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }] }
        }

        case 'getMethodology': {
          const topic = a.topic as string
          const method = findMethodologyByTopic(topic)
          if (!method) {
            return {
              content: [{ type: 'text' as const, text: `No methodology found for topic: ${topic}` }]
            }
          }
          return {
            content: [
              {
                type: 'text' as const,
                text: `# ${method.frontmatter.title}\n\n${method.content}`
              }
            ]
          }
        }

        case 'searchKnowledge': {
          const kbDir = kbDirectoryFn()
          if (!kbDir) {
            return {
              content: [{ type: 'text' as const, text: 'Knowledge base directory not configured.' }]
            }
          }
          const cards = searchKnowledgeCards(kbDir, a.query as string, (a.limit as number) ?? 10)
          const result = cards.map((c) => ({
            id: c.frontmatter.id,
            topic: c.frontmatter.topic,
            tags: c.frontmatter.tags,
            content: c.content
          }))
          return { content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }] }
        }

        case 'getCard': {
          const kbDir = kbDirectoryFn()
          if (!kbDir) {
            return {
              content: [{ type: 'text' as const, text: 'Knowledge base directory not configured.' }]
            }
          }
          const card = findCardById(kbDir, a.id as string)
          if (!card) {
            return {
              content: [{ type: 'text' as const, text: `Card not found: ${a.id}` }],
              isError: true
            }
          }
          return {
            content: [
              { type: 'text' as const, text: `# ${card.frontmatter.topic}\n\n${card.content}` }
            ]
          }
        }

        default:
          return {
            content: [{ type: 'text' as const, text: `Unknown tool: ${name}` }],
            isError: true
          }
      }
    } catch (err) {
      return {
        content: [{ type: 'text' as const, text: `Error: ${String(err)}` }],
        isError: true
      }
    }
  })

  return server
}

export async function startMCPServer(config: MCPServerConfig): Promise<void> {
  if (isRunning) return

  currentPort = config.port
  mcpServer = createMCPServer(config.kbDirectoryFn)

  httpServer = http.createServer(async (req, res) => {
    // CORS for localhost
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

    if (req.method === 'OPTIONS') {
      res.writeHead(204)
      res.end()
      return
    }

    const url = new URL(req.url ?? '/', `http://localhost:${currentPort}`)

    if (req.method === 'GET' && url.pathname === '/sse') {
      const transport = new SSEServerTransport('/message', res)
      activeTransports.set(transport.sessionId, transport)
      transport.onclose = () => activeTransports.delete(transport.sessionId)
      await mcpServer!.connect(transport)
      return
    }

    if (req.method === 'POST' && url.pathname === '/message') {
      const sessionId = url.searchParams.get('sessionId')
      const transport = sessionId ? activeTransports.get(sessionId) : null

      if (!transport) {
        res.writeHead(404)
        res.end(JSON.stringify({ error: 'Session not found' }))
        return
      }

      let body = ''
      req.on('data', (chunk: Buffer) => {
        body += chunk.toString()
      })
      req.on('end', async () => {
        try {
          const parsed = body ? JSON.parse(body) : undefined
          await transport.handlePostMessage(req, res, parsed)
        } catch {
          res.writeHead(400)
          res.end(JSON.stringify({ error: 'Invalid JSON' }))
        }
      })
      return
    }

    if (url.pathname === '/') {
      res.writeHead(200, { 'Content-Type': 'application/json' })
      res.end(
        JSON.stringify({ name: 'life-console-mcp', version: '1.0.0', transport: 'sse' })
      )
      return
    }

    res.writeHead(404)
    res.end()
  })

  await new Promise<void>((resolve, reject) => {
    httpServer!.listen(currentPort, '127.0.0.1', () => resolve())
    httpServer!.once('error', reject)
  })

  isRunning = true
  console.log(`[mcp] Server started on localhost:${currentPort}`)
}

export async function stopMCPServer(): Promise<void> {
  if (!isRunning || !httpServer) return

  for (const transport of activeTransports.values()) {
    try {
      await transport.close()
    } catch {
      // ignore
    }
  }
  activeTransports.clear()

  await new Promise<void>((resolve) => {
    httpServer!.close(() => resolve())
  })

  httpServer = null
  mcpServer = null
  isRunning = false
  console.log('[mcp] Server stopped')
}

export function getMCPStatus(): { running: boolean; port: number; url: string } {
  return {
    running: isRunning,
    port: currentPort,
    url: `http://localhost:${currentPort}`
  }
}
