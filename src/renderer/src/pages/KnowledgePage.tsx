import React, { useState, useEffect, useCallback } from 'react'
import { api } from '../hooks/useIPC'
import type { KnowledgeCard } from '../../../shared/types'

type SourceTypeLabel = 'ai_inferred' | 'ai_confirmed' | 'user_defined'

const SOURCE_TYPE_COLORS: Record<SourceTypeLabel, string> = {
  ai_inferred: '#ed8936',
  ai_confirmed: '#48bb78',
  user_defined: '#4299e1'
}

const SOURCE_TYPE_LABELS: Record<SourceTypeLabel, string> = {
  ai_inferred: 'AI',
  ai_confirmed: 'Confirmed',
  user_defined: 'User'
}

export default function KnowledgePage(): React.ReactElement {
  const [cards, setCards] = useState<KnowledgeCard[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [editingCard, setEditingCard] = useState<KnowledgeCard | null>(null)
  const [editContent, setEditContent] = useState('')
  const [editTopic, setEditTopic] = useState('')
  const [editTags, setEditTags] = useState('')
  const [sourceView, setSourceView] = useState<{ card: KnowledgeCard } | null>(null)
  const [noKbDir, setNoKbDir] = useState(false)

  const loadCards = useCallback(async () => {
    setLoading(true)
    try {
      const settings = await api.settings.get()
      if (!settings.kb_directory) {
        setNoKbDir(true)
        setLoading(false)
        return
      }
      setNoKbDir(false)
      const all = await api.knowledge.list()
      setCards(all)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadCards()
  }, [loadCards])

  const filteredCards = searchQuery.trim()
    ? cards.filter((c) => {
        const q = searchQuery.toLowerCase()
        return (
          c.content.toLowerCase().includes(q) ||
          c.frontmatter.topic.toLowerCase().includes(q) ||
          (c.frontmatter.tags ?? []).some((t) => t.toLowerCase().includes(q))
        )
      })
    : cards

  // Group by topic
  const grouped = new Map<string, KnowledgeCard[]>()
  for (const card of filteredCards) {
    const topic = card.frontmatter.topic || 'Uncategorized'
    if (!grouped.has(topic)) grouped.set(topic, [])
    grouped.get(topic)!.push(card)
  }

  const handleDelete = async (card: KnowledgeCard): Promise<void> => {
    if (!window.confirm(`Delete card "${card.frontmatter.topic}"? This cannot be undone.`)) return
    await api.knowledge.delete(card.filePath)
    setCards((prev) => prev.filter((c) => c.filePath !== card.filePath))
  }

  const handleConfirm = async (card: KnowledgeCard): Promise<void> => {
    const updated = await api.knowledge.update(card.filePath, {
      source_type: 'ai_confirmed'
    })
    if (updated) {
      setCards((prev) => prev.map((c) => (c.filePath === card.filePath ? updated : c)))
    }
  }

  const startEdit = (card: KnowledgeCard): void => {
    setEditingCard(card)
    setEditContent(card.content)
    setEditTopic(card.frontmatter.topic)
    setEditTags((card.frontmatter.tags ?? []).join(', '))
  }

  const saveEdit = async (): Promise<void> => {
    if (!editingCard) return
    const updated = await api.knowledge.update(editingCard.filePath, {
      content: editContent,
      topic: editTopic,
      tags: editTags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean),
      source_type: 'user_defined'
    })
    if (updated) {
      setCards((prev) => prev.map((c) => (c.filePath === editingCard.filePath ? updated : c)))
    }
    setEditingCard(null)
  }

  if (loading) return <div style={s.loading}>Loading knowledge base...</div>

  if (noKbDir) {
    return (
      <div style={s.container}>
        <h2 style={s.title}>Knowledge Base</h2>
        <p style={{ color: '#718096', fontSize: 14 }}>
          No Knowledge Base directory configured. Go to Settings to set one up.
        </p>
      </div>
    )
  }

  // Edit modal
  if (editingCard) {
    return (
      <div style={s.container}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
          <button onClick={() => setEditingCard(null)} style={s.backBtn}>
            ← Back
          </button>
          <h2 style={{ ...s.title, margin: 0 }}>Edit Card</h2>
        </div>

        <div style={s.field}>
          <label style={s.label}>Topic</label>
          <input
            value={editTopic}
            onChange={(e) => setEditTopic(e.target.value)}
            style={s.input}
          />
        </div>

        <div style={s.field}>
          <label style={s.label}>Tags (comma-separated)</label>
          <input
            value={editTags}
            onChange={(e) => setEditTags(e.target.value)}
            style={s.input}
          />
        </div>

        <div style={s.field}>
          <label style={s.label}>Content (Markdown)</label>
          <textarea
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            style={s.textarea}
            rows={12}
          />
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={saveEdit} style={s.btnPrimary}>
            Save
          </button>
          <button onClick={() => setEditingCard(null)} style={s.btnSecondary}>
            Cancel
          </button>
        </div>
      </div>
    )
  }

  // Source view
  if (sourceView) {
    return (
      <div style={s.container}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
          <button onClick={() => setSourceView(null)} style={s.backBtn}>
            ← Back
          </button>
          <h2 style={{ ...s.title, margin: 0 }}>Source Article</h2>
        </div>
        <div style={s.sourceBox}>
          <div style={{ marginBottom: 8, color: '#718096', fontSize: 12 }}>
            Source: {sourceView.card.frontmatter.source}
          </div>
          <pre style={s.sourcePre}>{sourceView.card.frontmatter.source}</pre>
        </div>
      </div>
    )
  }

  return (
    <div style={s.container}>
      <div style={s.header}>
        <h2 style={s.title}>Knowledge Base</h2>
        <span style={s.count}>{cards.length} cards</span>
      </div>

      <div style={s.searchRow}>
        <input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search cards..."
          style={s.searchInput}
        />
        {searchQuery && (
          <button onClick={() => setSearchQuery('')} style={s.clearBtn}>
            ✕
          </button>
        )}
      </div>

      {grouped.size === 0 && (
        <p style={{ color: '#718096', fontSize: 14 }}>
          {searchQuery ? 'No cards match your search.' : 'No cards yet. Use Knowledge Ingestion to add some.'}
        </p>
      )}

      {Array.from(grouped.entries())
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([topic, topicCards]) => (
          <TopicGroup
            key={topic}
            topic={topic}
            cards={topicCards}
            onConfirm={handleConfirm}
            onEdit={startEdit}
            onViewSource={(card) => setSourceView({ card })}
            onDelete={handleDelete}
          />
        ))}
    </div>
  )
}

