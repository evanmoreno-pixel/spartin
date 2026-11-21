import { mkdirSync } from 'node:fs'
import { dirname } from 'node:path'
import { DatabaseSync } from 'node:sqlite'
import type { User } from '../../../shared/contracts.js'
import { seedDemoData } from './demoSeeds.js'

const migrations = [
  (db: DatabaseSync) => db.exec(`
    CREATE TABLE users (
      user_id TEXT PRIMARY KEY,
      display_name TEXT NOT NULL,
      role TEXT NOT NULL CHECK (role IN ('organizer', 'participant'))
    ) STRICT;

    CREATE TABLE events (
      event_id TEXT PRIMARY KEY,
      organizer_id TEXT NOT NULL REFERENCES users (user_id),
      title TEXT NOT NULL CHECK (length(trim(title)) BETWEEN 1 AND 150),
      description TEXT NOT NULL DEFAULT '',
      start_time TEXT NOT NULL,
      end_time TEXT NOT NULL CHECK (end_time > start_time),
      location TEXT NOT NULL CHECK (length(trim(location)) BETWEEN 1 AND 255),
      capacity INTEGER CHECK (capacity >= 0),
      status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'postponed')),
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    ) STRICT;

    CREATE INDEX events_organizer_schedule ON events (organizer_id, start_time, event_id);
    CREATE INDEX events_catalog_schedule ON events (status, start_time, event_id);
  `),
  null, // Version 2 was the Phase 1 seed marker. Existing databases keep it.
  (db: DatabaseSync) => db.exec(`
    ALTER TABLE events ADD COLUMN waitlist_enabled INTEGER NOT NULL DEFAULT 0
      CHECK (waitlist_enabled IN (0, 1));

    CREATE TABLE participation (
      participation_id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users (user_id),
      event_id TEXT NOT NULL REFERENCES events (event_id) ON DELETE CASCADE,
      status TEXT NOT NULL CHECK (status IN ('joined', 'waitlisted', 'passed', 'left')),
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      waitlist_order INTEGER UNIQUE,
      UNIQUE (user_id, event_id),
      CHECK ((status = 'waitlisted' AND waitlist_order IS NOT NULL AND waitlist_order > 0)
        OR (status <> 'waitlisted' AND waitlist_order IS NULL))
    ) STRICT;

    CREATE INDEX participation_event_status ON participation (event_id, status, waitlist_order);
    CREATE INDEX participation_user_status ON participation (user_id, status, event_id);

    CREATE TABLE waitlist_sequence (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      last_order INTEGER NOT NULL DEFAULT 0 CHECK (last_order >= 0)
    ) STRICT;
    INSERT INTO waitlist_sequence (id) VALUES (1);

    CREATE TABLE demo_seed_history (name TEXT PRIMARY KEY) STRICT;
  `),
  (db: DatabaseSync) => db.exec(`
    ALTER TABLE events ADD COLUMN latitude REAL CHECK (latitude BETWEEN -90 AND 90);
    ALTER TABLE events ADD COLUMN longitude REAL CHECK (
      (latitude IS NULL AND longitude IS NULL)
      OR (latitude IS NOT NULL AND longitude IS NOT NULL AND longitude BETWEEN -180 AND 180)
    );
  `),
]

export function transaction<T>(db: DatabaseSync, work: () => T): T {
  db.exec('BEGIN IMMEDIATE')
  try {
    const result = work()
    db.exec('COMMIT')
    return result
  } catch (error) {
    db.exec('ROLLBACK')
    throw error
  }
}

export function openDatabase(filename: string) {
  if (filename !== ':memory:') mkdirSync(dirname(filename), { recursive: true })
  const db = new DatabaseSync(filename, { enableForeignKeyConstraints: true })
  try {
    db.exec('PRAGMA busy_timeout = 5000')
    transaction(db, () => {
      db.exec('CREATE TABLE IF NOT EXISTS schema_migrations (version INTEGER PRIMARY KEY)')
      const applied = new Set(db.prepare('SELECT version FROM schema_migrations').all().map(row => row.version))
      const markApplied = db.prepare('INSERT INTO schema_migrations (version) VALUES (?)')
      migrations.forEach((migrate, index) => {
        const version = index + 1
        if (!migrate || applied.has(version)) return
        migrate(db)
        markApplied.run(version)
      })
      seedDemoData(db, applied.has(2))
    })
    return db
  } catch (error) {
    db.close()
    throw error
  }
}

export function findUser(db: DatabaseSync, userId: string): User | undefined {
  return db.prepare('SELECT user_id AS userId, display_name AS displayName, role FROM users WHERE user_id = ?')
    .get(userId) as User | undefined
}
