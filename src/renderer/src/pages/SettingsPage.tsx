import React, { useState, useEffect } from 'react'
import { api } from '../hooks/useIPC'
import type { AppSettings, SkillLoaderTarget, MCPStatus } from '../../../shared/types'

export default function SettingsPage(): React.ReactElement {
  const [settings, setSettings] = useState<AppSettings>({})
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(true)
  const [mcpStatus, setMcpStatus] = useState<MCPStatus | null>(null)
  const [targets, setTargets] = useState<SkillLoaderTarget[]>([])
  const [newTargetName, setNewTargetName] = useState('')
  const [newTargetPath, setNewTargetPath] = useState('')
  const [copied, setCopied] = useState<string | null>(null)

  useEffect(() => {
    loadAll()
  }, [])

  const loadAll = async (): Promise<void> => {
    const [s, status] = await Promise.all([api.settings.get(), api.mcp.getStatus()])
    setSettings(s)
    setMcpStatus(status)
    try {
      setTargets(s.skill_loader_targets ? JSON.parse(s.skill_loader_targets) : [])
    } catch {
      setTargets([])
    }
    setLoading(false)
  }

  const update = (key: keyof AppSettings, value: unknown): void => {
    setSettings((prev) => ({ ...prev, [key]: value }))
  }

  const handleSave = async (): Promise<void> => {
    await api.settings.set(settings)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const handleSelectKbDir = async (): Promise<void> => {
    const path = await api.settings.openFolderDialog()
    if (path) update('kb_directory', path)
  }

  const saveTargets = async (newTargets: SkillLoaderTarget[]): Promise<void> => {
    setTargets(newTargets)
    await api.settings.set({ skill_loader_targets: JSON.stringify(newTargets) })
  }

  const addTarget = async (): Promise<void> => {
    if (!newTargetName.trim() || !newTargetPath.trim()) return
    const target: SkillLoaderTarget = {
      name: newTargetName.trim(),
      path: newTargetPath.trim(),
      enabled: true
    }
    const newTargets = [...targets, target]
    await saveTargets(newTargets)
    setNewTargetName('')
    setNewTargetPath('')
  }

  const removeTarget = async (index: number): Promise<void> => {
    const newTargets = targets.filter((_, i) => i !== index)
    await saveTargets(newTargets)
  }

  const toggleTarget = async (index: number): Promise<void> => {
    const newTargets = targets.map((t, i) =>
      i === index ? { ...t, enabled: !t.enabled } : t
    )
    await saveTargets(newTargets)
  }

  const copyMcpConfig = (target: 'claude-code' | 'cursor'): void => {
    const port = settings.mcp_port ?? 7777
    let snippet: string

    if (target === 'claude-code') {
      snippet = JSON.stringify(
        {
          mcpServers: {
            'life-console': {
              url: `http://localhost:${port}/sse`
            }
          }
        },
        null,
        2
      )
    } else {
      snippet = JSON.stringify(
        {
          mcpServers: [
            {
              name: 'life-console',
              serverUrl: `http://localhost:${port}/sse`
            }
          ]
        },
        null,
        2
      )
    }

    navigator.clipboard.writeText(snippet)
    setCopied(target)
    setTimeout(() => setCopied(null), 2000)
  }

  if (loading) return <div style={s.container}>Loading...</div>

  return (
    <div style={s.container}>
      <h2 style={s.title}>Settings</h2>

      {/* ─── Claude API Key ─── */}
      <div style={s.section}>
        <label style={s.label}>Claude API Key</label>
        <p style={s.hint}>For Claude-based skills. Stored locally.</p>
        <input
          type="password"
          value={settings.claudeApiKey ?? ''}
          onChange={(e) => update('claudeApiKey', e.target.value)}
          placeholder="sk-ant-..."
          style={s.input}
        />
      </div>

      {/* ─── Knowledge Base ─── */}
      <div style={s.section}>
        <h3 style={s.sectionTitle}>Knowledge Base</h3>
        <label style={s.label}>KB Directory</label>
        <p style={s.hint}>Obsidian-compatible Markdown directory for KnowledgeCards.</p>
        <div style={s.row}>
          <input
            value={settings.kb_directory ?? ''}
            onChange={(e) => update('kb_directory', e.target.value)}
            placeholder="/Users/you/Documents/knowledge"
            style={{ ...s.input, flex: 1 }}
          />
          <button onClick={handleSelectKbDir} style={s.browseBtn}>
            Browse
          </button>
        </div>
      </div>

      {/* ─── Model API ─── */}
      <div style={s.section}>
        <h3 style={s.sectionTitle}>Model API</h3>
        <p style={s.hint}>Used for Knowledge Ingestion and Distillation Chat.</p>

        <div style={s.field}>
          <label style={s.label}>API Type</label>
          <select
            value={settings.model_api_type ?? 'openai'}
            onChange={(e) => {
              const type = e.target.value as 'openai' | 'anthropic'
              update('model_api_type', type)
              if (type === 'anthropic') {
                update('model_api_base_url', 'https://api.anthropic.com/v1')
                update('model_name', 'claude-haiku-4-5-20251001')
              } else {
                update('model_api_base_url', 'https://api.openai.com/v1')
                update('model_name', 'gpt-4o')
              }
            }}
            style={s.select}
          >
            <option value="openai">OpenAI-compatible (OpenAI, OpenRouter, etc.)</option>
            <option value="anthropic">Anthropic (Claude direct API)</option>
          </select>
        </div>

        <div style={s.field}>
          <label style={s.label}>API Key</label>
          <input
            type="password"
            value={settings.model_api_key ?? ''}
            onChange={(e) => update('model_api_key', e.target.value)}
            placeholder={settings.model_api_type === 'anthropic' ? 'sk-ant-...' : 'sk-...'}
            style={s.input}
          />
        </div>

        <div style={s.field}>
          <label style={s.label}>API Base URL</label>
          <input
            value={settings.model_api_base_url ?? 'https://api.openai.com/v1'}
            onChange={(e) => update('model_api_base_url', e.target.value)}
            style={s.input}
          />
        </div>

        <div style={s.field}>
          <label style={s.label}>Model Name</label>
          <input
            value={settings.model_name ?? 'gpt-4o'}
            onChange={(e) => update('model_name', e.target.value)}
            placeholder={settings.model_api_type === 'anthropic' ? 'claude-haiku-4-5-20251001' : 'gpt-4o'}
            style={s.input}
          />
        </div>
      </div>

      {/* ─── MCP Server ─── */}
      <div style={s.section}>
        <h3 style={s.sectionTitle}>MCP Server</h3>

        <div style={s.mcpStatus}>
          <span
            style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: mcpStatus?.running ? '#68d391' : '#fc8181',
              display: 'inline-block',
              marginRight: 8
            }}
          />
          <span style={{ fontSize: 14, color: '#e2e8f0' }}>
            {mcpStatus?.running ? `Running on ${mcpStatus.url}` : 'Not running'}
          </span>
        </div>

        <div style={s.field}>
          <label style={s.label}>Port</label>
          <input
            type="number"
            value={String(settings.mcp_port ?? 7777)}
            onChange={(e) => update('mcp_port', Number(e.target.value))}
            style={{ ...s.input, width: 120 }}
          />
        </div>

        <div style={s.mcpCopy}>
          <button onClick={() => copyMcpConfig('claude-code')} style={s.copyBtn}>
            {copied === 'claude-code' ? 'Copied!' : 'Copy for Claude Code'}
          </button>
          <button onClick={() => copyMcpConfig('cursor')} style={s.copyBtn}>
            {copied === 'cursor' ? 'Copied!' : 'Copy for Cursor'}
          </button>
        </div>
      </div>

      {/* ─── Skill Loader Targets ─── */}
      <div style={s.section}>
        <h3 style={s.sectionTitle}>Skill Loader Targets</h3>
        <p style={s.hint}>
          IDE context files to update when running Skill Loader. Use name "claude-code" for Claude
          Code (auto-path) or "cursor" for a custom path.
        </p>

        {targets.map((target, i) => (
          <div key={i} style={s.targetRow}>
            <input
              type="checkbox"
              checked={target.enabled}
              onChange={() => toggleTarget(i)}
              style={{ marginRight: 8 }}
            />
            <code style={s.targetName}>{target.name}</code>
            <span style={s.targetPath}>{target.path || '(auto)'}</span>
            <button onClick={() => removeTarget(i)} style={s.removeBtn}>
              Remove
            </button>
          </div>
        ))}

        <div style={s.addTargetRow}>
          <input
            value={newTargetName}
            onChange={(e) => setNewTargetName(e.target.value)}
            placeholder="claude-code or cursor"
            style={{ ...s.input, width: 160 }}
          />
          <input
            value={newTargetPath}
            onChange={(e) => setNewTargetPath(e.target.value)}
            placeholder="/path/to/file.md (or leave empty for claude-code)"
            style={{ ...s.input, flex: 1 }}
          />
          <button onClick={addTarget} style={s.addBtn}>
            Add
          </button>
        </div>
      </div>

      <button onClick={handleSave} style={s.saveBtn}>
        {saved ? 'Saved!' : 'Save All Settings'}
      </button>
    </div>
  )
}

