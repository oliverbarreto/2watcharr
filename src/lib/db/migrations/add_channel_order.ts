import { Database } from 'sqlite';

/**
 * Migration: Add custom_order to channels
 */
export async function addChannelOrder(db: Database): Promise<void> {
  const migrationName = 'add_channel_order';
  
  const migration = await db.get(
    'SELECT * FROM migrations WHERE name = ?',
    migrationName
  );

  if (!migration) {
    console.log(`Running ${migrationName} migration...`);
    try {
      await db.run('ALTER TABLE channels ADD COLUMN custom_order INTEGER');
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
