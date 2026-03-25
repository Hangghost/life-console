import { ipcMain } from 'electron'
import Database from 'better-sqlite3'
import { searchObjects } from '../db/queries'

export function registerSearchHandlers(db: Database.Database): void {
  ipcMain.handle('search:query', (_event, q: string) => {
    if (!q || q.trim().length === 0) return { objects: [] }
    try {
      const objects = searchObjects(db, q.trim())
      return { objects }
    } catch {
      return { objects: [] }
    }
  })
}
