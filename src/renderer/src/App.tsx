import React, { useState, useEffect } from 'react'
import SkillPage from './pages/SkillPage'
import SettingsPage from './pages/SettingsPage'
import KnowledgePage from './pages/KnowledgePage'
import DistillationPage from './pages/DistillationPage'
import { api } from './hooks/useIPC'
import type { RegisteredSkill } from '../../shared/types'

type ActiveView =
  | { type: 'skill'; skillName: string }
  | { type: 'settings' }
  | { type: 'knowledge' }
  | { type: 'distillation' }
  | { type: 'empty' }

export default function App(): React.ReactElement {
  const [skills, setSkills] = useState<RegisteredSkill[]>([])
  const [activeView, setActiveView] = useState<ActiveView>({ type: 'knowledge' })

  useEffect(() => {
    api.skills.list().then((list) => {
      setSkills(list)
    })
  }, [])

  const activeSkill =
    activeView.type === 'skill'
      ? skills.find((s) => s.manifest.name === activeView.skillName)
      : undefined

  return (
    <div style={styles.layout}>
      {/* Sidebar */}
      <nav style={styles.sidebar}>
        <div style={styles.appTitle}>Life Console</div>

        <div style={styles.sectionLabel}>Workspace</div>
        <div style={styles.navSection}>
          <NavItem
            label="Knowledge"
            active={activeView.type === 'knowledge'}
            onClick={() => setActiveView({ type: 'knowledge' })}
          />
          <NavItem
            label="Distillation"
            active={activeView.type === 'distillation'}
            onClick={() => setActiveView({ type: 'distillation' })}
          />
        </div>

        <div style={styles.sectionLabel}>Skills</div>
        <div style={styles.navSection}>
          {skills.map((skill) => (
            <NavItem
              key={skill.manifest.name}
              label={skill.manifest.displayName}
              active={
                activeView.type === 'skill' && activeView.skillName === skill.manifest.name
              }
              onClick={() => setActiveView({ type: 'skill', skillName: skill.manifest.name })}
            />
          ))}

          {skills.length === 0 && (
            <div style={styles.emptySkills}>No skills found</div>
          )}
        </div>

        <div style={styles.navBottom}>
          <NavItem
            label="Settings"
            active={activeView.type === 'settings'}
            onClick={() => setActiveView({ type: 'settings' })}
          />
        </div>
      </nav>

      {/* Main content */}
      <main style={styles.content}>
        {activeView.type === 'skill' && activeSkill && (
          <SkillPage skill={activeSkill} />
        )}
        {activeView.type === 'settings' && <SettingsPage />}
        {activeView.type === 'knowledge' && <KnowledgePage />}
        {activeView.type === 'distillation' && <DistillationPage />}
        {activeView.type === 'empty' && <EmptyState />}
      </main>
    </div>
  )
}

function EmptyState(): React.ReactElement {
  return (
    <div style={styles.emptyState}>
      <div style={styles.emptyStateTitle}>Welcome to Life Console</div>
      <div style={styles.emptyStateBody}>
        Select Knowledge or Distillation to get started.
      </div>
    </div>
  )
}

function NavItem({
  label,
  active,
  onClick
}: {
  label: string
  active: boolean
  onClick: () => void
}): React.ReactElement {
  return (
    <button
      onClick={onClick}
      style={{
        ...styles.navItem,
        ...(active ? styles.navItemActive : {})
      }}
    >
      <span>{label}</span>
    </button>
  )
}

const styles: Record<string, React.CSSProperties & Record<string, unknown>> = {
  layout: {
    display: 'flex',
    height: '100vh',
    overflow: 'hidden'
  },
  sidebar: {
    width: 200,
    minWidth: 200,
    background: '#16213e',
    borderRight: '1px solid #2d3748',
    display: 'flex',
    flexDirection: 'column',
    padding: '0',
    WebkitAppRegion: 'drag'
  },
  appTitle: {
    padding: '20px 16px 12px',
    fontSize: 16,
    fontWeight: 700,
    color: '#90cdf4',
    letterSpacing: '-0.3px',
    paddingTop: 40 // account for macOS traffic lights
  },
  sectionLabel: {
    padding: '8px 16px 4px',
    fontSize: 11,
    fontWeight: 600,
    color: '#4a5568',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.08em'
  },
  navSection: {
    padding: '0 8px',
    overflowY: 'auto' as const
  },
  navBottom: {
    padding: '8px 8px 16px',
    marginTop: 'auto'
  },
  navItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    width: '100%',
    padding: '8px 12px',
    background: 'transparent',
    border: 'none',
    borderRadius: 6,
    color: '#a0aec0',
    fontSize: 14,
    textAlign: 'left',
    WebkitAppRegion: 'no-drag',
    transition: 'background 0.15s, color 0.15s'
  },
  navItemActive: {
    background: '#2d3748',
    color: '#e2e8f0'
  },
  content: {
    flex: 1,
    overflow: 'auto',
    background: '#1a1a2e'
  },
  emptySkills: {
    padding: '12px 12px',
    color: '#4a5568',
    fontSize: 13
  },
  emptyState: {
    padding: '60px 40px',
    maxWidth: 480
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: 700,
    color: '#e2e8f0',
    marginBottom: 12
  },
  emptyStateBody: {
    fontSize: 14,
    color: '#718096',
    lineHeight: 1.6
  }
}
