import { Database } from 'sqlite';

/**
 * Migration to add notifications table
 */
export async function addNotifications(db: Database): Promise<void> {
  const migrationName = 'add_notifications';

  const migration = await db.get(
    'SELECT * FROM migrations WHERE name = ?',
    migrationName
  );

  if (migration) return;

  console.log(`Running migration: ${migrationName}...`);

  await db.exec(`
    CREATE TABLE IF NOT EXISTS notifications (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      type TEXT NOT NULL,
      channel_name TEXT,
      executed_by TEXT,
      description TEXT,
      episode_id TEXT,
      is_read BOOLEAN NOT NULL DEFAULT 0,
      created_at INTEGER NOT NULL DEFAULT (unixepoch()),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (episode_id) REFERENCES episodes(id) ON DELETE SET NULL
    );

    CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
    CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);
    CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
    CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at);
  `);

  await db.run(
    'INSERT INTO migrations (name) VALUES (?)',
    migrationName
  );

  console.log(`Migration ${migrationName} completed.`);
}
