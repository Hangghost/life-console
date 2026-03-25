import React from 'react'
import type { RegisteredPlugin } from '../../../shared/types'

interface Props {
  plugin: RegisteredPlugin
  onApprove: () => void
  onDeny: () => void
}

export default function PermissionDialog({ plugin, onApprove, onDeny }: Props): React.ReactElement {
  const { manifest } = plugin

  return (
    <div style={styles.overlay}>
      <div style={styles.dialog}>
        <h3 style={styles.title}>Install Plugin: {manifest.display_name}</h3>
        <p style={styles.desc}>{manifest.description}</p>

        <div style={styles.permSection}>
          <div style={styles.permLabel}>Requested Permissions:</div>
          <ul style={styles.permList}>
            {manifest.permissions.map((p) => (
              <li key={p} style={styles.permItem}>
                <span style={styles.permIcon}>{permIcon(p)}</span>
                <span>{permDescription(p)}</span>
              </li>
            ))}
          </ul>
        </div>

        <div style={styles.actions}>
          <button onClick={onApprove} style={styles.approveBtn}>
            Install
          </button>
          <button onClick={onDeny} style={styles.denyBtn}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}

function permIcon(p: string): string {
  if (p.startsWith('network')) return '🌐'
  if (p.startsWith('llm')) return '🤖'
  if (p.startsWith('fs')) return '📁'
  if (p.startsWith('store')) return '💾'
  return '🔑'
}

function permDescription(p: string): string {
  const map: Record<string, string> = {
    'network:external': 'Access external URLs',
    'llm:claude': 'Call Claude AI API',
    'fs:read': 'Read files from disk',
    'fs:write': 'Write files to disk',
    'store:read': 'Read from local database',
    'store:write': 'Write to local database'
  }
  return map[p] ?? p
}

const styles: Record<string, React.CSSProperties> = {
  overlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.7)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000
  },
  dialog: {
    background: '#1a202c',
    border: '1px solid #2d3748',
    borderRadius: 10,
    padding: 28,
    width: 400,
    maxWidth: '90vw'
  },
  title: {
    margin: '0 0 8px',
    fontSize: 16,
    fontWeight: 700,
    color: '#e2e8f0'
  },
  desc: {
    margin: '0 0 16px',
    fontSize: 13,
    color: '#a0aec0',
    lineHeight: 1.5
  },
  permSection: {
    marginBottom: 20
  },
  permLabel: {
    fontSize: 12,
    fontWeight: 600,
    color: '#718096',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    marginBottom: 8
  },
  permList: {
    margin: 0,
    padding: 0,
    listStyle: 'none',
    display: 'flex',
    flexDirection: 'column',
    gap: 6
  },
  permItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    fontSize: 13,
    color: '#cbd5e0'
  },
  permIcon: {
    fontSize: 14
  },
  actions: {
    display: 'flex',
    gap: 8,
    justifyContent: 'flex-end'
  },
  approveBtn: {
    padding: '8px 20px',
    background: '#4299e1',
    border: 'none',
    borderRadius: 6,
    color: '#fff',
    fontSize: 14,
    fontWeight: 600
  },
  denyBtn: {
    padding: '8px 20px',
    background: '#4a5568',
    border: 'none',
    borderRadius: 6,
    color: '#a0aec0',
    fontSize: 14
  }
}
