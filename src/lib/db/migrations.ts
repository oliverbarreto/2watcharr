import { Database } from 'sqlite';
import fs from 'fs/promises';
import path from 'path';

/**
 * Run database migrations
 * @param db Database instance
 */
export async function runMigrations(db: Database): Promise<void> {
  // Create migrations table if it doesn't exist
  await db.exec(`
    CREATE TABLE IF NOT EXISTS migrations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      applied_at INTEGER NOT NULL DEFAULT (unixepoch())
    );
  `);

  // Read and execute the schema file
  const schemaPath = path.join(process.cwd(), 'src/lib/db/schema.sql');
  const schemaSql = await fs.readFile(schemaPath, 'utf-8');

  // Check if initial schema has been applied
  const migration = await db.get(
    'SELECT * FROM migrations WHERE name = ?',
    'initial_schema'
  );

  if (!migration) {
    console.log('Running initial schema migration...');
    await db.exec(schemaSql);
    await db.run(
      'INSERT INTO migrations (name) VALUES (?)',
      'initial_schema'
    );
    console.log('Initial schema migration completed.');
  }

  // Check if allow_channel_deletion migration has been applied
  const migration2 = await db.get(
    'SELECT * FROM migrations WHERE name = ?',
    'allow_channel_deletion'
  );

  if (!migration2) {
    console.log('Running allow_channel_deletion migration...');
    await db.run('PRAGMA foreign_keys = OFF');
    await db.exec(`
      BEGIN TRANSACTION;
      
      -- 1. Create backup
      CREATE TABLE videos_backup AS SELECT * FROM videos;
      
      -- 2. Drop old table
      DROP TABLE videos;
      
      -- 3. Recreate table with new schema
      CREATE TABLE videos (
        id TEXT PRIMARY KEY,
        youtube_id TEXT NOT NULL UNIQUE,
        title TEXT NOT NULL,
        description TEXT,
        duration INTEGER,
        thumbnail_url TEXT,
        video_url TEXT NOT NULL,
        upload_date TEXT,
        published_date TEXT,
        channel_id TEXT,
        watched BOOLEAN NOT NULL DEFAULT 0,
        favorite BOOLEAN NOT NULL DEFAULT 0,
        priority TEXT CHECK(priority IN ('none', 'low', 'medium', 'high')) DEFAULT 'none',
        custom_order INTEGER,
        user_id TEXT,
        created_at INTEGER NOT NULL DEFAULT (unixepoch()),
        updated_at INTEGER NOT NULL DEFAULT (unixepoch()),
        FOREIGN KEY (channel_id) REFERENCES channels(id) ON DELETE SET NULL,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );
      
      -- 4. Copy data back
      INSERT INTO videos SELECT * FROM videos_backup;
      
      -- 5. Drop backup
      DROP TABLE videos_backup;
      
      -- 6. Recreate indexes
      CREATE INDEX idx_videos_channel_id ON videos(channel_id);
      CREATE INDEX idx_videos_watched ON videos(watched);
      CREATE INDEX idx_videos_favorite ON videos(favorite);
      CREATE INDEX idx_videos_priority ON videos(priority);
      CREATE INDEX idx_videos_created_at ON videos(created_at);
      
      COMMIT;
    `);
    await db.run('PRAGMA foreign_keys = ON');

    await db.run(
      'INSERT INTO migrations (name) VALUES (?)',
      'allow_channel_deletion'
    );
    console.log('allow_channel_deletion migration completed.');
  }

  // Check if add_view_count migration has been applied
  const migration3 = await db.get(
    'SELECT * FROM migrations WHERE name = ?',
    'add_view_count'
  );

  if (!migration3) {
    console.log('Running add_view_count migration...');
    try {
      await db.run('ALTER TABLE videos ADD COLUMN view_count INTEGER');
      await db.run(
        'INSERT INTO migrations (name) VALUES (?)',
        'add_view_count'
      );
      console.log('add_view_count migration completed.');
    } catch (error) {
      // If the column already exists, just insert the migration record
      if (error instanceof Error && error.message.includes('duplicate column name')) {
        await db.run(
          'INSERT INTO migrations (name) VALUES (?)',
          'add_view_count'
        );
        console.log('add_view_count column already existed, migration marked as completed.');
      } else {
        throw error;
      }
    }
  }

  // Check if add_is_deleted migration has been applied
  const migration4 = await db.get(
    'SELECT * FROM migrations WHERE name = ?',
    'add_is_deleted'
  );

  if (!migration4) {
    console.log('Running add_is_deleted migration...');
    try {
      await db.run('ALTER TABLE videos ADD COLUMN is_deleted BOOLEAN NOT NULL DEFAULT 0');
      await db.run('CREATE INDEX idx_videos_is_deleted ON videos(is_deleted)');
      await db.run(
        'INSERT INTO migrations (name) VALUES (?)',
        'add_is_deleted'
      );
      console.log('add_is_deleted migration completed.');
    } catch (error) {
      if (error instanceof Error && error.message.includes('duplicate column name')) {
        await db.run(
          'INSERT INTO migrations (name) VALUES (?)',
          'add_is_deleted'
        );
        console.log('is_deleted column already existed, migration marked as completed.');
      } else {
        throw error;
      }
    }
  }
}
