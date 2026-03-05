import { Database } from 'sqlite';

/**
 * Migration to add LabcastARR integration supports
 */
export async function addLabcastarrIntegrations(db: Database): Promise<void> {
    const migrationName = 'add_labcastarr_integrations';

    const migration = await db.get(
        'SELECT * FROM migrations WHERE name = ?',
        migrationName
    );

    if (migration) return;

    console.log(`Running migration: ${migrationName}...`);

    await db.exec(`
    CREATE TABLE IF NOT EXISTS labcastarr_integrations (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      enabled BOOLEAN NOT NULL DEFAULT 0,
      name TEXT NOT NULL, -- Logical name for the integration (e.g. "My Tech Channel")
      api_url TEXT NOT NULL,
      api_token TEXT NOT NULL,
      channel_id TEXT NOT NULL,
      auto_tag TEXT NOT NULL DEFAULT '2WatchARR',
      audio_quality TEXT NOT NULL DEFAULT 'default',
      audio_language TEXT NOT NULL DEFAULT 'default',
      created_at INTEGER NOT NULL DEFAULT (unixepoch()),
      updated_at INTEGER NOT NULL DEFAULT (unixepoch()),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_labcastarr_integrations_user_id ON labcastarr_integrations(user_id);
    CREATE INDEX IF NOT EXISTS idx_labcastarr_integrations_enabled ON labcastarr_integrations(enabled);
  `);

    await db.run(
        'INSERT INTO migrations (name) VALUES (?)',
        migrationName
    );

    console.log(`Migration ${migrationName} completed.`);
}
