import { existsSync, readdirSync, readFileSync } from 'fs'
import { join } from 'path'
import { app } from 'electron'
import type { SkillManifest, RegisteredSkill } from '../../shared/types'

function getSkillsDir(): string {
  return join(app.getAppPath(), 'skills')
}

function validateManifest(manifest: unknown): manifest is SkillManifest {
  if (!manifest || typeof manifest !== 'object') return false
  const m = manifest as Record<string, unknown>
  return (
    typeof m.name === 'string' &&
    typeof m.displayName === 'string' &&
    typeof m.description === 'string' &&
    m.inputSchema !== null &&
    typeof m.inputSchema === 'object'
  )
}

export function loadSkills(): RegisteredSkill[] {
  const skillsDir = getSkillsDir()
  if (!existsSync(skillsDir)) return []

  const skills: RegisteredSkill[] = []

  let entries
  try {
    entries = readdirSync(skillsDir, { withFileTypes: true })
  } catch (err) {
    console.warn(`[skills] Failed to scan skills directory:`, err)
    return []
  }

  for (const entry of entries) {
    if (!entry.isDirectory()) continue
    const skillDir = join(skillsDir, entry.name)
    const manifestPath = join(skillDir, 'manifest.json')
    if (!existsSync(manifestPath)) continue

    try {
      const raw = JSON.parse(readFileSync(manifestPath, 'utf-8'))
      if (!validateManifest(raw)) {
        console.warn(`[skills] Invalid manifest at ${manifestPath}, skipping`)
        continue
      }
      const hasUI = existsSync(join(skillDir, 'ui.tsx')) || existsSync(join(skillDir, 'ui.js'))
      skills.push({ manifest: raw, skillDir, hasUI })
    } catch (err) {
      console.warn(`[skills] Failed to load manifest at ${manifestPath}:`, err)
    }
  }

  return skills
}
