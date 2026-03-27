import { ipcMain, dialog } from 'electron'
import { execSync } from 'child_process'
import { existsSync, unlinkSync } from 'fs'
import Database from 'better-sqlite3'
import { getSetting } from '../db/settings'
import { readAllKnowledgeCards, findCardById } from '../knowledge/reader'
import { updateKnowledgeCard, confirmCards } from '../knowledge/writer'
import { searchKnowledgeCards } from '../knowledge/search'
import { insertRecord } from '../db/context'
import type { ConfirmCardsPayload } from '../../shared/types'

function getKbDirectory(db: Database.Database): string | null {
  return getSetting(db, 'kb_directory') ?? null
}

export function registerKnowledgeHandlers(db: Database.Database): void {
  ipcMain.handle('knowledge:list', () => {
    const kbDir = getKbDirectory(db)
    if (!kbDir) return []
    return readAllKnowledgeCards(kbDir)
  })

  ipcMain.handle('knowledge:get', (_event, id: string) => {
    const kbDir = getKbDirectory(db)
    if (!kbDir) return null
    return findCardById(kbDir, id)
  })

  ipcMain.handle('knowledge:search', (_event, query: string, limit?: number) => {
    const kbDir = getKbDirectory(db)
    if (!kbDir) return []
    return searchKnowledgeCards(kbDir, query, limit)
  })

  ipcMain.handle(
    'knowledge:update',
    (_event, filePath: string, updates: Record<string, unknown>) => {
      return updateKnowledgeCard(filePath, updates as Parameters<typeof updateKnowledgeCard>[1])
    }
  )

  ipcMain.handle('knowledge:export', async () => {
    const kbDir = getKbDirectory(db)
    if (!kbDir || !existsSync(kbDir)) {
      return { success: false, path: '', error: 'KB directory not configured or not found' }
    }

    const result = await dialog.showSaveDialog({
      defaultPath: 'knowledge-export.zip',
      filters: [{ name: 'ZIP Archive', extensions: ['zip'] }]
    })

    if (result.canceled || !result.filePath) {
      return { success: false, path: '', error: 'Cancelled' }
    }

    try {
      execSync(`cd "${kbDir}" && zip -r "${result.filePath}" .`, { stdio: 'ignore' })
      return { success: true, path: result.filePath }
    } catch (err) {
      return { success: false, path: '', error: String(err) }
    }
  })

  ipcMain.handle('knowledge:delete', (_event, filePath: string) => {
    try {
      unlinkSync(filePath)
      return { success: true }
    } catch (err) {
      return { success: false, error: String(err) }
    }
  })

  ipcMain.handle('knowledge:confirm-cards', (_event, payload: ConfirmCardsPayload) => {
    const kbDir = getKbDirectory(db)
    if (!kbDir) throw new Error('KB directory not configured')

    const result = confirmCards(kbDir, payload)

    insertRecord(db, {
      skill_name: 'knowledge-ingestion',
      input: { source: payload.sourceTitle, cardCount: payload.cards.length },
      output: { cardFilePaths: result.cardFilePaths },
      error: null
    })

    return result
  })
}
