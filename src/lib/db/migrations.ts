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

  // Check if add_video_events migration has been applied
  const migration5 = await db.get(
    'SELECT * FROM migrations WHERE name = ?',
    'add_video_events'
  );

  if (!migration5) {
    console.log('Running add_video_events migration...');
    try {
      await db.exec(`
        CREATE TABLE IF NOT EXISTS video_events (
          id TEXT PRIMARY KEY,
          video_id TEXT NOT NULL,
          type TEXT NOT NULL,
          created_at INTEGER NOT NULL DEFAULT (unixepoch()),
          FOREIGN KEY (video_id) REFERENCES videos(id) ON DELETE CASCADE
        );
        CREATE INDEX IF NOT EXISTS idx_video_events_video_id ON video_events(video_id);
        CREATE INDEX IF NOT EXISTS idx_video_events_type ON video_events(type);
        CREATE INDEX IF NOT EXISTS idx_video_events_created_at ON video_events(created_at);
      `);

      // Backfill: Create 'added' events for all existing videos using their created_at date
      await db.run(`
        INSERT INTO video_events (id, video_id, type, created_at)
        SELECT lower(hex(randomblob(4)) || '-' || hex(randomblob(2)) || '-' || '4' || substr(hex(randomblob(2)), 2) || '-' || substr('89ab', abs(random()) % 4 + 1, 1) || substr(hex(randomblob(2)), 2) || '-' || hex(randomblob(6))),
               id, 'added', created_at
        FROM videos
      `);

      await db.run(
        'INSERT INTO migrations (name) VALUES (?)',
        'add_video_events'
      );
      console.log('add_video_events migration completed.');
    } catch (error) {
      console.error('Error running add_video_events migration:', error);
      throw error;
    }
  }

  // Check if add_podcast_support migration has been applied
  const migration6 = await db.get(
    'SELECT * FROM migrations WHERE name = ?',
    'add_podcast_support'
  );

  if (!migration6) {
    console.log('Running add_podcast_support migration...');
    
    // Check if the episodes table already exists (new installation with generic schema)
    const episodesTable = await db.get("SELECT name FROM sqlite_master WHERE type='table' AND name='episodes'");
    if (episodesTable) {
        console.log('Episodes table already exists, marking add_podcast_support as completed.');
        await db.run("INSERT OR IGNORE INTO migrations (name) VALUES ('add_podcast_support')");
        return;
    }

    await db.run('PRAGMA foreign_keys = OFF');
    try {
      // Check column names in old channels table for dynamic mapping
      const tableInfo = await db.all('PRAGMA table_info(channels)');
      const urlColumn = tableInfo.find(c => c.name === 'url' || c.name === 'channel_url')?.name || 'url';
      const thumbColumn = tableInfo.find(c => c.name === 'thumbnail_url' || c.name === 'thumbnailUrl')?.name || 'thumbnail_url';

      await db.exec(`
        BEGIN TRANSACTION;
        
        -- 1. Migrate Channels to a generic structure
        CREATE TABLE IF NOT EXISTS channels_new (
          id TEXT PRIMARY KEY,
          type TEXT NOT NULL DEFAULT 'video',
          name TEXT NOT NULL,
          description TEXT,
          thumbnail_url TEXT,
          url TEXT NOT NULL,
          created_at INTEGER NOT NULL DEFAULT (unixepoch()),
          updated_at INTEGER NOT NULL DEFAULT (unixepoch())
        );
        
        INSERT INTO channels_new (id, type, name, description, thumbnail_url, url, created_at, updated_at)
        SELECT id, 'video', name, description, ${thumbColumn}, ${urlColumn}, created_at, updated_at FROM channels;
        
        DROP TABLE channels;
        ALTER TABLE channels_new RENAME TO channels;
        
        -- 2. Migrate Videos to Episodes
        CREATE TABLE IF NOT EXISTS episodes (
          id TEXT PRIMARY KEY,
          type TEXT NOT NULL DEFAULT 'video',
          external_id TEXT NOT NULL UNIQUE,
          title TEXT NOT NULL,
          description TEXT,
          duration INTEGER,
          thumbnail_url TEXT,
          url TEXT NOT NULL,
          upload_date TEXT,
          published_date TEXT,
          view_count INTEGER,
          channel_id TEXT,
          watched BOOLEAN NOT NULL DEFAULT 0,
          favorite BOOLEAN NOT NULL DEFAULT 0,
          is_deleted BOOLEAN NOT NULL DEFAULT 0,
          priority TEXT CHECK(priority IN ('none', 'low', 'medium', 'high')) DEFAULT 'none',
          custom_order INTEGER,
          user_id TEXT,
          created_at INTEGER NOT NULL DEFAULT (unixepoch()),
          updated_at INTEGER NOT NULL DEFAULT (unixepoch()),
          FOREIGN KEY (channel_id) REFERENCES channels(id) ON DELETE SET NULL,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        );
        
        INSERT INTO episodes (
          id, type, external_id, title, description, duration, thumbnail_url,
          url, upload_date, published_date, view_count, channel_id,
          watched, favorite, is_deleted, priority, custom_order, user_id,
          created_at, updated_at
        )
        SELECT 
          id, 'video', youtube_id, title, description, duration, thumbnail_url,
          video_url, upload_date, published_date, view_count, channel_id,
          watched, favorite, is_deleted, priority, custom_order, user_id,
          created_at, updated_at
        FROM videos;
        
        DROP TABLE videos;
        
        -- 3. Migrate video_tags to episode_tags
        CREATE TABLE IF NOT EXISTS episode_tags (
          episode_id TEXT NOT NULL,
          tag_id TEXT NOT NULL,
          created_at INTEGER NOT NULL DEFAULT (unixepoch()),
          PRIMARY KEY (episode_id, tag_id),
          FOREIGN KEY (episode_id) REFERENCES episodes(id) ON DELETE CASCADE,
          FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
        );
        
        INSERT INTO episode_tags (episode_id, tag_id, created_at)
        SELECT video_id, tag_id, created_at FROM video_tags;
        
        DROP TABLE video_tags;
        
        -- 4. Migrate video_events to media_events
        CREATE TABLE IF NOT EXISTS media_events (
          id TEXT PRIMARY KEY,
          episode_id TEXT NOT NULL,
          type TEXT NOT NULL,
          created_at INTEGER NOT NULL DEFAULT (unixepoch()),
          FOREIGN KEY (episode_id) REFERENCES episodes(id) ON DELETE CASCADE
        );
        
        INSERT INTO media_events (id, episode_id, type, created_at)
        SELECT id, video_id, type, created_at FROM video_events;
        
        DROP TABLE video_events;
        
        -- 5. Create Indexes
        CREATE INDEX IF NOT EXISTS idx_episodes_type ON episodes(type);
        CREATE INDEX IF NOT EXISTS idx_episodes_channel_id ON episodes(channel_id);
        CREATE INDEX IF NOT EXISTS idx_episodes_watched ON episodes(watched);
        CREATE INDEX IF NOT EXISTS idx_episodes_is_deleted ON episodes(is_deleted);
        CREATE INDEX IF NOT EXISTS idx_episodes_favorite ON episodes(favorite);
        CREATE INDEX IF NOT EXISTS idx_episodes_priority ON episodes(priority);
        CREATE INDEX IF NOT EXISTS idx_episodes_created_at ON episodes(created_at);
        CREATE INDEX IF NOT EXISTS idx_episode_tags_tag_id ON episode_tags(tag_id);
        CREATE INDEX IF NOT EXISTS idx_media_events_episode_id ON media_events(episode_id);
        CREATE INDEX IF NOT EXISTS idx_media_events_type ON media_events(type);
        CREATE INDEX IF NOT EXISTS idx_media_events_created_at ON media_events(created_at);
        CREATE INDEX IF NOT EXISTS idx_channels_type ON channels(type);
        
        -- 6. Record migration
        INSERT INTO migrations (name) VALUES ('add_podcast_support');
        
        COMMIT;
      `);
      await db.run('PRAGMA foreign_keys = ON');
      console.log('add_podcast_support migration completed.');
    } catch (error) {
      if (error instanceof Error && error.message.includes('already exists')) {
          console.log('Some tables already existed, marking add_podcast_support as completed.');
          await db.run("INSERT OR IGNORE INTO migrations (name) VALUES ('add_podcast_support')");
          await db.run('PRAGMA foreign_keys = ON');
          return;
      }
      try { await db.run('ROLLBACK'); } catch (e) {}
      await db.run('PRAGMA foreign_keys = ON');
      console.error('Error running add_podcast_support migration:', error);
      throw error;
    }
  }
}
