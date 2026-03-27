import { ipcMain, WebContents } from 'electron'
import Database from 'better-sqlite3'
import { loadSkills } from '../skills/loader'
import { runSkill } from '../skills/runner'

export function registerSkillHandlers(
  db: Database.Database,
  webContents: () => WebContents | null
): void {
  ipcMain.handle('skills:list', () => {
    return loadSkills()
  })

  ipcMain.handle('skills:run', async (_event, name: string, input: unknown) => {
    const skills = loadSkills()
    const skill = skills.find((s) => s.manifest.name === name)
    if (!skill) throw new Error(`Skill "${name}" not found`)

    const wc = webContents()
    await runSkill({
      skill,
      input,
      db,
      onResult: (event) => {
        if (wc) wc.send('skills:result', event)
      }
    })
  })
}
