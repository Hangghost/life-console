// @ts-nocheck — preserved for future re-enablement
import React from 'react'
import type { InferenceResult, LifeObject } from '../../../shared/types'

interface Props {
  item: LifeObject
  inference: InferenceResult
  onConfirm: (result: InferenceResult) => void
  onOverride: (type: 'task' | 'note') => void
  onKeep: () => void
}

export default function InferenceConfirmation({
  item,
  inference,
  onConfirm,
  onOverride,
  onKeep
}: Props): React.ReactElement {
  const typeLabel = inference.type === 'task' ? 'Task' : inference.type === 'note' ? 'Note' : null
  const altType = inference.type === 'task' ? 'note' : 'task'
  const altLabel = altType === 'task' ? 'Task' : 'Note'

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <span style={styles.aiLabel}>AI Suggestion</span>
        <span style={styles.confidence}>
          {Math.round((inference.confidence ?? 0) * 100)}% confident
        </span>
      </div>

      {typeLabel && (
        <div style={styles.suggestion}>
          <span style={styles.typeBadge}>{typeLabel}</span>
          {inference.title && <span style={styles.suggestedTitle}>{inference.title}</span>}
        </div>
      )}

      {!typeLabel && (
        <div style={styles.suggestion}>
          <span style={{ color: '#718096', fontSize: 13 }}>Cannot determine type</span>
        </div>
      )}

      <div style={styles.actions}>
        {typeLabel && (
          <button onClick={() => onConfirm(inference)} style={styles.confirmBtn}>
            Confirm as {typeLabel}
          </button>
        )}
        {typeLabel && (
          <button onClick={() => onOverride(altType as 'task' | 'note')} style={styles.overrideBtn}>
            Change to {altLabel}
          </button>
        )}
        <button onClick={onKeep} style={styles.keepBtn}>
          Keep unclassified
        </button>
      </div>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    marginTop: 8,
    padding: '10px 12px',
    background: '#1e3a5f',
    borderRadius: 6,
    border: '1px solid #2b6cb0'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6
  },
  aiLabel: {
    fontSize: 11,
    fontWeight: 600,
    color: '#90cdf4',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  },
  confidence: {
    fontSize: 11,
    color: '#718096'
  },
  suggestion: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8
  },
  typeBadge: {
    padding: '2px 8px',
    background: '#2b6cb0',
    borderRadius: 4,
    fontSize: 12,
    fontWeight: 600,
    color: '#bee3f8'
  },
  suggestedTitle: {
    fontSize: 13,
    color: '#cbd5e0'
  },
  actions: {
    display: 'flex',
    gap: 6,
    flexWrap: 'wrap'
  },
  confirmBtn: {
    padding: '5px 12px',
    background: '#38a169',
    border: 'none',
    borderRadius: 4,
    color: '#fff',
    fontSize: 12,
    fontWeight: 600
  },
  overrideBtn: {
    padding: '5px 12px',
    background: '#d69e2e',
    border: 'none',
    borderRadius: 4,
    color: '#fff',
    fontSize: 12,
    fontWeight: 600
  },
  keepBtn: {
    padding: '5px 12px',
    background: '#4a5568',
    border: 'none',
    borderRadius: 4,
    color: '#a0aec0',
    fontSize: 12
  }
}
