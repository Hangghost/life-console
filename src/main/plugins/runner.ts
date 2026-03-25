import { readFileSync, writeFileSync } from 'fs'
import { join } from 'path'
import Database from 'better-sqlite3'
import Anthropic from '@anthropic-ai/sdk'
import { createObject, createRelation, updateObject, queryObjects } from '../db/queries'
import type {
  RegisteredPlugin,
  PluginStatusEvent,
  WorkflowRunProperties
} from '../../shared/types'

export interface WorkflowContext {
  llm: {
    ask: (prompt: string, options?: { model?: string; maxTokens?: number }) => Promise<{ text: string }>
  }
  tools: {
    fetchUrl: (url: string, options?: { method?: string; headers?: Record<string, string>; body?: string }) => Promise<{ status: number; text: string }>
    readFile: (path: string) => Promise<string>
    writeFile: (path: string, content: string) => Promise<void>
  }
  store: {
    create: (type: string, data: { title?: string; content?: string; properties?: Record<string, unknown>; source?: string }) => Promise<{ id: string }>
    query: (filter: { type?: string; status?: string; limit?: number }) => Promise<unknown[]>
  }
}

interface RunPluginOptions {
  plugin: RegisteredPlugin
  input: Record<string, unknown>
  db: Database.Database
  apiKey?: string
  onStatus: (event: PluginStatusEvent) => void
}

export async function runPlugin(options: RunPluginOptions): Promise<string> {
  const { plugin, input, db, apiKey, onStatus } = options
  const { manifest, pluginDir } = plugin

  // Create a workflow_run object
  const runProps: WorkflowRunProperties = {
    tool_name: manifest.name,
    tool_version: manifest.version,
    input_params: input,
    status: 'running'
  }
  const runObj = createObject(db, {
    type: 'workflow_run',
    title: `${manifest.display_name} run`,
    properties: runProps,
    source: manifest.name
  })

  onStatus({ name: manifest.name, status: 'running', workflowRunId: runObj.id })

  // Build WorkflowContext
  const context: WorkflowContext = {
    llm: {
      ask: async (prompt, opts = {}) => {
        if (!apiKey) throw new Error('Claude API key not configured')
        const client = new Anthropic({ apiKey })
        const msg = await client.messages.create({
          model: opts.model ?? 'claude-haiku-4-5-20251001',
          max_tokens: opts.maxTokens ?? 1000,
          messages: [{ role: 'user', content: prompt }]
        })
        const text = msg.content[0].type === 'text' ? msg.content[0].text : ''
        return { text }
      }
    },
    tools: {
      fetchUrl: async (url, opts = {}) => {
        const res = await fetch(url, {
          method: opts.method ?? 'GET',
          headers: opts.headers,
          body: opts.body
        })
        const text = await res.text()
        return { status: res.status, text }
      },
      readFile: async (path) => readFileSync(path, 'utf-8'),
      writeFile: async (path, content) => writeFileSync(path, content, 'utf-8')
    },
    store: {
      create: async (type, data) => {
        const obj = createObject(db, {
          type: type as never,
          title: data.title,
          content: data.content,
          properties: data.properties as never,
          source: data.source ?? manifest.name
        })
        return { id: obj.id }
      },
      query: async (filter) => {
        return queryObjects(db, filter as never)
      }
    }
  }

  try {
    // Load and execute the plugin workflow
    const entryPath = join(pluginDir, manifest.entry)
    // Register tsx for TypeScript plugin files
    if (entryPath.endsWith('.ts')) {
      try {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        require('tsx/cjs')
      } catch {
        // tsx already registered or not available
      }
    }
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const mod = require(entryPath) as { run: (input: unknown, ctx: WorkflowContext) => Promise<unknown> }
    const result = await mod.run(input, context)

    // Handle output_mapping
    const outputObjectIds: string[] = []
    if (manifest.output?.auto_create_object && result && typeof result === 'object') {
      const output = manifest.output
      const resultMap = result as Record<string, unknown>

      let title = output.title_template ?? ''
      // Replace template variables like {{video_title}}
      title = title.replace(/\{\{(\w+)\}\}/g, (_, key: string) => String(resultMap[key] ?? ''))

      const content = output.content_field ? String(resultMap[output.content_field] ?? '') : undefined

      const outputObj = createObject(db, {
        type: output.output_type ?? 'note',
        title: title || undefined,
        content,
        source: manifest.name
      })
      outputObjectIds.push(outputObj.id)

      // Create produces relation
      createRelation(db, { from_id: runObj.id, to_id: outputObj.id, type: 'produces' })
    }

    // Update workflow_run status to completed
    updateObject(db, {
      id: runObj.id,
      properties: {
        ...runProps,
        status: 'completed',
        output_object_ids: outputObjectIds
      } as WorkflowRunProperties
    })

    onStatus({ name: manifest.name, status: 'completed', result, workflowRunId: runObj.id })
    return runObj.id
  } catch (err) {
    updateObject(db, {
      id: runObj.id,
      properties: { ...runProps, status: 'failed' } as WorkflowRunProperties
    })
    onStatus({
      name: manifest.name,
      status: 'failed',
      error: err instanceof Error ? err.message : String(err),
      workflowRunId: runObj.id
    })
    throw err
  }
}
