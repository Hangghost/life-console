import Database from 'better-sqlite3'

export function initializeSchema(db: Database.Database): void {
  db.exec(`
    PRAGMA journal_mode = WAL;
    PRAGMA foreign_keys = ON;

    CREATE TABLE IF NOT EXISTS objects (
      id          TEXT PRIMARY KEY,
      type        TEXT NOT NULL,
      title       TEXT,
      content     TEXT,
      properties  TEXT,          -- JSON
      source      TEXT,
      ai_metadata TEXT,          -- JSON
      created_at  TEXT NOT NULL,
      updated_at  TEXT NOT NULL,
      archived    INTEGER NOT NULL DEFAULT 0
    );

    CREATE INDEX IF NOT EXISTS idx_objects_type ON objects(type);
    CREATE INDEX IF NOT EXISTS idx_objects_archived ON objects(archived);
    CREATE INDEX IF NOT EXISTS idx_objects_created_at ON objects(created_at);

    CREATE TABLE IF NOT EXISTS relations (
      id         TEXT PRIMARY KEY,
      from_id    TEXT NOT NULL REFERENCES objects(id),
      to_id      TEXT NOT NULL REFERENCES objects(id),
      type       TEXT NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_relations_from ON relations(from_id);
    CREATE INDEX IF NOT EXISTS idx_relations_to ON relations(to_id);

    CREATE VIRTUAL TABLE IF NOT EXISTS objects_fts USING fts5(
      id UNINDEXED,
      title,
      content,
      content='objects',
      content_rowid='rowid'
    );

    CREATE TRIGGER IF NOT EXISTS objects_fts_insert
    AFTER INSERT ON objects BEGIN
      INSERT INTO objects_fts(rowid, id, title, content)
        VALUES (new.rowid, new.id, new.title, new.content);
    END;

    CREATE TRIGGER IF NOT EXISTS objects_fts_update
    AFTER UPDATE ON objects BEGIN
      INSERT INTO objects_fts(objects_fts, rowid, id, title, content)
        VALUES ('delete', old.rowid, old.id, old.title, old.content);
      INSERT INTO objects_fts(rowid, id, title, content)
        VALUES (new.rowid, new.id, new.title, new.content);
    END;

    CREATE TRIGGER IF NOT EXISTS objects_fts_delete
    AFTER DELETE ON objects BEGIN
      INSERT INTO objects_fts(objects_fts, rowid, id, title, content)
        VALUES ('delete', old.rowid, old.id, old.title, old.content);
    END;

    CREATE TABLE IF NOT EXISTS settings (
      key   TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );
  `)
}
