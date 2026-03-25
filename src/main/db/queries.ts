import Database from 'better-sqlite3'
import { randomUUID } from 'crypto'
import type {
  LifeObject,
  ObjectType,
  CreateObjectPayload,
  UpdateObjectPayload,
  QueryObjectsFilter,
  Relation,
  RelationType,
  CreateRelationPayload
} from '../../shared/types'

function now(): string {
  return new Date().toISOString()
}

function parseObject(row: Record<string, unknown>): LifeObject {
  return {
    ...row,
    properties: row.properties ? JSON.parse(row.properties as string) : undefined,
    ai_metadata: row.ai_metadata ? JSON.parse(row.ai_metadata as string) : undefined
  } as LifeObject
}

// ─── Objects ─────────────────────────────────────────────────────────────────

export function createObject(db: Database.Database, payload: CreateObjectPayload): LifeObject {
  const id = randomUUID()
  const ts = now()
  const stmt = db.prepare(`
    INSERT INTO objects (id, type, title, content, properties, source, ai_metadata, created_at, updated_at, archived)
    VALUES (@id, @type, @title, @content, @properties, @source, @ai_metadata, @created_at, @updated_at, 0)
  `)
  stmt.run({
    id,
    type: payload.type,
    title: payload.title ?? null,
    content: payload.content ?? null,
    properties: payload.properties ? JSON.stringify(payload.properties) : null,
    source: payload.source ?? null,
    ai_metadata: payload.ai_metadata ? JSON.stringify(payload.ai_metadata) : null,
    created_at: ts,
    updated_at: ts
  })
  return getObjectById(db, id)!
}

export function getObjectById(db: Database.Database, id: string): LifeObject | undefined {
  const row = db.prepare('SELECT * FROM objects WHERE id = ?').get(id) as
    | Record<string, unknown>
    | undefined
  return row ? parseObject(row) : undefined
}

export function updateObject(db: Database.Database, payload: UpdateObjectPayload): LifeObject {
  const existing = getObjectById(db, payload.id)
  if (!existing) throw new Error(`Object ${payload.id} not found`)

  const fields: string[] = ['updated_at = @updated_at']
  const params: Record<string, unknown> = { id: payload.id, updated_at: now() }

  if (payload.title !== undefined) {
    fields.push('title = @title')
    params.title = payload.title
  }
  if (payload.content !== undefined) {
    fields.push('content = @content')
    params.content = payload.content
  }
  if (payload.type !== undefined) {
    fields.push('type = @type')
    params.type = payload.type
  }
  if (payload.properties !== undefined) {
    fields.push('properties = @properties')
    params.properties = JSON.stringify(payload.properties)
  }
  if (payload.ai_metadata !== undefined) {
    fields.push('ai_metadata = @ai_metadata')
    params.ai_metadata = JSON.stringify(payload.ai_metadata)
  }

  db.prepare(`UPDATE objects SET ${fields.join(', ')} WHERE id = @id`).run(params)
  return getObjectById(db, payload.id)!
}

export function softDeleteObject(db: Database.Database, id: string): void {
  db.prepare('UPDATE objects SET archived = 1, updated_at = ? WHERE id = ?').run(now(), id)
}

export function queryObjects(
  db: Database.Database,
  filter: QueryObjectsFilter
): LifeObject[] {
  const conditions: string[] = ['archived = 0']
  const params: Record<string, unknown> = {}

  if (filter.type) {
    conditions.push('type = @type')
    params.type = filter.type
  }
  if (filter.status) {
    conditions.push(`json_extract(properties, '$.status') = @status`)
    params.status = filter.status
  }

  const limit = filter.limit ?? 200
  const offset = filter.offset ?? 0

  const rows = db
    .prepare(
      `SELECT * FROM objects WHERE ${conditions.join(' AND ')}
       ORDER BY created_at DESC LIMIT @limit OFFSET @offset`
    )
    .all({ ...params, limit, offset }) as Record<string, unknown>[]

  return rows.map(parseObject)
}

// ─── Full-text Search ─────────────────────────────────────────────────────────

export function searchObjects(db: Database.Database, query: string): LifeObject[] {
  const rows = db
    .prepare(
      `SELECT o.* FROM objects o
       JOIN objects_fts fts ON o.rowid = fts.rowid
       WHERE objects_fts MATCH ? AND o.archived = 0
       ORDER BY rank`
    )
    .all(query + '*') as Record<string, unknown>[]
  return rows.map(parseObject)
}

// ─── Relations ────────────────────────────────────────────────────────────────

export function createRelation(
  db: Database.Database,
  payload: CreateRelationPayload
): Relation {
  const id = randomUUID()
  const ts = now()
  db.prepare(
    'INSERT INTO relations (id, from_id, to_id, type, created_at) VALUES (?, ?, ?, ?, ?)'
  ).run(id, payload.from_id, payload.to_id, payload.type, ts)
  return { id, from_id: payload.from_id, to_id: payload.to_id, type: payload.type as RelationType, created_at: ts }
}

export function queryRelations(
  db: Database.Database,
  filter: { from_id?: string; to_id?: string }
): Relation[] {
  const conditions: string[] = []
  const params: unknown[] = []

  if (filter.from_id) {
    conditions.push('from_id = ?')
    params.push(filter.from_id)
  }
  if (filter.to_id) {
    conditions.push('to_id = ?')
    params.push(filter.to_id)
  }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : ''
  const rows = db
    .prepare(`SELECT * FROM relations ${where} ORDER BY created_at DESC`)
    .all(...params) as Relation[]
  return rows
}

// ─── Settings ─────────────────────────────────────────────────────────────────

export function getSetting(db: Database.Database, key: string): string | undefined {
  const row = db.prepare('SELECT value FROM settings WHERE key = ?').get(key) as
    | { value: string }
    | undefined
  return row?.value
}

export function setSetting(db: Database.Database, key: string, value: string): void {
  db.prepare('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)').run(key, value)
}
