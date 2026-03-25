import React, { useState, useEffect, useCallback } from 'react'
import { api } from '../hooks/useIPC'
import PermissionDialog from '../components/PermissionDialog'
import type {
  RegisteredPlugin,
  PluginStatusEvent,
  WorkflowRunStatus,
  PluginInputSchemaField
} from '../../../shared/types'

interface ExecutionState {
  status: WorkflowRunStatus | 'idle'
  result?: unknown
  error?: string
}

export default function ToolboxPage(): React.ReactElement {
  const [plugins, setPlugins] = useState<RegisteredPlugin[]>([])
  const [pendingApproval, setPendingApproval] = useState<RegisteredPlugin | null>(null)
  const [execStates, setExecStates] = useState<Record<string, ExecutionState>>({})
  const [formInputs, setFormInputs] = useState<Record<string, Record<string, string>>>({})
  const [expandedPlugin, setExpandedPlugin] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const loadPlugins = useCallback(async () => {
    const list = await api.plugins.list()
    setPlugins(list)
    setLoading(false)

    // Show permission dialog for first unapproved plugin (one at a time)
    const unapproved = list.find((p) => !p.approved)
    if (unapproved) setPendingApproval(unapproved)
  }, [])

  useEffect(() => {
    loadPlugins()

    const unsubscribe = api.plugins.onStatus((event: PluginStatusEvent) => {
      setExecStates((prev) => ({
        ...prev,
        [event.name]: {
          status: event.status,
          result: event.result,
          error: event.error
        }
      }))
    })

    return unsubscribe
  }, [loadPlugins])

  const handleApprove = async (): Promise<void> => {
    if (!pendingApproval) return
    await api.plugins.approvePlugin(pendingApproval.manifest.name)
    setPendingApproval(null)
    loadPlugins()
  }

  const handleDeny = async (): Promise<void> => {
    if (!pendingApproval) return
    await api.plugins.denyPlugin(pendingApproval.manifest.name)
    setPendingApproval(null)
    loadPlugins()
  }

  const handleRun = async (plugin: RegisteredPlugin): Promise<void> => {
    const name = plugin.manifest.name
    const inputs = formInputs[name] ?? {}

    // Build input from schema
    const input: Record<string, unknown> = {}
    for (const [key, field] of Object.entries(plugin.manifest.input_schema ?? {})) {
      const val = inputs[key] ?? (field as PluginInputSchemaField).default ?? ''
      input[key] = val
    }

    setExecStates((prev) => ({ ...prev, [name]: { status: 'running' } }))

    try {
      await api.plugins.run(name, input)
    } catch (err) {
      setExecStates((prev) => ({
        ...prev,
        [name]: { status: 'failed', error: err instanceof Error ? err.message : String(err) }
      }))
    }
  }

  const handleFormChange = (pluginName: string, field: string, value: string): void => {
    setFormInputs((prev) => ({
      ...prev,
      [pluginName]: { ...(prev[pluginName] ?? {}), [field]: value }
    }))
  }

  const approvedPlugins = plugins.filter((p) => p.approved)

  if (loading) return <div style={styles.container}>Loading plugins...</div>

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Toolbox</h2>

      {pendingApproval && (
        <PermissionDialog
          plugin={pendingApproval}
          onApprove={handleApprove}
          onDeny={handleDeny}
        />
      )}

      {/* PhotoSift quick-launch card */}
      <div style={styles.card}>
        <div style={styles.cardHeader}>
          <div>
            <div style={styles.pluginName}>PhotoSift</div>
            <div style={styles.pluginDesc}>AI-powered photo sorting and organization tool</div>
          </div>
          <button
            onClick={() => api.shell.launchExternal('PhotoSift')}
            style={styles.launchBtn}
          >
            Launch
          </button>
        </div>
      </div>

      {approvedPlugins.length === 0 && (
        <div style={styles.empty}>
          No approved plugins. Install plugins to ~/.life-console/plugins/
        </div>
      )}

      {approvedPlugins.map((plugin) => {
        const name = plugin.manifest.name
        const execState = execStates[name] ?? { status: 'idle' }
        const isExpanded = expandedPlugin === name
        const schema = plugin.manifest.input_schema ?? {}
        const hasInputs = Object.keys(schema).length > 0

        return (
          <div key={name} style={styles.card}>
            <div style={styles.cardHeader}>
              <div style={{ flex: 1 }}>
                <div style={styles.pluginName}>{plugin.manifest.display_name}</div>
                <div style={styles.pluginDesc}>{plugin.manifest.description}</div>
              </div>
              <div style={styles.cardActions}>
                {execState.status === 'running' ? (
                  <span style={styles.runningBadge}>Running...</span>
                ) : (
                  <button
                    onClick={() => {
                      if (hasInputs) {
                        setExpandedPlugin(isExpanded ? null : name)
                      } else {
                        handleRun(plugin)
                      }
                    }}
                    style={styles.runBtn}
                  >
                    Run
                  </button>
                )}
              </div>
            </div>

            {/* Input form */}
            {isExpanded && hasInputs && (
              <div style={styles.inputForm}>
                {Object.entries(schema).map(([key, fieldDef]) => {
                  const field = fieldDef as PluginInputSchemaField
                  return (
                    <div key={key} style={styles.formField}>
                      <label style={styles.fieldLabel}>
                        {key}
                        {field.required && <span style={{ color: '#fc8181' }}> *</span>}
                      </label>
                      {field.description && (
                        <div style={styles.fieldHint}>{field.description}</div>
                      )}
                      <input
                        type="text"
                        value={formInputs[name]?.[key] ?? String(field.default ?? '')}
                        onChange={(e) => handleFormChange(name, key, e.target.value)}
                        style={styles.fieldInput}
                        placeholder={String(field.default ?? '')}
                      />
                    </div>
                  )
                })}
                <button onClick={() => handleRun(plugin)} style={styles.runBtn}>
                  Execute
                </button>
              </div>
            )}

            {/* Status */}
            {execState.status === 'completed' && (
              <div style={{ ...styles.statusBox, background: '#1c4532', borderColor: '#276749' }}>
                Completed successfully.
              </div>
            )}
            {execState.status === 'failed' && (
              <div style={{ ...styles.statusBox, background: '#742a2a', borderColor: '#9b2c2c' }}>
                Failed: {execState.error}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    padding: '28px 32px',
    maxWidth: 800
  },
  title: {
    margin: '0 0 20px',
    fontSize: 22,
    fontWeight: 700,
    color: '#e2e8f0'
  },
  card: {
    padding: '16px 18px',
    background: '#16213e',
    borderRadius: 8,
    border: '1px solid #2d3748',
    marginBottom: 12
  },
  cardHeader: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 12
  },
  pluginName: {
    fontSize: 15,
    fontWeight: 600,
    color: '#e2e8f0',
    marginBottom: 4
  },
  pluginDesc: {
    fontSize: 13,
    color: '#718096',
    lineHeight: 1.4
  },
  cardActions: {
    flexShrink: 0
  },
  runBtn: {
    padding: '7px 18px',
    background: '#4299e1',
    border: 'none',
    borderRadius: 6,
    color: '#fff',
    fontSize: 13,
    fontWeight: 600
  },
  launchBtn: {
    padding: '7px 18px',
    background: '#805ad5',
    border: 'none',
    borderRadius: 6,
    color: '#fff',
    fontSize: 13,
    fontWeight: 600,
    flexShrink: 0
  },
  runningBadge: {
    padding: '7px 14px',
    background: '#744210',
    borderRadius: 6,
    color: '#fefcbf',
    fontSize: 13
  },
  inputForm: {
    marginTop: 14,
    borderTop: '1px solid #2d3748',
    paddingTop: 14,
    display: 'flex',
    flexDirection: 'column',
    gap: 12
  },
  formField: {
    display: 'flex',
    flexDirection: 'column',
    gap: 4
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: 600,
    color: '#a0aec0'
  },
  fieldHint: {
    fontSize: 11,
    color: '#718096'
  },
  fieldInput: {
    padding: '8px 10px',
    background: '#2d3748',
    border: '1px solid #4a5568',
    borderRadius: 5,
    color: '#e2e8f0',
    fontSize: 13,
    outline: 'none'
  },
  statusBox: {
    marginTop: 10,
    padding: '8px 12px',
    borderRadius: 5,
    border: '1px solid',
    fontSize: 13,
    color: '#e2e8f0'
  },
  empty: {
    color: '#718096',
    fontSize: 14,
    padding: '40px 0',
    textAlign: 'center'
  }
}
