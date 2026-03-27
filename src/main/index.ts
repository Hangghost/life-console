import { app, BrowserWindow, shell, ipcMain, Notification } from 'electron'
import { spawn } from 'child_process'
import { join } from 'path'
import { homedir } from 'os'
import { mkdirSync, existsSync, writeFileSync } from 'fs'
import Database from 'better-sqlite3'
import { is } from '@electron-toolkit/utils'
import { initializeSchema } from './db/schema'
import { getSetting } from './db/settings'
import { registerContextHandlers } from './ipc/context'
import { registerSkillHandlers } from './ipc/skills'
import { registerSettingsHandlers } from './ipc/settings'
import { registerKnowledgeHandlers } from './ipc/knowledge'
import { registerAgentHandlers } from './ipc/agent'
import { startMCPServer, stopMCPServer, getMCPStatus } from './mcp/server'

// ─── Database setup ───────────────────────────────────────────────────────────

const DATA_DIR = join(homedir(), '.life-console')
if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true })

const db = new Database(join(DATA_DIR, 'data.db'))
initializeSchema(db)

// ─── Agent Layer initialization ───────────────────────────────────────────────

function initializeAgentLayer(): void {
  const agentDir = join(app.getPath('userData'), 'agent')
  const subdirs = ['axioms', 'methodologies', 'skills']

  for (const sub of subdirs) {
    const dir = join(agentDir, sub)
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true })
  }

  const readmePath = join(agentDir, 'README.md')
  if (!existsSync(readmePath)) {
    writeFileSync(
      readmePath,
      `# Agent Layer

This directory contains your personal Agent Layer managed by Life Console.

## Structure

- **axioms/**: Decision principles and values. Each file is one axiom.
  - Frontmatter: id, title, category (architecture|methodology|technical|values), created_at, last_updated
  - Body: principle statement, **Why:**, **When to apply:**

- **methodologies/**: Thinking frameworks with version history.
  - Frontmatter: id, title, applicable_to, created_at, version
  - Body: steps/process, judgment principles, known exceptions, ## Version History

- **skills/**: Work SOPs and procedural guides.

## Usage

The Agent Layer is exposed via the Life Console MCP Server (localhost:7777).
Use the Distillation Chat to refine and write back to this layer.
Run the Skill Loader to push this context to Claude Code, Cursor, etc.
`,
      'utf-8'
    )
  }
}

// ─── Window ───────────────────────────────────────────────────────────────────

let mainWindow: BrowserWindow | null = null

function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    show: false,
    titleBarStyle: 'hiddenInset',
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow?.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

// ─── IPC registration ─────────────────────────────────────────────────────────

registerContextHandlers(db)
registerSkillHandlers(db, () => mainWindow?.webContents ?? null)
registerSettingsHandlers(db)
registerKnowledgeHandlers(db)
registerAgentHandlers(db, () => mainWindow?.webContents ?? null)

ipcMain.handle('mcp:get-status', () => getMCPStatus())

// ─── Shell / external launch ──────────────────────────────────────────────────

ipcMain.on('shell:launch-external', (_event, detail: { app: string; path?: string }) => {
  if (detail.app === 'PhotoSift') {
    const child = spawn('make', ['prod'], {
      cwd: '/Users/chenhunglun/Documents/Procjects/PhotoSift',
      detached: true,
      stdio: 'ignore'
    })
    child.unref()
    setTimeout(() => shell.openExternal('http://localhost:8888/'), 3000)
  } else if (detail.path) {
    shell.openPath(detail.path)
  }
})

// ─── App lifecycle ────────────────────────────────────────────────────────────

app.whenReady().then(async () => {
  initializeAgentLayer()

  // Start MCP server
  const port = Number(getSetting(db, 'mcp_port') ?? '7777')
  const kbDirectoryFn = (): string | null => getSetting(db, 'kb_directory') ?? null

  try {
    await startMCPServer({ port, kbDirectoryFn })
  } catch (err) {
    console.error('[mcp] Failed to start MCP server:', err)
    // Port conflict: notify user
    if (mainWindow) {
      new Notification({
        title: 'Life Console',
        body: `MCP Server could not start on port ${port}. Change the port in Settings.`
      }).show()
    }
  }

  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', async () => {
  if (process.platform !== 'darwin') {
    await stopMCPServer()
    db.close()
    app.quit()
  }
})

app.on('before-quit', async () => {
  await stopMCPServer()
  db.close()
})
