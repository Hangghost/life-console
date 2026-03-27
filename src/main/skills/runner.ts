import { existsSync, readFileSync } from 'fs'
import { join } from 'path'
import Database from 'better-sqlite3'
import { insertRecord } from '../db/context'
import type { RegisteredSkill, SkillResultEvent } from '../../shared/types'

function loadDotenv(skillDir: string): void {
  const envPath = join(skillDir, '.env')
  if (!existsSync(envPath)) return

  try {
    const content = readFileSync(envPath, 'utf-8')
    for (const line of content.split('\n')) {
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith('#')) continue
      const eqIndex = trimmed.indexOf('=')
      if (eqIndex === -1) continue
      const key = trimmed.slice(0, eqIndex).trim()
      const value = trimmed.slice(eqIndex + 1).trim()
      if (key && !(key in process.env)) {
        process.env[key] = value
      }
    }
  } catch (err) {
    console.warn(`[skills] Failed to load .env at ${envPath}:`, err)
  }
}

export interface RunSkillOptions {
  skill: RegisteredSkill
  input: unknown
  db: Database.Database
  onResult: (event: SkillResultEvent) => void
}

export async function runSkill(options: RunSkillOptions): Promise<void> {
  const { skill, input, db, onResult } = options
  const { manifest, skillDir } = skill

  // Load .env before execution
  loadDotenv(skillDir)

  const corePath = join(skillDir, 'core.ts')
  const corePathJs = join(skillDir, 'core.js')
  const entryPath = existsSync(corePath) ? corePath : corePathJs

  if (!existsSync(entryPath)) {
    const error = `core.ts not found in ${skillDir}`
    const record = insertRecord(db, { skill_name: manifest.name, input, output: null, error })
    onResult({ skillName: manifest.name, output: null, error, recordId: record.id })
    return
  }

  try {
    // Register tsx for TypeScript execution
    if (entryPath.endsWith('.ts')) {
      try {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        require('tsx/cjs')
      } catch {
        // tsx already registered or not available
      }
    }

    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const mod = require(entryPath) as { default: (input: unknown) => Promise<unknown> }
    const fn = mod.default ?? (mod as unknown as (input: unknown) => Promise<unknown>)
    const output = await fn(input)

    const record = insertRecord(db, { skill_name: manifest.name, input, output, error: null })
    onResult({ skillName: manifest.name, output, error: null, recordId: record.id })
  } catch (err) {
    const error = err instanceof Error ? err.message : String(err)
    const record = insertRecord(db, { skill_name: manifest.name, input, output: null, error })
    onResult({ skillName: manifest.name, output: null, error, recordId: record.id })
  }
}
