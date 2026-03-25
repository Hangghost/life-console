import { ipcMain, WebContents } from 'electron'
import Database from 'better-sqlite3'
import { getSetting, updateObject } from '../db/queries'
import { inferType } from '../ai/inference'
import type { InferenceResult, AIMetadata } from '../../shared/types'

export function registerInboxHandlers(db: Database.Database, webContents: () => WebContents | null): void {
  // Called after an inbox_item is created — triggers async inference
  ipcMain.on('inbox:trigger-infer', async (_event, objectId: string, content: string) => {
    const apiKey = getSetting(db, 'claudeApiKey')
    if (!apiKey) {
      // No API key — send a "no-key" result so renderer can show setup prompt
      const wc = webContents()
      if (wc) {
        const result: InferenceResult = { objectId, type: null, confidence: 0 }
        wc.send('inbox:infer', result)
      }
      return
    }

    try {
      const output = await inferType(content, apiKey)

      // Update object ai_metadata
      const existing = db.prepare('SELECT ai_metadata FROM objects WHERE id = ?').get(objectId) as
        | { ai_metadata: string | null }
        | undefined
      const existingMeta: AIMetadata = existing?.ai_metadata
        ? JSON.parse(existing.ai_metadata)
        : {}

      updateObject(db, {
        id: objectId,
        ai_metadata: {
          ...existingMeta,
          inferred_type: output.type,
          inference_confidence: output.confidence,
          last_inference_model: 'claude'
        }
      })

      const result: InferenceResult = {
        objectId,
        type: output.type,
        confidence: output.confidence,
        title: output.title,
        properties: output.properties as InferenceResult['properties']
      }

      const wc = webContents()
      if (wc) wc.send('inbox:infer', result)
    } catch (err) {
      console.error('Inference error:', err)
      // Silent failure — object stays as inbox_item
    }
  })
}
