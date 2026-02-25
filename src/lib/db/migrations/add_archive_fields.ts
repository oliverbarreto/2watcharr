import { Database } from 'sqlite';

/**
 * Migration: Add archive fields to episodes
 */
export async function addArchiveFields(db: Database): Promise<void> {
  const migrationName = 'add_archive_fields';
  
  const migration = await db.get(
    'SELECT * FROM migrations WHERE name = ?',
    migrationName
  );

  if (!migration) {
    console.log(`Running ${migrationName} migration...`);
    try {
      // Add is_archived column
      await db.run('ALTER TABLE episodes ADD COLUMN is_archived BOOLEAN NOT NULL DEFAULT 0');
      // Add archived_at column
      await db.run('ALTER TABLE episodes ADD COLUMN archived_at INTEGER');
      
      // Create indexes
      await db.run('CREATE INDEX IF NOT EXISTS idx_episodes_is_archived ON episodes(is_archived)');
      await db.run('CREATE INDEX IF NOT EXISTS idx_episodes_archived_at ON episodes(archived_at)');
      
      await db.run(
        'INSERT INTO migrations (name) VALUES (?)',
        migrationName
      );
      console.log(`${migrationName} migration completed.`);
    } catch (error) {
      if (error instanceof Error && error.message.includes('duplicate column name')) {
        await db.run(
          'INSERT INTO migrations (name) VALUES (?)',
          migrationName
        );
        console.log(`${migrationName} columns already existed, migration marked as completed.`);
      } else {
        throw error;
      }
    }
  }
}