const s: Record<string, React.CSSProperties> = {
  container: {
    padding: '32px 40px',
    maxWidth: 680,
    overflowY: 'auto',
    height: '100%',
    boxSizing: 'border-box'
  },
  title: { margin: '0 0 28px', fontSize: 22, fontWeight: 700, color: '#e2e8f0' },
  section: { marginBottom: 32 },
  sectionTitle: {
    margin: '0 0 12px',
    fontSize: 16,
    fontWeight: 700,
    color: '#e2e8f0',
    borderBottom: '1px solid #2d3748',
    paddingBottom: 8
  },
  label: { display: 'block', marginBottom: 6, fontSize: 14, fontWeight: 600, color: '#cbd5e0' },
  hint: { margin: '0 0 10px', fontSize: 12, color: '#718096', lineHeight: 1.5 },
  field: { marginBottom: 14 },
  select: {
    width: '100%',
    padding: '10px 12px',
    background: '#2d3748',
    border: '1px solid #4a5568',
    borderRadius: 6,
    color: '#e2e8f0',
    fontSize: 14,
    outline: 'none',
    boxSizing: 'border-box' as const
  },
  input: {
    width: '100%',
    padding: '10px 12px',
    background: '#2d3748',
    border: '1px solid #4a5568',
    borderRadius: 6,
    color: '#e2e8f0',
    fontSize: 14,
    outline: 'none',
    boxSizing: 'border-box' as const
  },
  row: { display: 'flex', gap: 8, alignItems: 'center' },
  browseBtn: {
    padding: '10px 16px',
    background: '#2d3748',
    border: '1px solid #4a5568',
    borderRadius: 6,
    color: '#a0aec0',
    fontSize: 13,
    flexShrink: 0
  },
  mcpStatus: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: 16,
    padding: '8px 12px',
    background: '#1a202c',
    borderRadius: 6
  },
  mcpCopy: { display: 'flex', gap: 8, marginTop: 8 },
  copyBtn: {
    padding: '8px 14px',
    background: '#2d3748',
    border: '1px solid #4a5568',
    borderRadius: 5,
    color: '#a0aec0',
    fontSize: 12
  },
  targetRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '8px 10px',
    background: '#1a202c',
    borderRadius: 5,
    marginBottom: 6
  },
  targetName: {
    fontSize: 13,
    color: '#90cdf4',
    fontFamily: 'monospace',
    background: '#2d3748',
    padding: '2px 6px',
    borderRadius: 3
  },
  targetPath: { flex: 1, fontSize: 12, color: '#718096', overflow: 'hidden', textOverflow: 'ellipsis' },
  removeBtn: {
    padding: '4px 10px',
    background: 'transparent',
    border: '1px solid #742a2a',
    borderRadius: 4,
    color: '#fc8181',
    fontSize: 12
  },
  addTargetRow: { display: 'flex', gap: 8, marginTop: 10, alignItems: 'center' },
  addBtn: {
    padding: '10px 16px',
    background: '#2b6cb0',
    border: 'none',
    borderRadius: 6,
    color: '#fff',
    fontSize: 13,
    fontWeight: 600,
    flexShrink: 0
  },
  saveBtn: {
    marginTop: 12,
    padding: '10px 24px',
    background: '#4299e1',
    border: 'none',
    borderRadius: 6,
    color: '#fff',
    fontSize: 14,
    fontWeight: 600
  }
}
