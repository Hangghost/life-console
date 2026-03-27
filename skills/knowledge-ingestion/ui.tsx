import React, { useState, useEffect } from 'react'
import { api } from '../../src/renderer/src/hooks/useIPC'

interface KnowledgeCardDraft {
  topic: string
  tags: string[]
  content: string
  modified: boolean
}

interface IngestionResult {
  sourceTitle: string
  sourceContent: string
  sourceUrl?: string
  cards: KnowledgeCardDraft[]
  error?: string
}

interface Props {
  onRun: (input: unknown) => void
  result: unknown
}

export default function KnowledgeIngestionUI({ onRun, result }: Props): React.ReactElement {
  const [text, setText] = useState('')
  const [url, setUrl] = useState('')
  const [apiKey, setApiKey] = useState('')
  const [apiType, setApiType] = useState<'openai' | 'anthropic'>('openai')
  const [apiBaseUrl, setApiBaseUrl] = useState('https://api.openai.com/v1')
  const [modelName, setModelName] = useState('gpt-4o')
  const [draftCards, setDraftCards] = useState<KnowledgeCardDraft[]>([])
  const [draftSource, setDraftSource] = useState<{ title: string; content: string; url?: string } | null>(null)
  const [confirming, setConfirming] = useState(false)
  const [confirmResult, setConfirmResult] = useState<{ sourceFilePath: string; cardFilePaths: string[] } | null>(null)
  const [rejected, setRejected] = useState<Set<number>>(new Set())

  useEffect(() => {
    api.settings.get().then((s) => {
      if (s.model_api_key) setApiKey(s.model_api_key)
      if (s.model_api_type) setApiType(s.model_api_type)
      if (s.model_api_base_url) setApiBaseUrl(s.model_api_base_url)
      if (s.model_name) setModelName(s.model_name)
    })
  }, [])

  useEffect(() => {
    if (!result) return
    const r = result as IngestionResult
    if (r.cards && r.cards.length > 0) {
      setDraftCards(r.cards.map((c) => ({ ...c })))
      setDraftSource({ title: r.sourceTitle, content: r.sourceContent, url: r.sourceUrl })
      setRejected(new Set())
      setConfirmResult(null)
    }
  }, [result])

  const handleRun = (): void => {
    if (!text.trim() && !url.trim()) return
    onRun({ text: text || undefined, url: url || undefined, apiKey, apiType, apiBaseUrl, modelName })
  }

  const updateCard = (index: number, updates: Partial<KnowledgeCardDraft>): void => {
    setDraftCards((prev) =>
      prev.map((c, i) => (i === index ? { ...c, ...updates, modified: true } : c))
    )
  }

  const toggleReject = (index: number): void => {
    setRejected((prev) => {
      const next = new Set(prev)
      if (next.has(index)) next.delete(index)
      else next.add(index)
      return next
    })
  }

  const handleConfirmAll = async (): Promise<void> => {
    if (!draftSource) return
    setConfirming(true)
    const kbDir = (await api.settings.get()).kb_directory
    if (!kbDir) {
      alert('Knowledge Base directory not configured. Set it in Settings.')
      setConfirming(false)
      return
    }

    const confirmedCards = draftCards
      .filter((_, i) => !rejected.has(i))
      .map((c) => ({
        topic: c.topic,
        tags: c.tags,
        content: c.content,
        source_type: c.modified ? ('user_defined' as const) : ('ai_confirmed' as const)
      }))

    try {
      const res = await api.knowledge.confirmCards({
        sourceTitle: draftSource.title,
        sourceContent: draftSource.content,
        sourceUrl: draftSource.url,
        cards: confirmedCards
      })
      setConfirmResult(res)
      setDraftCards([])
    } catch (err) {
      alert(`Error saving cards: ${String(err)}`)
    } finally {
      setConfirming(false)
    }
  }

  if (confirmResult) {
    return (
      <div style={s.container}>
        <h2 style={s.title}>Cards Saved!</h2>
        <p style={{ color: '#68d391', fontSize: 14 }}>
          {confirmResult.cardFilePaths.length} cards written to Knowledge Base.
        </p>
        <button
          style={s.btnPrimary}
          onClick={() => {
            setConfirmResult(null)
            setText('')
            setUrl('')
          }}
        >
          Ingest Another
        </button>
      </div>
    )
  }

  const ingestionResult = result as IngestionResult | null

  return (
    <div style={s.container}>
      <h2 style={s.title}>Knowledge Ingestion</h2>
      <p style={s.desc}>Paste article text or provide a URL. AI splits it into atomic KnowledgeCards.</p>

      <div style={s.section}>
        <label style={s.label}>Article Text</label>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Paste article content here..."
          style={s.textarea}
          rows={6}
        />
      </div>

      <div style={s.section}>
        <label style={s.label}>Or URL</label>
        <input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://..."
          style={s.input}
        />
      </div>

      <div style={s.row}>
        <div style={s.fieldSmall}>
          <label style={s.label}>API Key</label>
          <input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="sk-..."
            style={s.input}
          />
        </div>
        <div style={s.fieldSmall}>
          <label style={s.label}>Model</label>
          <input
            value={modelName}
            onChange={(e) => setModelName(e.target.value)}
            style={s.input}
          />
        </div>
      </div>

      <button onClick={handleRun} style={s.btnPrimary}>
        Analyze & Extract Cards
      </button>

      {ingestionResult?.error && (
        <div style={s.errorBox}>Error: {ingestionResult.error}</div>
      )}

      {draftCards.length > 0 && (
        <div style={{ marginTop: 32 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <h3 style={s.sectionTitle}>
              Draft Cards ({draftCards.length - rejected.size} / {draftCards.length} to confirm)
            </h3>
            <button
              onClick={handleConfirmAll}
              disabled={confirming || rejected.size === draftCards.length}
              style={s.btnConfirm}
            >
              {confirming ? 'Saving...' : 'Confirm All'}
            </button>
          </div>

          {draftCards.map((card, i) => (
            <div
              key={i}
              style={{
                ...s.card,
                opacity: rejected.has(i) ? 0.4 : 1,
                borderColor: rejected.has(i) ? '#4a5568' : '#2b6cb0'
              }}
            >
              <div style={s.cardHeader}>
                <input
                  value={card.topic}
                  onChange={(e) => updateCard(i, { topic: e.target.value })}
                  style={s.topicInput}
                  placeholder="Topic"
                />
                <button
                  onClick={() => toggleReject(i)}
                  style={rejected.has(i) ? s.btnRestore : s.btnReject}
                >
                  {rejected.has(i) ? 'Restore' : 'Reject'}
                </button>
              </div>
              <textarea
                value={card.content}
                onChange={(e) => updateCard(i, { content: e.target.value })}
                style={s.cardTextarea}
                rows={4}
              />
              <input
                value={card.tags.join(', ')}
                onChange={(e) =>
                  updateCard(i, {
                    tags: e.target.value
                      .split(',')
                      .map((t) => t.trim())
                      .filter(Boolean)
                  })
                }
                placeholder="tags, comma, separated"
                style={{ ...s.input, marginTop: 6, fontSize: 12 }}
              />
              {card.modified && (
                <span style={{ fontSize: 11, color: '#f6ad55', marginTop: 4, display: 'block' }}>
                  Modified — will be saved as user_defined
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

const s: Record<string, React.CSSProperties> = {
  container: { padding: '28px 32px', maxWidth: 680 },
  title: { margin: '0 0 8px', fontSize: 22, fontWeight: 700, color: '#e2e8f0' },
  desc: { margin: '0 0 24px', color: '#718096', fontSize: 14 },
  section: { marginBottom: 16 },
  label: { display: 'block', marginBottom: 6, fontSize: 13, fontWeight: 600, color: '#a0aec0' },
  sectionTitle: { margin: 0, fontSize: 16, fontWeight: 700, color: '#e2e8f0' },
  textarea: {
    width: '100%',
    padding: '10px 12px',
    background: '#2d3748',
    border: '1px solid #4a5568',
    borderRadius: 6,
    color: '#e2e8f0',
    fontSize: 13,
    outline: 'none',
    resize: 'vertical' as const,
    fontFamily: 'inherit',
    boxSizing: 'border-box' as const
  },
  input: {
    width: '100%',
    padding: '8px 10px',
    background: '#2d3748',
    border: '1px solid #4a5568',
    borderRadius: 5,
    color: '#e2e8f0',
    fontSize: 13,
    outline: 'none',
    boxSizing: 'border-box' as const
  },
  row: { display: 'flex', gap: 12, marginBottom: 16 },
  fieldSmall: { flex: 1 },
  btnPrimary: {
    padding: '9px 20px',
    background: '#4299e1',
    border: 'none',
    borderRadius: 6,
    color: '#fff',
    fontSize: 14,
    fontWeight: 600
  },
  btnConfirm: {
    padding: '7px 16px',
    background: '#48bb78',
    border: 'none',
    borderRadius: 6,
    color: '#fff',
    fontSize: 13,
    fontWeight: 600
  },
  btnReject: {
    padding: '4px 10px',
    background: '#c53030',
    border: 'none',
    borderRadius: 4,
    color: '#fff',
    fontSize: 12
  },
  btnRestore: {
    padding: '4px 10px',
    background: '#2d3748',
    border: '1px solid #4a5568',
    borderRadius: 4,
    color: '#a0aec0',
    fontSize: 12
  },
  errorBox: {
    marginTop: 16,
    padding: '10px 14px',
    background: '#742a2a',
    border: '1px solid #9b2c2c',
    borderRadius: 6,
    color: '#feb2b2',
    fontSize: 13
  },
  card: {
    padding: '14px 16px',
    background: '#1a202c',
    border: '1px solid #2b6cb0',
    borderRadius: 8,
    marginBottom: 12,
    transition: 'opacity 0.2s, border-color 0.2s'
  },
  cardHeader: { display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 },
  topicInput: {
    flex: 1,
    padding: '5px 8px',
    background: '#2d3748',
    border: '1px solid #4a5568',
    borderRadius: 4,
    color: '#90cdf4',
    fontSize: 14,
    fontWeight: 600,
    outline: 'none'
  },
  cardTextarea: {
    width: '100%',
    padding: '8px 10px',
    background: '#2d3748',
    border: '1px solid #4a5568',
    borderRadius: 4,
    color: '#e2e8f0',
    fontSize: 13,
    outline: 'none',
    resize: 'vertical' as const,
    fontFamily: 'inherit',
    boxSizing: 'border-box' as const
  }
}