function TopicGroup({
  topic,
  cards,
  onConfirm,
  onEdit,
  onViewSource,
  onDelete
}: {
  topic: string
  cards: KnowledgeCard[]
  onConfirm: (card: KnowledgeCard) => void
  onEdit: (card: KnowledgeCard) => void
  onViewSource: (card: KnowledgeCard) => void
  onDelete: (card: KnowledgeCard) => void
}): React.ReactElement {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <div style={s.topicGroup}>
      <button onClick={() => setCollapsed(!collapsed)} style={s.topicHeader}>
        <span>{collapsed ? '▶' : '▼'}</span>
        <span style={s.topicTitle}>{topic}</span>
        <span style={s.topicCount}>{cards.length}</span>
      </button>

      {!collapsed && (
        <div style={s.cardList}>
          {cards.map((card) => (
            <CardItem
              key={card.filePath}
              card={card}
              onConfirm={onConfirm}
              onEdit={onEdit}
              onViewSource={onViewSource}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function CardItem({
  card,
  onConfirm,
  onEdit,
  onViewSource,
  onDelete
}: {
  card: KnowledgeCard
  onConfirm: (card: KnowledgeCard) => void
  onEdit: (card: KnowledgeCard) => void
  onViewSource: (card: KnowledgeCard) => void
  onDelete: (card: KnowledgeCard) => void
}): React.ReactElement {
  const st = card.frontmatter.source_type as SourceTypeLabel
  const color = SOURCE_TYPE_COLORS[st] ?? '#718096'
  const label = SOURCE_TYPE_LABELS[st] ?? st

  // Extract first line as title
  const firstLine = card.content.split('\n').find((l) => l.trim()) ?? card.frontmatter.id
  const title = firstLine.replace(/^#+\s+/, '')

  return (
    <div style={s.cardItem}>
      <div style={s.cardTop}>
        <span style={{ ...s.badge, background: color }}>{label}</span>
        <span style={s.cardTitle}>{title.slice(0, 100)}</span>
      </div>

      {(card.frontmatter.tags ?? []).length > 0 && (
        <div style={s.tags}>
          {card.frontmatter.tags.map((tag) => (
            <span key={tag} style={s.tag}>
              {tag}
            </span>
          ))}
        </div>
      )}

      <div style={s.cardActions}>
        {st === 'ai_inferred' && (
          <button onClick={() => onConfirm(card)} style={s.btnConfirm}>
            Confirm
          </button>
        )}
        <button onClick={() => onEdit(card)} style={s.btnAction}>
          Edit
        </button>
        <button onClick={() => onViewSource(card)} style={s.btnAction}>
          View Source
        </button>
        <button onClick={() => onDelete(card)} style={s.btnDelete}>
          Delete
        </button>
      </div>
    </div>
  )
}

const s: Record<string, React.CSSProperties> = {
  container: { padding: '28px 32px', maxWidth: 760 },
  loading: { padding: 32, color: '#718096' },
  header: { display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 20 },
  title: { margin: '0 0 20px', fontSize: 22, fontWeight: 700, color: '#e2e8f0' },
  count: { fontSize: 14, color: '#718096' },
  searchRow: { display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 },
  searchInput: {
    flex: 1,
    padding: '8px 12px',
    background: '#2d3748',
    border: '1px solid #4a5568',
    borderRadius: 6,
    color: '#e2e8f0',
    fontSize: 14,
    outline: 'none'
  },
  clearBtn: {
    padding: '8px 10px',
    background: 'transparent',
    border: 'none',
    color: '#718096',
    fontSize: 14
  },
  topicGroup: { marginBottom: 12 },
  topicHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    width: '100%',
    padding: '10px 12px',
    background: '#2d3748',
    border: 'none',
    borderRadius: 6,
    color: '#e2e8f0',
    fontSize: 14,
    fontWeight: 600,
    textAlign: 'left' as const
  },
  topicTitle: { flex: 1 },
  topicCount: {
    fontSize: 12,
    color: '#718096',
    background: '#1a202c',
    padding: '2px 8px',
    borderRadius: 10
  },
  cardList: { padding: '8px 0 0 12px' },
  cardItem: {
    padding: '12px 14px',
    background: '#1a202c',
    border: '1px solid #2d3748',
    borderRadius: 6,
    marginBottom: 8
  },
  cardTop: { display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 },
  badge: {
    fontSize: 10,
    fontWeight: 700,
    padding: '2px 6px',
    borderRadius: 4,
    color: '#fff',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em',
    flexShrink: 0
  },
  cardTitle: { fontSize: 14, color: '#e2e8f0', flex: 1 },
  tags: { display: 'flex', flexWrap: 'wrap' as const, gap: 4, marginBottom: 8 },
  tag: {
    fontSize: 11,
    padding: '2px 6px',
    background: '#2d3748',
    borderRadius: 4,
    color: '#a0aec0'
  },
  cardActions: { display: 'flex', gap: 8 },
  btnConfirm: {
    padding: '4px 10px',
    background: '#276749',
    border: 'none',
    borderRadius: 4,
    color: '#9ae6b4',
    fontSize: 12,
    fontWeight: 600
  },
  btnAction: {
    padding: '4px 10px',
    background: '#2d3748',
    border: '1px solid #4a5568',
    borderRadius: 4,
    color: '#a0aec0',
    fontSize: 12
  },
  btnDelete: {
    padding: '4px 10px',
    background: '#742a2a',
    border: '1px solid #9b2c2c',
    borderRadius: 4,
    color: '#fc8181',
    fontSize: 12,
    fontWeight: 600
  },
  backBtn: {
    padding: '6px 12px',
    background: '#2d3748',
    border: '1px solid #4a5568',
    borderRadius: 5,
    color: '#a0aec0',
    fontSize: 13
  },
  field: { marginBottom: 16 },
  label: { display: 'block', marginBottom: 6, fontSize: 13, fontWeight: 600, color: '#a0aec0' },
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
  btnPrimary: {
    padding: '9px 20px',
    background: '#4299e1',
    border: 'none',
    borderRadius: 6,
    color: '#fff',
    fontSize: 14,
    fontWeight: 600
  },
  btnSecondary: {
    padding: '9px 16px',
    background: '#2d3748',
    border: '1px solid #4a5568',
    borderRadius: 6,
    color: '#a0aec0',
    fontSize: 14
  },
  sourceBox: { background: '#1a202c', border: '1px solid #2d3748', borderRadius: 6, padding: 16 },
  sourcePre: { margin: 0, fontSize: 12, color: '#a0aec0', whiteSpace: 'pre-wrap' as const }
}
