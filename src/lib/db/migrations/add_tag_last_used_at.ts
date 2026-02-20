import { Database } from 'sqlite';

/**
 * Migration: Add last_used_at to tags
 */
export async function addTagLastUsedAt(db: Database): Promise<void> {
  const migrationName = 'add_tag_last_used_at';
  
  const migration = await db.get(
    'SELECT * FROM migrations WHERE name = ?',
    migrationName
  );

  if (!migration) {
    console.log(`Running ${migrationName} migration...`);
    try {
      // Add last_used_at column
      await db.run('ALTER TABLE tags ADD COLUMN last_used_at INTEGER');
      
      // Add index for performance
      await db.run('CREATE INDEX IF NOT EXISTS idx_tags_last_used_at ON tags(last_used_at)');
      
      // Initialize existing tags with their created_at value
      await db.run('UPDATE tags SET last_used_at = created_at WHERE last_used_at IS NULL');

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
        console.log(`${migrationName} column already existed, migration marked as completed.`);
      } else {
        throw error;
      }
    }
  }
}
