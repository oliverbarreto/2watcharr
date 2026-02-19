import { Database } from 'sqlite';

/**
 * Migration: Add like_status to episodes
 */
export async function addLikeStatus(db: Database): Promise<void> {
  const migrationName = 'add_like_status';
  
  const migration = await db.get(
    'SELECT * FROM migrations WHERE name = ?',
    migrationName
  );

  if (!migration) {
    console.log(`Running ${migrationName} migration...`);
    try {
      await db.run("ALTER TABLE episodes ADD COLUMN like_status TEXT CHECK(like_status IN ('none', 'like', 'dislike')) DEFAULT 'none'");
      await db.run('CREATE INDEX IF NOT EXISTS idx_episodes_like_status ON episodes(like_status)');
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
