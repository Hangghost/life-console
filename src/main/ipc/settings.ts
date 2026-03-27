import { ipcMain, dialog } from 'electron'
import Database from 'better-sqlite3'
import { getSetting, setSetting } from '../db/settings'
import type { AppSettings } from '../../shared/types'

export function registerSettingsHandlers(db: Database.Database): void {
  ipcMain.handle('settings:get', (): AppSettings => {
    const mcpPortRaw = getSetting(db, 'mcp_port')
    return {
      claudeApiKey: getSetting(db, 'claudeApiKey') ?? undefined,
      kb_directory: getSetting(db, 'kb_directory') ?? undefined,
      mcp_port: mcpPortRaw ? Number(mcpPortRaw) : undefined,
      model_api_key: getSetting(db, 'model_api_key') ?? undefined,
      model_api_base_url: getSetting(db, 'model_api_base_url') ?? undefined,
      model_name: getSetting(db, 'model_name') ?? undefined,
      skill_loader_targets: getSetting(db, 'skill_loader_targets') ?? undefined
    }
  })

  ipcMain.handle('settings:set', (_event, settings: Partial<AppSettings>) => {
    if (settings.claudeApiKey !== undefined) setSetting(db, 'claudeApiKey', settings.claudeApiKey)
    if (settings.kb_directory !== undefined) setSetting(db, 'kb_directory', settings.kb_directory)
    if (settings.mcp_port !== undefined) setSetting(db, 'mcp_port', String(settings.mcp_port))
    if (settings.model_api_key !== undefined) setSetting(db, 'model_api_key', settings.model_api_key)
    if (settings.model_api_base_url !== undefined)
      setSetting(db, 'model_api_base_url', settings.model_api_base_url)
    if (settings.model_name !== undefined) setSetting(db, 'model_name', settings.model_name)
    if (settings.skill_loader_targets !== undefined)
      setSetting(db, 'skill_loader_targets', settings.skill_loader_targets)
  })

  ipcMain.handle('settings:open-folder-dialog', async () => {
    const result = await dialog.showOpenDialog({ properties: ['openDirectory'] })
    return result.canceled ? null : result.filePaths[0]
  })
}
