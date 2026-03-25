import React, { useState, useEffect, useRef } from 'react'
import { api } from '../hooks/useIPC'
import type { LifeObject } from '../../../shared/types'

interface Props {
  onClose: () => void
}

const TYPE_COLORS: Record<string, string> = {
  inbox_item: '#a0aec0',
  task: '#63b3ed',
  note: '#68d391',
  workflow_run: '#f6ad55'
}

export default function SearchOverlay({ onClose }: Props): React.ReactElement {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<LifeObject[]>([])
  const [searching, setSearching] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  useEffect(() => {
    const handler = (e: KeyboardEvent): void => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  useEffect(() => {
    if (!query.trim()) {
      setResults([])
      return
    }

    const timer = setTimeout(async () => {
      setSearching(true)
      try {
        const res = await api.search.query(query.trim())
        setResults(res.objects)
      } finally {
        setSearching(false)
      }
    }, 200)

    return () => clearTimeout(timer)
  }, [query])

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.dialog} onClick={(e) => e.stopPropagation()}>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search everything..."
          style={styles.input}
        />

        {searching && <div style={styles.hint}>Searching...</div>}

        {!searching && query && results.length === 0 && (
          <div style={styles.hint}>No results found</div>
        )}

        {results.length > 0 && (
          <div style={styles.results}>
            {results.map((obj) => (
              <div key={obj.id} style={styles.resultItem}>
                <span
                  style={{
                    ...styles.typeBadge,
                    color: TYPE_COLORS[obj.type] ?? '#a0aec0'
                  }}
                >
                  {obj.type}
                </span>
                <span style={styles.resultTitle}>{obj.title || obj.content || '(untitled)'}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  overlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.6)',
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'center',
    paddingTop: 120,
    zIndex: 999
  },
  dialog: {
    width: 580,
    maxWidth: '90vw',
    background: '#1a202c',
    borderRadius: 10,
    border: '1px solid #2d3748',
    overflow: 'hidden'
  },
  input: {
    width: '100%',
    padding: '16px 20px',
    background: 'transparent',
    border: 'none',
    borderBottom: '1px solid #2d3748',
    color: '#e2e8f0',
    fontSize: 16,
    outline: 'none'
  },
  hint: {
    padding: '12px 20px',
    fontSize: 13,
    color: '#718096'
  },
  results: {
    maxHeight: 400,
    overflowY: 'auto'
  },
  resultItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '10px 20px',
    borderBottom: '1px solid #2d3748',
    cursor: 'default'
  },
  typeBadge: {
    fontSize: 11,
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.3px',
    flexShrink: 0
  },
  resultTitle: {
    fontSize: 14,
    color: '#e2e8f0',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap'
  }
}
