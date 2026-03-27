import { ipcMain } from 'electron'
import Database from 'better-sqlite3'
import { insertRecord, queryRecords } from '../db/context'
import type { InsertRecordPayload, QueryRecordsFilter } from '../db/context'

export function registerContextHandlers(db: Database.Database): void {
  ipcMain.handle('context:insert', (_event, payload: InsertRecordPayload) => {
    return insertRecord(db, payload)
  })

  ipcMain.handle('context:query', (_event, filter: QueryRecordsFilter) => {
    return queryRecords(db, filter)
  })
}
