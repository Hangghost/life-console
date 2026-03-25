import React, { useState } from 'react'
import InboxPage from './pages/InboxPage'
import TodayPage from './pages/TodayPage'
import ToolboxPage from './pages/ToolboxPage'
import SettingsPage from './pages/SettingsPage'
import SearchOverlay from './components/SearchOverlay'

type Page = 'inbox' | 'today' | 'toolbox' | 'settings'

export default function App(): React.ReactElement {
  const [activePage, setActivePage] = useState<Page>('inbox')
  const [searchOpen, setSearchOpen] = useState(false)

  return (
    <div style={styles.layout}>
      {/* Sidebar */}
      <nav style={styles.sidebar}>
        <div style={styles.appTitle}>Life Console</div>

        <div style={styles.navSection}>
          <NavItem
            label="Inbox"
            icon="📥"
            active={activePage === 'inbox'}
            onClick={() => setActivePage('inbox')}
          />
          <NavItem
            label="Today"
            icon="📅"
            active={activePage === 'today'}
            onClick={() => setActivePage('today')}
          />
          <NavItem
            label="Toolbox"
            icon="🧰"
            active={activePage === 'toolbox'}
            onClick={() => setActivePage('toolbox')}
          />
          <NavItem
            label="Search"
            icon="🔍"
            active={false}
            onClick={() => setSearchOpen(true)}
          />
        </div>

        <div style={styles.navBottom}>
          <NavItem
            label="Settings"
            icon="⚙️"
            active={activePage === 'settings'}
            onClick={() => setActivePage('settings')}
          />
        </div>
      </nav>

      {/* Main content */}
      <main style={styles.content}>
        {activePage === 'inbox' && <InboxPage />}
        {activePage === 'today' && <TodayPage />}
        {activePage === 'toolbox' && <ToolboxPage />}
        {activePage === 'settings' && <SettingsPage />}
      </main>

      {searchOpen && <SearchOverlay onClose={() => setSearchOpen(false)} />}
    </div>
  )
}

function NavItem({
  label,
  icon,
  active,
  onClick
}: {
  label: string
  icon: string
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
      <span style={styles.navIcon}>{icon}</span>
      <span>{label}</span>
    </button>
  )
}

const styles: Record<string, React.CSSProperties> = {
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
    WebkitAppRegion: 'drag' as never
  },
  appTitle: {
    padding: '20px 16px 12px',
    fontSize: 16,
    fontWeight: 700,
    color: '#90cdf4',
    letterSpacing: '-0.3px',
    paddingTop: 40 // account for macOS traffic lights
  },
  navSection: {
    flex: 1,
    padding: '8px 8px'
  },
  navBottom: {
    padding: '8px 8px 16px'
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
    WebkitAppRegion: 'no-drag' as never,
    transition: 'background 0.15s, color 0.15s'
  },
  navItemActive: {
    background: '#2d3748',
    color: '#e2e8f0'
  },
  navIcon: {
    fontSize: 16
  },
  content: {
    flex: 1,
    overflow: 'auto',
    background: '#1a1a2e'
  }
}
