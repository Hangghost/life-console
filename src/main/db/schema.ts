import Database from 'better-sqlite3'

export function initializeSchema(db: Database.Database): void {
  // Migrate: drop old object model tables if they exist
  db.exec(`
    PRAGMA journal_mode = WAL;
    PRAGMA foreign_keys = ON;

    DROP TABLE IF EXISTS objects_fts;
    DROP TRIGGER IF EXISTS objects_fts_insert;
    DROP TRIGGER IF EXISTS objects_fts_update;
    DROP TRIGGER IF EXISTS objects_fts_delete;
    DROP TABLE IF EXISTS relations;
    DROP TABLE IF EXISTS objects;

    CREATE TABLE IF NOT EXISTS records (
      id         TEXT PRIMARY KEY,
      skill_name TEXT NOT NULL,
      input      TEXT,            -- JSON
      output     TEXT,            -- JSON, nullable
      error      TEXT,            -- nullable
      created_at TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_records_skill_name ON records(skill_name);
    CREATE INDEX IF NOT EXISTS idx_records_created_at ON records(created_at);

    CREATE TABLE IF NOT EXISTS settings (
      key   TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );
  `)
}
