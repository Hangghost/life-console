import { ipcMain } from 'electron'
import Database from 'better-sqlite3'
import { getSetting, setSetting } from '../db/queries'
import type { AppSettings } from '../../shared/types'

export function registerSettingsHandlers(db: Database.Database): void {
  ipcMain.handle('settings:get', (): AppSettings => {
    return {
      claudeApiKey: getSetting(db, 'claudeApiKey') ?? undefined
    }
  })

  ipcMain.handle('settings:set', (_event, settings: Partial<AppSettings>) => {
    if (settings.claudeApiKey !== undefined) {
      setSetting(db, 'claudeApiKey', settings.claudeApiKey)
    }
  })
}
