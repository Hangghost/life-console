import React, { useState, useEffect } from 'react'
import { api } from '../hooks/useIPC'

export default function SettingsPage(): React.ReactElement {
  const [apiKey, setApiKey] = useState('')
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.settings.get().then((s) => {
      setApiKey(s.claudeApiKey ?? '')
      setLoading(false)
    })
  }, [])

  const handleSave = async (): Promise<void> => {
    await api.settings.set({ claudeApiKey: apiKey })
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  if (loading) return <div style={styles.container}>Loading...</div>

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Settings</h2>

      <div style={styles.section}>
        <label style={styles.label}>Claude API Key</label>
        <p style={styles.hint}>
          Required for Inbox AI inference and plugin LLM calls. Key is stored locally and never
          sent to any server other than Anthropic.
        </p>
        <input
          type="password"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          placeholder="sk-ant-..."
          style={styles.input}
        />
        <button onClick={handleSave} style={styles.saveBtn}>
          {saved ? 'Saved!' : 'Save'}
        </button>
      </div>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    padding: '32px 40px',
    maxWidth: 600
  },
  title: {
    margin: '0 0 24px',
    fontSize: 22,
    fontWeight: 700,
    color: '#e2e8f0'
  },
  section: {
    marginBottom: 32
  },
  label: {
    display: 'block',
    marginBottom: 6,
    fontSize: 14,
    fontWeight: 600,
    color: '#cbd5e0'
  },
  hint: {
    margin: '0 0 10px',
    fontSize: 12,
    color: '#718096',
    lineHeight: 1.5
  },
  input: {
    width: '100%',
    padding: '10px 12px',
    background: '#2d3748',
    border: '1px solid #4a5568',
    borderRadius: 6,
    color: '#e2e8f0',
    fontSize: 14,
    outline: 'none'
  },
  saveBtn: {
    marginTop: 12,
    padding: '8px 20px',
    background: '#4299e1',
    border: 'none',
    borderRadius: 6,
    color: '#fff',
    fontSize: 14,
    fontWeight: 600
  }
}
