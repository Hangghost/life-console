// @ts-nocheck — preserved for future re-enablement
import React, { useState, useEffect, useCallback } from 'react'
import { api } from '../hooks/useIPC'
import type { LifeObject, TaskProperties, TaskStatus } from '../../../shared/types'

// ─── Scoring ──────────────────────────────────────────────────────────────────

function urgencyScore(dueDate?: string): number {
  if (!dueDate) return 10
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const due = new Date(dueDate)
  due.setHours(0, 0, 0, 0)
  const diffDays = Math.floor((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

  if (diffDays < 0) return 100
  if (diffDays === 0) return 80
  if (diffDays === 1) return 60
  if (diffDays <= 3) return 40
  if (diffDays <= 7) return 20
  return 10
}

function priorityScore(priority?: string): number {
  switch (priority) {
    case 'urgent': return 40
    case 'high': return 30
    case 'medium': return 20
    case 'low': return 10
    default: return 10
  }
}

function stalenessScore(createdAt: string, status: string): number {
  if (status !== 'todo') return 0
  const created = new Date(createdAt)
  const now = new Date()
  const diffDays = Math.floor((now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24))
  if (diffDays > 7) return 15
  if (diffDays > 3) return 5
  return 0
}

function scoreTask(task: LifeObject): number {
  const props = task.properties as TaskProperties | undefined
  return (
    urgencyScore(props?.due_date) +
    priorityScore(props?.priority) +
    stalenessScore(task.created_at, props?.status ?? 'todo')
  )
}

// ─── Status cycle ─────────────────────────────────────────────────────────────

const STATUS_NEXT: Record<string, TaskStatus> = {
  todo: 'in_progress',
  in_progress: 'done',
  done: 'done'
}

const STATUS_LABEL: Record<string, string> = {
  todo: 'To Do',
  in_progress: 'In Progress',
  done: 'Done'
}

const STATUS_COLOR: Record<string, string> = {
  todo: '#4a5568',
  in_progress: '#d69e2e',
  done: '#38a169'
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function TodayPage(): React.ReactElement {
  const [tasks, setTasks] = useState<LifeObject[]>([])
  const [loading, setLoading] = useState(true)

  const loadTasks = useCallback(async () => {
    const todo = await api.objects.query({ type: 'task', status: 'todo' })
    const inProgress = await api.objects.query({ type: 'task', status: 'in_progress' })
    const combined = [...todo, ...inProgress]
    combined.sort((a, b) => scoreTask(b) - scoreTask(a))
    setTasks(combined)
    setLoading(false)
  }, [])

  useEffect(() => {
    loadTasks()
  }, [loadTasks])

  const totalMinutes = tasks.reduce((sum, t) => {
    const mins = (t.properties as TaskProperties | undefined)?.estimated_minutes
    return sum + (mins ?? 0)
  }, 0)

  const handleStatusAdvance = async (task: LifeObject): Promise<void> => {
    const props = task.properties as TaskProperties | undefined
    const current = props?.status ?? 'todo'
    const next = STATUS_NEXT[current] ?? 'done'

    await api.objects.update({
      id: task.id,
      properties: { ...(props ?? {}), status: next } as TaskProperties
    })

    if (next === 'done') {
      setTasks((prev) => prev.filter((t) => t.id !== task.id))
    } else {
      setTasks((prev) =>
        prev.map((t) =>
          t.id === task.id
            ? { ...t, properties: { ...(props ?? {}), status: next } as TaskProperties }
            : t
        )
      )
    }
  }

  if (loading) return <div style={styles.container}>Loading...</div>

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>Today</h2>
        {totalMinutes > 0 && (
          <div style={styles.totalTime}>
            Estimated total: {formatMinutes(totalMinutes)}
          </div>
        )}
      </div>

      {tasks.length === 0 ? (
        <div style={styles.empty}>No pending tasks. You are free!</div>
      ) : (
        <div style={styles.list}>
          {tasks.map((task) => {
            const props = task.properties as TaskProperties | undefined
            const status = props?.status ?? 'todo'
            return (
              <div key={task.id} style={styles.card}>
                <div style={styles.cardMain}>
                  <div style={styles.cardContent}>
                    <div style={styles.taskTitle}>{task.title || task.content || '(Untitled)'}</div>
                    <div style={styles.taskMeta}>
                      {props?.priority && (
                        <span style={{ ...styles.badge, color: priorityColor(props.priority) }}>
                          {props.priority}
                        </span>
                      )}
                      {props?.due_date && (
                        <span style={styles.badge}>Due {props.due_date}</span>
                      )}
                      {props?.estimated_minutes && (
                        <span style={styles.badge}>{props.estimated_minutes}m</span>
                      )}
                      <span style={{ ...styles.scoreBadge }}>
                        Score: {scoreTask(task)}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleStatusAdvance(task)}
                    style={{
                      ...styles.statusBtn,
                      background: STATUS_COLOR[status]
                    }}
                  >
                    {STATUS_LABEL[status]}
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

function formatMinutes(mins: number): string {
  const h = Math.floor(mins / 60)
  const m = mins % 60
  if (h > 0 && m > 0) return `${h}h ${m}m`
  if (h > 0) return `${h}h`
  return `${m}m`
}

function priorityColor(priority: string): string {
  switch (priority) {
    case 'urgent': return '#fc8181'
    case 'high': return '#f6ad55'
    case 'medium': return '#f6e05e'
    default: return '#a0aec0'
  }
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    padding: '28px 32px',
    maxWidth: 720
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20
  },
  title: {
    margin: 0,
    fontSize: 22,
    fontWeight: 700,
    color: '#e2e8f0'
  },
  totalTime: {
    fontSize: 13,
    color: '#a0aec0',
    background: '#2d3748',
    padding: '4px 12px',
    borderRadius: 12
  },
  list: {
    display: 'flex',
    flexDirection: 'column',
    gap: 10
  },
  card: {
    padding: '14px 16px',
    background: '#16213e',
    borderRadius: 8,
    border: '1px solid #2d3748'
  },
  cardMain: {
    display: 'flex',
    alignItems: 'center',
    gap: 12
  },
  cardContent: {
    flex: 1
  },
  taskTitle: {
    fontSize: 14,
    color: '#e2e8f0',
    marginBottom: 6,
    lineHeight: 1.4
  },
  taskMeta: {
    display: 'flex',
    gap: 6,
    flexWrap: 'wrap'
  },
  badge: {
    fontSize: 11,
    padding: '2px 7px',
    background: '#2d3748',
    borderRadius: 4,
    color: '#a0aec0'
  },
  scoreBadge: {
    fontSize: 11,
    padding: '2px 7px',
    background: '#1a365d',
    borderRadius: 4,
    color: '#90cdf4'
  },
  statusBtn: {
    padding: '6px 14px',
    border: 'none',
    borderRadius: 6,
    fontSize: 12,
    fontWeight: 600,
    color: '#fff',
    flexShrink: 0
  },
  empty: {
    color: '#718096',
    fontSize: 14,
    padding: '40px 0',
    textAlign: 'center'
  }
}
