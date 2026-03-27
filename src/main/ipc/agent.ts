import { ipcMain, WebContents, net } from 'electron'
import Database from 'better-sqlite3'
import { readAllAxioms, findMethodologyByTopic, readAllMethodologies } from '../agent/reader'
import { executeWriteBack } from '../agent/writer'
import { getSetting } from '../db/settings'
import { loadSkills } from '../skills/loader'
import { runSkill } from '../skills/runner'
import type { WriteBackPayload, SkillLoaderTarget } from '../../shared/types'

export function registerAgentHandlers(
  db: Database.Database,
  webContents: () => WebContents | null
): void {
  ipcMain.handle(
    'agent:llm-call',
    async (
      _event,
      params: { url: string; headers: Record<string, string>; body: string }
    ): Promise<{ ok: boolean; status: number; text: string }> => {
      const response = await net.fetch(params.url, {
        method: 'POST',
        headers: params.headers,
        body: params.body
      })
      const text = await response.text()
      return { ok: response.ok, status: response.status, text }
    }
  )

  ipcMain.handle('agent:list-axioms', (_event, category?: string) => {
    return readAllAxioms(category)
  })

  ipcMain.handle('agent:get-methodology', (_event, topic: string) => {
    return findMethodologyByTopic(topic)
  })

  ipcMain.handle('agent:list-methodologies', () => {
    return readAllMethodologies()
  })

  ipcMain.handle('agent:write-back', async (_event, payload: WriteBackPayload) => {
    try {
      const result = executeWriteBack(payload)

      // Auto-trigger skill loader after write-back
      setImmediate(async () => {
        try {
          const targetsJson = getSetting(db, 'skill_loader_targets')
          const targets: SkillLoaderTarget[] = targetsJson ? JSON.parse(targetsJson) : []
          if (targets.length === 0) return

          const mcpPort = getSetting(db, 'mcp_port') ?? '7777'
          const skills = loadSkills()
          const loaderSkill = skills.find((s) => s.manifest.name === 'skill-loader')
          if (!loaderSkill) return

          const wc = webContents()
          await runSkill({
            skill: loaderSkill,
            input: { targets, mcpPort: Number(mcpPort) },
            db,
            onResult: (event) => {
              if (wc) wc.send('skills:result', event)
            }
          })
        } catch (err) {
          console.warn('[agent] Auto skill-loader trigger failed:', err)
        }
      })

      return { success: true, filePath: result.filePath }
    } catch (err) {
      return { success: false, error: String(err) }
    }
  })
}
