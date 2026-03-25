import { ipcMain } from 'electron'
import Database from 'better-sqlite3'
import {
  createObject,
  updateObject,
  softDeleteObject,
  queryObjects,
  createRelation,
  queryRelations
} from '../db/queries'
import type { CreateObjectPayload, UpdateObjectPayload, QueryObjectsFilter, CreateRelationPayload } from '../../shared/types'

export function registerObjectHandlers(db: Database.Database): void {
  ipcMain.handle('objects:create', (_event, payload: CreateObjectPayload) => {
    return createObject(db, payload)
  })

  ipcMain.handle('objects:update', (_event, payload: UpdateObjectPayload) => {
    return updateObject(db, payload)
  })

  ipcMain.handle('objects:query', (_event, filter: QueryObjectsFilter) => {
    return queryObjects(db, filter)
  })

  ipcMain.handle('objects:delete', (_event, id: string) => {
    softDeleteObject(db, id)
  })

  ipcMain.handle('relations:create', (_event, payload: CreateRelationPayload) => {
    return createRelation(db, payload)
  })

  ipcMain.handle('relations:query', (_event, filter: { from_id?: string; to_id?: string }) => {
    return queryRelations(db, filter)
  })
}
