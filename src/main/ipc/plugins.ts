import { ipcMain, WebContents } from 'electron'
import Database from 'better-sqlite3'
import { loadPlugins, approvedPlugins, approvePlugin, denyPlugin } from '../plugins/loader'
import { runPlugin } from '../plugins/runner'
import { getSetting } from '../db/queries'

export function registerPluginHandlers(
  db: Database.Database,
  webContents: () => WebContents | null
): void {
  ipcMain.handle('plugins:list', () => {
    return loadPlugins()
  })

  ipcMain.handle('plugins:approve', (_event, name: string) => {
    approvePlugin(name)
  })

  ipcMain.handle('plugins:deny', (_event, name: string) => {
    denyPlugin(name)
  })

  ipcMain.handle('plugins:run', async (_event, name: string, input: Record<string, unknown>) => {
    const plugins = loadPlugins()
    const plugin = plugins.find((p) => p.manifest.name === name)
    if (!plugin) throw new Error(`Plugin "${name}" not found`)
    if (!approvedPlugins.has(name)) throw new Error(`Plugin "${name}" not approved`)

    const apiKey = getSetting(db, 'claudeApiKey') ?? undefined
    const wc = webContents()

    const workflowRunId = await runPlugin({ plugin, input, db, apiKey, onStatus: (event) => {
      if (wc) wc.send('plugins:status', event)
    }})

    return workflowRunId
  })
}
