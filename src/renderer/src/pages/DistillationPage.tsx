import React, { useState, useEffect, useRef, useCallback } from 'react'
import { api } from '../hooks/useIPC'
import type { WriteBackPayload } from '../../../shared/types'

interface LLMToolCall {
  id: string
  type: 'function'
  function: { name: string; arguments: string }
}

interface Message {
  role: 'system' | 'user' | 'assistant' | 'tool'
  content: string
  toolCallId?: string
  name?: string
  toolCalls?: LLMToolCall[]
}

interface WriteBackProposal {
  type: WriteBackPayload['type']
  id?: string
  content: string
  frontmatter: Record<string, unknown>
  description: string
}

interface LLMTool {
  type: 'function'
  function: {
    name: string
    description: string
    parameters: Record<string, unknown>
  }
}

export default function DistillationPage(): React.ReactElement {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [systemPrompt, setSystemPrompt] = useState<string | null>(null)
  const [apiKey, setApiKey] = useState<string | null>(null)
  const [apiBaseUrl, setApiBaseUrl] = useState('https://api.openai.com/v1')
  const [modelName, setModelName] = useState('gpt-4o')
  const [writeBackProposal, setWriteBackProposal] = useState<WriteBackProposal | null>(null)
  const [writeBackStatus, setWriteBackStatus] = useState<string | null>(null)
  const [apiType, setApiType] = useState<'openai' | 'anthropic'>('openai')
  const [noApiKey, setNoApiKey] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    loadSettings()
  }, [])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const loadSettings = async (): Promise<void> => {
    const settings = await api.settings.get()
    if (!settings.model_api_key) {
      setNoApiKey(true)
      return
    }
    setNoApiKey(false)
    setApiKey(settings.model_api_key)
    if (settings.model_api_type) setApiType(settings.model_api_type)
    if (settings.model_api_base_url) setApiBaseUrl(settings.model_api_base_url)
    if (settings.model_name) setModelName(settings.model_name)

    // Build system prompt from Agent Layer
    const [axioms, methodologies] = await Promise.all([
      api.agent.listAxioms(),
      api.agent.listMethodologies()
    ])

    const parts = [
      'You are a personal knowledge distillation assistant. Help the user refine their thinking frameworks, axioms, and methodologies.',
      '',
      'You have access to the user\'s Agent Layer (their personal thinking frameworks):',
      ''
    ]

    if (axioms.length > 0) {
      parts.push('## User\'s Axioms')
      for (const ax of axioms) {
        parts.push(`\n### ${ax.frontmatter.title} (${ax.frontmatter.category})`)
        parts.push(ax.content)
      }
    }

    if (methodologies.length > 0) {
      parts.push('\n## User\'s Methodologies')
      for (const m of methodologies) {
        parts.push(`\n### ${m.frontmatter.title}`)
        parts.push(m.content)
      }
    }

    parts.push(
      '\n## Your Role',
      'Help the user distill insights from conversations into their Agent Layer.',
      'When the user asks to save an insight as an axiom or methodology, propose the exact Markdown content.',
      'Use the searchKnowledge tool to find relevant knowledge cards when the conversation touches specific topics.',
      '\nTo propose a write-back to the Agent Layer, respond with a JSON block in this format:',
      '```write-back',
      JSON.stringify({
        type: 'new-axiom',
        id: 'optional-for-updates',
        frontmatter: { title: 'Axiom Title', category: 'values' },
        content: 'The principle statement...\n\n**Why:** ...\n\n**When to apply:** ...',
        description: 'Brief description of what this adds/changes'
      }, null, 2),
      '```'
    )

    setSystemPrompt(parts.join('\n'))
  }

  const tools: LLMTool[] = [
    {
      type: 'function',
      function: {
        name: 'searchKnowledge',
        description: 'Search the knowledge base for relevant cards',
        parameters: {
          type: 'object',
          properties: {
            query: { type: 'string', description: 'Search terms' },
            limit: { type: 'number', description: 'Max results (default 5)' }
          },
          required: ['query']
        }
      }
    }
  ]

  const callLLM = async (msgs: Message[]): Promise<{ content: string; toolCalls?: LLMTool[] }> => {
    if (!apiKey) throw new Error('No API key')
    const baseUrl = apiBaseUrl.replace(/\/$/, '')

    const result = await api.agent.llmCall({
      url: `${baseUrl}/chat/completions`,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: modelName,
        messages: [
          { role: 'system', content: systemPrompt },
          ...msgs.filter(m => m.role !== 'system').map((m) => ({
            role: m.role,
            content: m.content,
            ...(m.name ? { name: m.name } : {}),
            ...(m.toolCallId ? { tool_call_id: m.toolCallId } : {}),
            ...(m.toolCalls ? { tool_calls: m.toolCalls } : {})
          }))
        ],
        tools,
        temperature: 0.7
      })
    })

    if (!result.ok) {
      throw new Error(`LLM error: ${result.status} ${result.text}`)
    }

    const data = JSON.parse(result.text) as {
      choices: Array<{
        message: {
          content: string | null
          tool_calls?: LLMToolCall[]
        }
      }>
    }

    const choice = data.choices[0]
    const toolCalls = choice.message.tool_calls

    if (toolCalls && toolCalls.length > 0) {
      return { content: '', toolCalls: toolCalls as unknown as LLMTool[] }
    }

    return { content: choice.message.content ?? '' }
  }

  // Anthropic-format LLM call — handles tool loop internally, returns final text
  const callLLMAnthropic = async (msgs: Message[]): Promise<string> => {
    if (!apiKey) throw new Error('No API key')
    const baseUrl = apiBaseUrl.replace(/\/$/, '')

    const anthropicTools = tools.map((t) => ({
      name: t.function.name,
      description: t.function.description,
      input_schema: t.function.parameters
    }))

    type AnthropicContent =
      | { type: 'text'; text: string }
      | { type: 'tool_use'; id: string; name: string; input: Record<string, unknown> }
      | { type: 'tool_result'; tool_use_id: string; content: string }
    type AnthropicMsg = { role: 'user' | 'assistant'; content: string | AnthropicContent[] }

    const toAnthropicMsgs = (m: Message[]): AnthropicMsg[] =>
      m
        .filter((x) => x.role !== 'system')
        .map((x) => {
          if (x.role === 'tool') {
            return {
              role: 'user' as const,
              content: [{ type: 'tool_result' as const, tool_use_id: x.toolCallId!, content: x.content }]
            }
          }
          return { role: x.role as 'user' | 'assistant', content: x.content }
        })

    let anthropicMsgs = toAnthropicMsgs(msgs)

    for (let round = 0; round < 3; round++) {
      const result = await api.agent.llmCall({
        url: `${baseUrl}/messages`,
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: modelName,
          max_tokens: 4096,
          system: systemPrompt,
          messages: anthropicMsgs,
          tools: anthropicTools,
          temperature: 0.7
        })
      })

      if (!result.ok) {
        throw new Error(`LLM error: ${result.status} ${result.text}`)
      }

      const data = JSON.parse(result.text) as {
        content: AnthropicContent[]
        stop_reason: string
      }

      if (data.stop_reason === 'tool_use') {
        const toolUseBlocks = data.content.filter(
          (b): b is Extract<AnthropicContent, { type: 'tool_use' }> => b.type === 'tool_use'
        )
        anthropicMsgs = [...anthropicMsgs, { role: 'assistant', content: data.content }]
        const toolResults: AnthropicContent[] = []
        for (const block of toolUseBlocks) {
          const result = await handleToolCall({
            id: block.id,
            type: 'function',
            function: { name: block.name, arguments: JSON.stringify(block.input) }
          })
          toolResults.push({ type: 'tool_result', tool_use_id: block.id, content: result })
        }
        anthropicMsgs = [...anthropicMsgs, { role: 'user', content: toolResults }]
        continue
      }

      const textBlock = data.content.find((b): b is Extract<AnthropicContent, { type: 'text' }> => b.type === 'text')
      return textBlock?.text ?? ''
    }
    return ''
  }

  const handleToolCall = async (toolCall: LLMToolCall): Promise<string> => {
    if (toolCall.function.name === 'searchKnowledge') {
      const args = JSON.parse(toolCall.function.arguments) as { query: string; limit?: number }
      const cards = await api.knowledge.search(args.query, args.limit ?? 5)
      if (cards.length === 0) return 'No relevant knowledge cards found.'
      return cards
        .map((c) => `**${c.frontmatter.topic}**\n${c.content.slice(0, 300)}`)
        .join('\n\n---\n\n')
    }
    return 'Unknown tool'
  }

  const extractWriteBackProposal = (content: string): WriteBackProposal | null => {
    const match = content.match(/```write-back\n([\s\S]*?)\n```/)
    if (!match) return null
    try {
      const parsed = JSON.parse(match[1]) as WriteBackProposal
      return parsed
    } catch {
      return null
    }
  }

  const sendMessage = useCallback(async () => {
    if (!input.trim() || loading || !systemPrompt) return

    const userMsg: Message = { role: 'user', content: input }
    const newMessages = [...messages, userMsg]
    setMessages(newMessages)
    setInput('')
    setLoading(true)

    try {
      let finalContent: string

      if (apiType === 'anthropic') {
        finalContent = await callLLMAnthropic(newMessages)
        const assistantMsg: Message = { role: 'assistant', content: finalContent }
        setMessages([...newMessages, assistantMsg])
      } else {
        let current = [...newMessages]

        // Allow up to 3 tool call rounds
        finalContent = ''
        for (let round = 0; round < 3; round++) {
          const { content, toolCalls } = await callLLM(current)

          if (toolCalls && toolCalls.length > 0) {
            const toolCallsList = toolCalls as unknown as LLMToolCall[]
            // Must include the assistant message with tool_calls before tool results
            const assistantWithCalls: Message = { role: 'assistant', content: '', toolCalls: toolCallsList }
            const toolResults: Message[] = []
            for (const tc of toolCallsList) {
              const result = await handleToolCall(tc)
              toolResults.push({
                role: 'tool',
                content: result,
                toolCallId: tc.id,
                name: tc.function.name
              })
            }
            current = [...current, assistantWithCalls, ...toolResults]
            continue
          }

          finalContent = content
          const assistantMsg: Message = { role: 'assistant', content }
          setMessages([...current, assistantMsg])
          break
        }
      }

      const proposal = extractWriteBackProposal(finalContent)
      if (proposal) setWriteBackProposal(proposal)
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: `Error: ${String(err)}` }
      ])
    } finally {
      setLoading(false)
    }
  }, [input, loading, messages, systemPrompt, apiKey, apiType, apiBaseUrl, modelName])

  const handleWriteBack = async (confirmed: boolean): Promise<void> => {
    if (!writeBackProposal) return
    if (!confirmed) {
      setWriteBackProposal(null)
      return
    }

    try {
      const result = await api.agent.writeBack({
        type: writeBackProposal.type,
        id: writeBackProposal.id,
        content: writeBackProposal.content,
        frontmatter: writeBackProposal.frontmatter
      })

      if (result.success) {
        setWriteBackStatus('Written to Agent Layer! Skill Loader auto-triggered.')
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: `Written to Agent Layer at \`${result.filePath}\`. Skill Loader has been triggered to update your IDE context files.`
          }
        ])
      } else {
        setWriteBackStatus(`Error: ${result.error}`)
      }
    } catch (err) {
      setWriteBackStatus(`Error: ${String(err)}`)
    } finally {
      setWriteBackProposal(null)
      setTimeout(() => setWriteBackStatus(null), 4000)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent): void => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      sendMessage()
    }
  }

  if (noApiKey) {
    return (
      <div style={s.container}>
        <h2 style={s.title}>Distillation Chat</h2>
        <p style={{ color: '#718096', fontSize: 14 }}>
          No Model API key configured. Go to Settings → Model API to set up your API key and model.
        </p>
      </div>
    )
  }

  return (
    <div style={s.layout}>
      <div style={s.headerBar}>
        <h2 style={s.title}>Distillation Chat</h2>
        <span style={s.subtitle}>Full Agent Layer injected · {apiType === 'anthropic' ? 'Anthropic' : 'OpenAI-compatible'} · Model: {modelName}</span>
      </div>

      <div style={s.messages}>
        {messages.filter(m => m.role !== 'system').map((msg, i) => (
          <MessageBubble key={i} message={msg} />
        ))}
        {loading && (
          <div style={s.thinking}>
            <span style={s.thinkingDot}>●</span>
            <span style={s.thinkingDot}>●</span>
            <span style={s.thinkingDot}>●</span>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {writeBackProposal && (
        <div style={s.writeBackPanel}>
          <div style={s.writeBackTitle}>Write-back Proposal</div>
          <div style={s.writeBackDesc}>{writeBackProposal.description}</div>
          <div style={s.writeBackType}>
            Type: <code>{writeBackProposal.type}</code>
          </div>
          <pre style={s.writeBackContent}>{writeBackProposal.content}</pre>
          <div style={s.writeBackActions}>
            <button onClick={() => handleWriteBack(true)} style={s.btnConfirm}>
              Confirm & Write
            </button>
            <button onClick={() => handleWriteBack(false)} style={s.btnReject}>
              Reject
            </button>
          </div>
        </div>
      )}

      {writeBackStatus && <div style={s.statusBar}>{writeBackStatus}</div>}

      <div style={s.inputRow}>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Talk to your Agent Layer... (Cmd+Enter to send)"
          style={s.inputArea}
          rows={3}
          disabled={loading}
        />
        <button
          onClick={sendMessage}
          disabled={loading || !input.trim()}
          style={s.sendBtn}
        >
          Send
        </button>
      </div>
    </div>
  )
}

function MessageBubble({ message }: { message: Message }): React.ReactElement {
  const isUser = message.role === 'user'

  // Render write-back proposal blocks differently
  const renderContent = (content: string): React.ReactNode => {
    const parts = content.split(/(```write-back\n[\s\S]*?\n```)/g)
    return parts.map((part, i) => {
      if (part.startsWith('```write-back')) {
        return (
          <div key={i} style={bubbleStyles.proposalBlock}>
            <div style={{ fontSize: 11, color: '#f6ad55', marginBottom: 4 }}>
              Write-back Proposal (see below)
            </div>
          </div>
        )
      }
      return (
        <div key={i} style={{ whiteSpace: 'pre-wrap' }}>
          {part}
        </div>
      )
    })
  }

  return (
    <div style={{ ...bubbleStyles.row, justifyContent: isUser ? 'flex-end' : 'flex-start' }}>
      <div
        style={{
          ...bubbleStyles.bubble,
          background: isUser ? '#2b6cb0' : '#2d3748',
          color: isUser ? '#bee3f8' : '#e2e8f0',
          maxWidth: '75%'
        }}
      >
        {renderContent(message.content)}
      </div>
    </div>
  )
}

const bubbleStyles: Record<string, React.CSSProperties> = {
  row: { display: 'flex', marginBottom: 12 },
  bubble: { padding: '10px 14px', borderRadius: 10, fontSize: 14, lineHeight: 1.6 },
  proposalBlock: {
    padding: '6px 10px',
    background: '#744210',
    borderRadius: 4,
    marginTop: 4
  }
}

const s: Record<string, React.CSSProperties> = {
  layout: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    overflow: 'hidden'
  },
  headerBar: {
    padding: '16px 24px 12px',
    borderBottom: '1px solid #2d3748',
    flexShrink: 0
  },
  title: { margin: '0 0 4px', fontSize: 20, fontWeight: 700, color: '#e2e8f0' },
  subtitle: { fontSize: 12, color: '#718096' },
  container: { padding: '28px 32px', maxWidth: 600 },
  messages: {
    flex: 1,
    overflowY: 'auto',
    padding: '16px 24px',
    display: 'flex',
    flexDirection: 'column'
  },
  thinking: {
    display: 'flex',
    gap: 4,
    padding: '8px 0',
    opacity: 0.5
  },
  thinkingDot: {
    fontSize: 16,
    color: '#a0aec0',
    animation: 'pulse 1.5s ease-in-out infinite'
  },
  writeBackPanel: {
    margin: '0 24px 12px',
    padding: '14px 16px',
    background: '#1a3a1a',
    border: '1px solid #276749',
    borderRadius: 8,
    flexShrink: 0
  },
  writeBackTitle: {
    fontSize: 13,
    fontWeight: 700,
    color: '#68d391',
    marginBottom: 6
  },
  writeBackDesc: { fontSize: 13, color: '#e2e8f0', marginBottom: 8 },
  writeBackType: { fontSize: 12, color: '#718096', marginBottom: 8 },
  writeBackContent: {
    fontSize: 12,
    color: '#a0aec0',
    whiteSpace: 'pre-wrap',
    background: '#1a202c',
    padding: '8px 10px',
    borderRadius: 4,
    marginBottom: 10,
    maxHeight: 200,
    overflowY: 'auto'
  },
  writeBackActions: { display: 'flex', gap: 8 },
  btnConfirm: {
    padding: '6px 14px',
    background: '#276749',
    border: 'none',
    borderRadius: 5,
    color: '#9ae6b4',
    fontSize: 13,
    fontWeight: 600
  },
  btnReject: {
    padding: '6px 14px',
    background: '#742a2a',
    border: 'none',
    borderRadius: 5,
    color: '#feb2b2',
    fontSize: 13
  },
  statusBar: {
    padding: '8px 24px',
    fontSize: 12,
    color: '#68d391',
    background: '#1a3a1a',
    flexShrink: 0
  },
  inputRow: {
    display: 'flex',
    gap: 8,
    padding: '12px 24px 16px',
    borderTop: '1px solid #2d3748',
    flexShrink: 0
  },
  inputArea: {
    flex: 1,
    padding: '10px 12px',
    background: '#2d3748',
    border: '1px solid #4a5568',
    borderRadius: 6,
    color: '#e2e8f0',
    fontSize: 14,
    outline: 'none',
    resize: 'none',
    fontFamily: 'inherit'
  },
  sendBtn: {
    padding: '0 20px',
    background: '#4299e1',
    border: 'none',
    borderRadius: 6,
    color: '#fff',
    fontSize: 14,
    fontWeight: 600,
    alignSelf: 'flex-end',
    height: 40
  }
}
