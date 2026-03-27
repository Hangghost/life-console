import Database from 'better-sqlite3'
import { randomUUID } from 'crypto'
import type { ContextRecord, InsertRecordPayload, QueryRecordsFilter } from '../../shared/types'

export type { ContextRecord, InsertRecordPayload, QueryRecordsFilter }

function parseRecord(row: Record<string, unknown>): ContextRecord {
  return {
    id: row.id as string,
    skill_name: row.skill_name as string,
    input: row.input ? JSON.parse(row.input as string) : null,
    output: row.output ? JSON.parse(row.output as string) : null,
    error: (row.error as string | null) ?? null,
    created_at: row.created_at as string
  }
}

export function insertRecord(db: Database.Database, payload: InsertRecordPayload): ContextRecord {
  const id = randomUUID()
  const created_at = new Date().toISOString()
  db.prepare(`
    INSERT INTO records (id, skill_name, input, output, error, created_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(
    id,
    payload.skill_name,
    payload.input != null ? JSON.stringify(payload.input) : null,
    payload.output != null ? JSON.stringify(payload.output) : null,
    payload.error ?? null,
    created_at
  )
  return { id, skill_name: payload.skill_name, input: payload.input, output: payload.output, error: payload.error ?? null, created_at }
}

export function queryRecords(db: Database.Database, filter: QueryRecordsFilter): ContextRecord[] {
  const conditions: string[] = []
  const params: unknown[] = []

  if (filter.skillName) {
    conditions.push('skill_name = ?')
    params.push(filter.skillName)
  }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : ''
  const limit = filter.limit ?? 100
  params.push(limit)

  const rows = db
    .prepare(`SELECT * FROM records ${where} ORDER BY created_at DESC LIMIT ?`)
    .all(...params) as Record<string, unknown>[]

  return rows.map(parseRecord)
}
