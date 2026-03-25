import { app, BrowserWindow, shell, ipcMain } from 'electron'
import { spawn } from 'child_process'
import { join } from 'path'
import { homedir } from 'os'
import { mkdirSync, existsSync } from 'fs'
import Database from 'better-sqlite3'
import { is } from '@electron-toolkit/utils'
import { initializeSchema } from './db/schema'
import { registerObjectHandlers } from './ipc/objects'
import { registerSearchHandlers } from './ipc/search'
import { registerInboxHandlers } from './ipc/inbox'
import { registerPluginHandlers } from './ipc/plugins'
import { registerSettingsHandlers } from './ipc/settings'

// ─── Database setup ───────────────────────────────────────────────────────────

const DATA_DIR = join(homedir(), '.life-console')
if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true })

const db = new Database(join(DATA_DIR, 'data.db'))
initializeSchema(db)

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

registerObjectHandlers(db)
registerSearchHandlers(db)
registerInboxHandlers(db, () => mainWindow?.webContents ?? null)
registerPluginHandlers(db, () => mainWindow?.webContents ?? null)
registerSettingsHandlers(db)

// ─── Shell / external launch ──────────────────────────────────────────────────

ipcMain.on('shell:launch-external', (_event, detail: { app: string; path?: string }) => {
  if (detail.app === 'PhotoSift') {
    const child = spawn('make', ['prod'], {
      cwd: '/Users/chenhunglun/Documents/Procjects/PhotoSift',
      detached: true,
      stdio: 'ignore'
    })
    child.unref()
    // Wait a moment for the server to start, then open in browser
    setTimeout(() => shell.openExternal('http://localhost:8888/'), 3000)
  } else if (detail.path) {
    shell.openPath(detail.path)
  }
})

// ─── App lifecycle ────────────────────────────────────────────────────────────

app.whenReady().then(() => {
  createWindow()
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    db.close()
    app.quit()
  }
})

app.on('before-quit', () => {
  db.close()
})
