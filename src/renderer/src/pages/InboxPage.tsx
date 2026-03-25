import React, { useState, useEffect, useCallback } from 'react'
import { api } from '../hooks/useIPC'
import InferenceConfirmation from '../components/InferenceConfirmation'
import type { LifeObject, InferenceResult, TaskProperties, NoteProperties, AIMetadataCorrection } from '../../../shared/types'

interface PendingInference {
  [objectId: string]: InferenceResult
}

export default function InboxPage(): React.ReactElement {
  const [items, setItems] = useState<LifeObject[]>([])
  const [inputText, setInputText] = useState('')
  const [pending, setPending] = useState<PendingInference>({})
  const [noApiKey, setNoApiKey] = useState(false)
  const [loading, setLoading] = useState(true)

  const loadItems = useCallback(async () => {
    const results = await api.objects.query({ type: 'inbox_item' })
    setItems(results)
    setLoading(false)
  }, [])

  useEffect(() => {
    loadItems()

    // Listen for inference results
    const unsubscribe = api.inbox.onInfer((result) => {
      if (result.type === null && result.confidence === 0) {
        // Signals missing API key
        setNoApiKey(true)
        return
      }
      setPending((prev) => ({ ...prev, [result.objectId]: result }))
    })

    return unsubscribe
  }, [loadItems])

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault()
    const text = inputText.trim()
    if (!text) return

    setInputText('')

    const obj = await api.objects.create({
      type: 'inbox_item',
      content: text,
      source: 'manual',
      properties: { raw_input: text }
    })

    setItems((prev) => [obj, ...prev])

    // Trigger async inference in main process
    // We use a low-level ipcRenderer workaround via a hidden channel
    // The preload exposes it as a fire-and-forget via window event
    window.dispatchEvent(
      new CustomEvent('inbox:trigger-infer', { detail: { id: obj.id, content: text } })
    )
  }

  const handleConfirm = async (item: LifeObject, inference: InferenceResult): Promise<void> => {
    if (!inference.type) return

    const corrections = item.ai_metadata?.user_corrections ?? []
    const newCorrection: AIMetadataCorrection = {
      field: 'type',
      from: 'inbox_item',
      to: inference.type,
      timestamp: new Date().toISOString()
    }

    await api.objects.update({
      id: item.id,
      type: inference.type,
      title: inference.title,
      properties: inference.properties as TaskProperties | NoteProperties,
      ai_metadata: {
        ...item.ai_metadata,
        inferred_type: inference.type,
        inference_confidence: inference.confidence,
        user_corrections: [...corrections, newCorrection]
      }
    })

    setPending((prev) => {
      const next = { ...prev }
      delete next[item.id]
      return next
    })
    loadItems()
  }

  const handleOverride = async (
    item: LifeObject,
    targetType: 'task' | 'note'
  ): Promise<void> => {
    const inference = pending[item.id]
    const corrections = item.ai_metadata?.user_corrections ?? []
    const newCorrection: AIMetadataCorrection = {
      field: 'type',
      from: inference?.type ?? 'inbox_item',
      to: targetType,
      timestamp: new Date().toISOString()
    }

    await api.objects.update({
      id: item.id,
      type: targetType,
      ai_metadata: {
        ...item.ai_metadata,
        inferred_type: targetType,
        user_corrections: [...corrections, newCorrection]
      }
    })

    setPending((prev) => {
      const next = { ...prev }
      delete next[item.id]
      return next
    })
    loadItems()
  }

  const handleKeep = (itemId: string): void => {
    setPending((prev) => {
      const next = { ...prev }
      delete next[itemId]
      return next
    })
  }

  const handleDelete = async (id: string): Promise<void> => {
    await api.objects.delete(id)
    setItems((prev) => prev.filter((i) => i.id !== id))
    setPending((prev) => {
      const next = { ...prev }
      delete next[id]
      return next
    })
  }

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Inbox</h2>

      {noApiKey && (
        <div style={styles.warningBanner}>
          Claude API key not set. AI inference is disabled. Go to Settings to configure it.
        </div>
      )}

      {/* Input */}
      <form onSubmit={handleSubmit} style={styles.inputForm}>
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Capture anything... (press Enter to save)"
          style={styles.input}
          autoFocus
        />
        <button type="submit" style={styles.submitBtn}>Add</button>
      </form>

      {/* List */}
      {loading ? (
        <div style={styles.empty}>Loading...</div>
      ) : items.length === 0 ? (
        <div style={styles.empty}>Inbox is empty. Add something above!</div>
      ) : (
        <div style={styles.list}>
          {items.map((item) => (
            <div key={item.id} style={styles.card}>
              <div style={styles.cardHeader}>
                <span style={styles.content}>{item.content || item.title}</span>
                <button
                  onClick={() => handleDelete(item.id)}
                  style={styles.deleteBtn}
                  title="Archive"
                >
                  ×
                </button>
              </div>
              <div style={styles.meta}>
                {new Date(item.created_at).toLocaleString()}
              </div>
              {pending[item.id] && (
                <InferenceConfirmation
                  item={item}
                  inference={pending[item.id]}
                  onConfirm={(result) => handleConfirm(item, result)}
                  onOverride={(type) => handleOverride(item, type)}
                  onKeep={() => handleKeep(item.id)}
                />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    padding: '28px 32px',
    maxWidth: 720
  },
  title: {
    margin: '0 0 20px',
    fontSize: 22,
    fontWeight: 700,
    color: '#e2e8f0'
  },
  warningBanner: {
    marginBottom: 16,
    padding: '10px 14px',
    background: '#744210',
    borderRadius: 6,
    fontSize: 13,
    color: '#fefcbf'
  },
  inputForm: {
    display: 'flex',
    gap: 8,
    marginBottom: 24
  },
  input: {
    flex: 1,
    padding: '10px 14px',
    background: '#2d3748',
    border: '1px solid #4a5568',
    borderRadius: 8,
    color: '#e2e8f0',
    fontSize: 14,
    outline: 'none'
  },
  submitBtn: {
    padding: '10px 18px',
    background: '#4299e1',
    border: 'none',
    borderRadius: 8,
    color: '#fff',
    fontSize: 14,
    fontWeight: 600
  },
  list: {
    display: 'flex',
    flexDirection: 'column',
    gap: 12
  },
  card: {
    padding: '14px 16px',
    background: '#16213e',
    borderRadius: 8,
    border: '1px solid #2d3748'
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 8
  },
  content: {
    flex: 1,
    fontSize: 14,
    color: '#e2e8f0',
    lineHeight: 1.5,
    wordBreak: 'break-word'
  },
  deleteBtn: {
    flexShrink: 0,
    background: 'transparent',
    border: 'none',
    color: '#718096',
    fontSize: 18,
    lineHeight: 1,
    padding: '0 4px'
  },
  meta: {
    marginTop: 6,
    fontSize: 11,
    color: '#4a5568'
  },
  empty: {
    color: '#718096',
    fontSize: 14,
    padding: '40px 0',
    textAlign: 'center'
  }
}
