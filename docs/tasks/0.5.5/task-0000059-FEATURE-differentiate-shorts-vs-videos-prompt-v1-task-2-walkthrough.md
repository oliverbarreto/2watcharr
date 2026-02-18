# Shorts vs Videos Differentiation Walkthrough

I've implemented the differentiation between regular YouTube videos and YouTube Shorts. This ensures that Shorts are properly identified in the database and labeled in the UI.

## Changes Made

### 1. Database & Models
- Added `isShort` property to [MediaEpisode](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/lib/domain/models.ts#31-63) and related DTOs.
- Updated the database schema ([schema.sql](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/lib/db/schema.sql)) to include an `is_short` column in the `episodes` table.
- Added a migration ([migrations.ts](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/lib/db/migrations.ts)) to add the `is_short` column to existing databases and automatically identify existing Shorts based on their URL.

### 2. Backend Logic
- **YouTube Detection**: Updated [YouTubeMetadataService](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/lib/services/youtube-metadata.service.ts#12-112) to detect Shorts based on the URL (containing `/shorts/`) or duration (under 60 seconds).
- **Service Layer**: Updated [MediaService](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/lib/services/media.service.ts#14-374) to handle the `isShort` property during episode creation.
- **Repository**: Updated [EpisodeRepository](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/lib/repositories/episode.repository.ts#17-674) to persist and retrieve the `isShort` status.

### 3. UI Components
- **Badge Differentiation**: Updated [EpisodeCard](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/components/features/episodes/episode-card.tsx#55-694) and [EpisodeListRow](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/components/features/episodes/episode-list-row.tsx#48-674) to show a "Shorts" badge instead of "Video" for Short videos.

## Verification Results

### Automated Tests
- Ran [episode.repository.test.ts](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/lib/repositories/episode.repository.test.ts) to ensure data persistence works correctly.
- Ran [media.service.test.ts](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/lib/services/media.service.test.ts) to ensure the integration between service and repository is intact.

### Manual Verification
- Verified that Shorts URLs are correctly identified as Shorts.
- Verified that existing data is updated via the migration.

```diff:schema.sql
-- 2watcharr Database Schema
-- SQLite database for managing media episodes (Videos and Podcasts)

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  username TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,          -- Profile password
  display_name TEXT,
  emoji TEXT,                      -- Emoji for avatar
  color TEXT,                      -- Hex color for avatar
  is_admin BOOLEAN NOT NULL DEFAULT 0,
  api_token TEXT UNIQUE,           -- API Token for external access (Shortcuts)
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch())
);

-- Channels table
CREATE TABLE IF NOT EXISTS channels (
  id TEXT PRIMARY KEY,              -- YouTube channel ID or Podcast ID
  type TEXT NOT NULL DEFAULT 'video', -- 'video' or 'podcast'
  name TEXT NOT NULL,
  description TEXT,
  thumbnail_url TEXT,
  url TEXT NOT NULL,
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch())
);

-- Tags table
CREATE TABLE IF NOT EXISTS tags (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  color TEXT,                       -- Hex color for UI
  user_id TEXT NOT NULL,
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE(name, user_id)
);

-- Media episodes table (Videos and Podcast episodes)
CREATE TABLE IF NOT EXISTS episodes (
  id TEXT PRIMARY KEY,              -- Auto-generated UUID
  type TEXT NOT NULL DEFAULT 'video', -- 'video' or 'podcast'
  external_id TEXT NOT NULL,        -- YouTube video ID or Podcast episode ID
  title TEXT NOT NULL,
  description TEXT,
  duration INTEGER,                 -- Duration in seconds
  thumbnail_url TEXT,
  url TEXT NOT NULL,                -- Video URL or Podcast episode URL
  upload_date TEXT,                 -- Upload date (ISO 8601)
  published_date TEXT,              -- Published date (ISO 8601)
  view_count INTEGER,               -- View count
  channel_id TEXT,
  
  -- User management fields
  watched BOOLEAN NOT NULL DEFAULT 0,
  watch_status TEXT NOT NULL DEFAULT 'unwatched', -- 'unwatched', 'pending', 'watched'
  favorite BOOLEAN NOT NULL DEFAULT 0,
  is_deleted BOOLEAN NOT NULL DEFAULT 0,
  priority TEXT CHECK(priority IN ('none', 'low', 'medium', 'high')) DEFAULT 'none',
  custom_order INTEGER,             -- For manual reordering
  
  -- Metadata
  user_id TEXT NOT NULL,
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch()),
  
  FOREIGN KEY (channel_id) REFERENCES channels(id) ON DELETE SET NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE(external_id, user_id)
);

-- Episode-Tag relationship (many-to-many)
CREATE TABLE IF NOT EXISTS episode_tags (
  episode_id TEXT NOT NULL,
  tag_id TEXT NOT NULL,
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  
  PRIMARY KEY (episode_id, tag_id),
  FOREIGN KEY (episode_id) REFERENCES episodes(id) ON DELETE CASCADE,
  FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
);

-- Media events (added, watched, favorited, etc.)
CREATE TABLE IF NOT EXISTS media_events (
  id TEXT PRIMARY KEY,
  episode_id TEXT,                 -- Nullable because episode might be hard-deleted
  title TEXT,                      -- Preserved title for deleted episodes
  type TEXT,                       -- Preserved type (video/podcast) for deleted episodes
  event_type TEXT NOT NULL,        -- added, watched, unwatched, favorited, unfavorited, removed, restored, tagged, pending
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  
  FOREIGN KEY (episode_id) REFERENCES episodes(id) ON DELETE SET NULL
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_episodes_type ON episodes(type);
CREATE INDEX IF NOT EXISTS idx_episodes_channel_id ON episodes(channel_id);
CREATE INDEX IF NOT EXISTS idx_episodes_watched ON episodes(watched);
CREATE INDEX IF NOT EXISTS idx_episodes_watch_status ON episodes(watch_status);
CREATE INDEX IF NOT EXISTS idx_episodes_is_deleted ON episodes(is_deleted);
CREATE INDEX IF NOT EXISTS idx_episodes_favorite ON episodes(favorite);
CREATE INDEX IF NOT EXISTS idx_episodes_priority ON episodes(priority);
CREATE INDEX IF NOT EXISTS idx_episodes_created_at ON episodes(created_at);
CREATE INDEX IF NOT EXISTS idx_episode_tags_tag_id ON episode_tags(tag_id);
CREATE INDEX IF NOT EXISTS idx_tags_user_id ON tags(user_id);
CREATE INDEX IF NOT EXISTS idx_media_events_episode_id ON media_events(episode_id);
CREATE INDEX IF NOT EXISTS idx_media_events_type ON media_events(type);
CREATE INDEX IF NOT EXISTS idx_media_events_created_at ON media_events(created_at);
CREATE INDEX IF NOT EXISTS idx_channels_type ON channels(type);
===
-- 2watcharr Database Schema
-- SQLite database for managing media episodes (Videos and Podcasts)

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  username TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,          -- Profile password
  display_name TEXT,
  emoji TEXT,                      -- Emoji for avatar
  color TEXT,                      -- Hex color for avatar
  is_admin BOOLEAN NOT NULL DEFAULT 0,
  api_token TEXT UNIQUE,           -- API Token for external access (Shortcuts)
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch())
);

-- Channels table
CREATE TABLE IF NOT EXISTS channels (
  id TEXT PRIMARY KEY,              -- YouTube channel ID or Podcast ID
  type TEXT NOT NULL DEFAULT 'video', -- 'video' or 'podcast'
  name TEXT NOT NULL,
  description TEXT,
  thumbnail_url TEXT,
  url TEXT NOT NULL,
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch())
);

-- Tags table
CREATE TABLE IF NOT EXISTS tags (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  color TEXT,                       -- Hex color for UI
  user_id TEXT NOT NULL,
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE(name, user_id)
);

-- Media episodes table (Videos and Podcast episodes)
CREATE TABLE IF NOT EXISTS episodes (
  id TEXT PRIMARY KEY,              -- Auto-generated UUID
  type TEXT NOT NULL DEFAULT 'video', -- 'video' or 'podcast'
  external_id TEXT NOT NULL,        -- YouTube video ID or Podcast episode ID
  title TEXT NOT NULL,
  description TEXT,
  duration INTEGER,                 -- Duration in seconds
  thumbnail_url TEXT,
  url TEXT NOT NULL,                -- Video URL or Podcast episode URL
  upload_date TEXT,                 -- Upload date (ISO 8601)
  published_date TEXT,              -- Published date (ISO 8601)
  view_count INTEGER,               -- View count
  channel_id TEXT,
  
  -- User management fields
  watched BOOLEAN NOT NULL DEFAULT 0,
  watch_status TEXT NOT NULL DEFAULT 'unwatched', -- 'unwatched', 'pending', 'watched'
  favorite BOOLEAN NOT NULL DEFAULT 0,
  is_deleted BOOLEAN NOT NULL DEFAULT 0,
  priority TEXT CHECK(priority IN ('none', 'low', 'medium', 'high')) DEFAULT 'none',
  custom_order INTEGER,             -- For manual reordering
  is_short BOOLEAN NOT NULL DEFAULT 0, -- Whether it's a YouTube Short
  
  -- Metadata
  user_id TEXT NOT NULL,
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch()),
  
  FOREIGN KEY (channel_id) REFERENCES channels(id) ON DELETE SET NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE(external_id, user_id)
);

-- Episode-Tag relationship (many-to-many)
CREATE TABLE IF NOT EXISTS episode_tags (
  episode_id TEXT NOT NULL,
  tag_id TEXT NOT NULL,
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  
  PRIMARY KEY (episode_id, tag_id),
  FOREIGN KEY (episode_id) REFERENCES episodes(id) ON DELETE CASCADE,
  FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
);

-- Media events (added, watched, favorited, etc.)
CREATE TABLE IF NOT EXISTS media_events (
  id TEXT PRIMARY KEY,
  episode_id TEXT,                 -- Nullable because episode might be hard-deleted
  title TEXT,                      -- Preserved title for deleted episodes
  type TEXT,                       -- Preserved type (video/podcast) for deleted episodes
  event_type TEXT NOT NULL,        -- added, watched, unwatched, favorited, unfavorited, removed, restored, tagged, pending
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  
  FOREIGN KEY (episode_id) REFERENCES episodes(id) ON DELETE SET NULL
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_episodes_type ON episodes(type);
CREATE INDEX IF NOT EXISTS idx_episodes_is_short ON episodes(is_short);
CREATE INDEX IF NOT EXISTS idx_episodes_channel_id ON episodes(channel_id);
CREATE INDEX IF NOT EXISTS idx_episodes_watched ON episodes(watched);
CREATE INDEX IF NOT EXISTS idx_episodes_watch_status ON episodes(watch_status);
CREATE INDEX IF NOT EXISTS idx_episodes_is_deleted ON episodes(is_deleted);
CREATE INDEX IF NOT EXISTS idx_episodes_favorite ON episodes(favorite);
CREATE INDEX IF NOT EXISTS idx_episodes_priority ON episodes(priority);
CREATE INDEX IF NOT EXISTS idx_episodes_created_at ON episodes(created_at);
CREATE INDEX IF NOT EXISTS idx_episode_tags_tag_id ON episode_tags(tag_id);
CREATE INDEX IF NOT EXISTS idx_tags_user_id ON tags(user_id);
CREATE INDEX IF NOT EXISTS idx_media_events_episode_id ON media_events(episode_id);
CREATE INDEX IF NOT EXISTS idx_media_events_type ON media_events(type);
CREATE INDEX IF NOT EXISTS idx_media_events_created_at ON media_events(created_at);
CREATE INDEX IF NOT EXISTS idx_channels_type ON channels(type);
```
```diff:migrations.ts
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
    
    // Mark legacy migrations as completed since they are built into schema.sql
    const legacyMigrations = [
      'allow_channel_deletion',
      'add_view_count',
      'add_is_deleted',
      'add_video_events',
      'add_podcast_support',
      'add_user_management'
    ];
    for (const name of legacyMigrations) {
      await db.run('INSERT OR IGNORE INTO migrations (name) VALUES (?)', name);
    }
    console.log('Initial schema migration completed and legacy migrations marked as done.');
  }

  // Check if allow_channel_deletion migration has been applied
  const migration2 = await db.get(
    'SELECT * FROM migrations WHERE name = ?',
    'allow_channel_deletion'
  );

  if (!migration2) {
    const videosTable = await db.get("SELECT name FROM sqlite_master WHERE type='table' AND name='videos'");
    if (!videosTable) {
      console.log('Videos table not found, marking allow_channel_deletion migration as completed.');
      await db.run(
        'INSERT INTO migrations (name) VALUES (?)',
        'allow_channel_deletion'
      );
    } else {
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
    } else {
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
            } else {
                try { await db.run('ROLLBACK'); } catch { }
                await db.run('PRAGMA foreign_keys = ON');
                console.error('Error running add_podcast_support migration:', error);
                throw error;
            }
        }
    }
  }
  // Check if add_user_management migration has been applied
  const migration7 = await db.get(
    'SELECT * FROM migrations WHERE name = ?',
    'add_user_management'
  );

  if (!migration7) {
    console.log('Running add_user_management migration...');
    await db.run('PRAGMA foreign_keys = OFF');
    try {
      await db.exec(`
        BEGIN TRANSACTION;

        -- 1. Recreate users table with new columns
        CREATE TABLE IF NOT EXISTS users_backup (
          id TEXT PRIMARY KEY,
          created_at INTEGER,
          updated_at INTEGER
        );
        INSERT INTO users_backup SELECT * FROM users;
        DROP TABLE users;
        
        CREATE TABLE users (
          id TEXT PRIMARY KEY,
          username TEXT NOT NULL UNIQUE,
          password TEXT NOT NULL,
          display_name TEXT,
          emoji TEXT,
          color TEXT,
          is_admin BOOLEAN NOT NULL DEFAULT 0,
          created_at INTEGER NOT NULL DEFAULT (unixepoch()),
          updated_at INTEGER NOT NULL DEFAULT (unixepoch())
        );

        -- 2. Create a temporary system user for existing data
        -- This will be replaced/updated by the onboarding flow
        INSERT INTO users (id, username, password, display_name, is_admin)
        VALUES ('default-admin', 'admin', 'changeme', 'System Admin', 1);

        -- 3. Update tags table
        CREATE TABLE tags_new (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          color TEXT,
          user_id TEXT NOT NULL,
          created_at INTEGER NOT NULL DEFAULT (unixepoch()),
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
          UNIQUE(name, user_id)
        );
        INSERT INTO tags_new (id, name, color, user_id, created_at)
        SELECT id, name, color, COALESCE(user_id, 'default-admin'), created_at FROM tags;
        DROP TABLE tags;
        ALTER TABLE tags_new RENAME TO tags;

        -- 4. Update episodes table
        CREATE TABLE episodes_new (
          id TEXT PRIMARY KEY,
          type TEXT NOT NULL DEFAULT 'video',
          external_id TEXT NOT NULL,
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
          user_id TEXT NOT NULL,
          created_at INTEGER NOT NULL DEFAULT (unixepoch()),
          updated_at INTEGER NOT NULL DEFAULT (unixepoch()),
          FOREIGN KEY (channel_id) REFERENCES channels(id) ON DELETE SET NULL,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
          UNIQUE(external_id, user_id)
        );
        INSERT INTO episodes_new (
          id, type, external_id, title, description, duration, thumbnail_url,
          url, upload_date, published_date, view_count, channel_id,
          watched, favorite, is_deleted, priority, custom_order, user_id,
          created_at, updated_at
        )
        SELECT 
          id, type, external_id, title, description, duration, thumbnail_url,
          url, upload_date, published_date, view_count, channel_id,
          watched, favorite, is_deleted, priority, custom_order, COALESCE(user_id, 'default-admin'),
          created_at, updated_at
        FROM episodes;
        DROP TABLE episodes;
        ALTER TABLE episodes_new RENAME TO episodes;

        -- 5. Re-create indexes
        CREATE INDEX IF NOT EXISTS idx_episodes_type ON episodes(type);
        CREATE INDEX IF NOT EXISTS idx_episodes_channel_id ON episodes(channel_id);
        CREATE INDEX IF NOT EXISTS idx_episodes_watched ON episodes(watched);
        CREATE INDEX IF NOT EXISTS idx_episodes_is_deleted ON episodes(is_deleted);
        CREATE INDEX IF NOT EXISTS idx_episodes_favorite ON episodes(favorite);
        CREATE INDEX IF NOT EXISTS idx_episodes_priority ON episodes(priority);
        CREATE INDEX IF NOT EXISTS idx_episodes_created_at ON episodes(created_at);
        CREATE INDEX IF NOT EXISTS idx_tags_user_id ON tags(user_id);

        -- 6. Clean up
        DROP TABLE IF EXISTS users_backup;

        -- 7. Record migration
        INSERT INTO migrations (name) VALUES ('add_user_management');

        COMMIT;
      `);
      console.log('add_user_management migration completed.');
    } catch (error) {
      try { await db.run('ROLLBACK'); } catch {}
      console.error('Error running add_user_management migration:', error);
      throw error;
    } finally {
      await db.run('PRAGMA foreign_keys = ON');
    }
  }

  // Check if add_watch_status migration has been applied
  const migration8 = await db.get(
    'SELECT * FROM migrations WHERE name = ?',
    'add_watch_status'
  );

  if (!migration8) {
    console.log('Running add_watch_status migration...');
    try {
      await db.run("ALTER TABLE episodes ADD COLUMN watch_status TEXT NOT NULL DEFAULT 'unwatched'");
      await db.run('CREATE INDEX IF NOT EXISTS idx_episodes_watch_status ON episodes(watch_status)');

      // Migrate existing 'watched' data
      await db.run("UPDATE episodes SET watch_status = 'watched' WHERE watched = 1");
      await db.run("UPDATE episodes SET watch_status = 'unwatched' WHERE watched = 0");

      await db.run(
        'INSERT INTO migrations (name) VALUES (?)',
        'add_watch_status'
      );
      console.log('add_watch_status migration completed.');
    } catch (error) {
      if (error instanceof Error && error.message.includes('duplicate column name')) {
        await db.run(
          'INSERT INTO migrations (name) VALUES (?)',
          'add_watch_status'
        );
        console.log('watch_status column already existed, migration marked as completed.');
      }
    }
  }

  // Check if add_channel_order migration has been applied
  const migration9 = await db.get(
    'SELECT * FROM migrations WHERE name = ?',
    'add_channel_order'
  );

  if (!migration9) {
    console.log('Running add_channel_order migration...');
    try {
      await db.run('ALTER TABLE channels ADD COLUMN custom_order INTEGER');
      await db.run(
        'INSERT INTO migrations (name) VALUES (?)',
        'add_channel_order'
      );
      console.log('add_channel_order migration completed.');
    } catch (error) {
      if (error instanceof Error && error.message.includes('duplicate column name')) {
        await db.run(
          'INSERT INTO migrations (name) VALUES (?)',
          'add_channel_order'
        );
        console.log('custom_order column already existed, migration marked as completed.');
      } else {
        throw error;
      }
    }
  }

  // Check if add_api_token migration has been applied
  const migration10 = await db.get(
    'SELECT * FROM migrations WHERE name = ?',
    'add_api_token'
  );

  if (!migration10) {
    console.log('Running add_api_token migration...');
    try {
      await db.run('ALTER TABLE users ADD COLUMN api_token TEXT');
      await db.run('CREATE UNIQUE INDEX IF NOT EXISTS idx_users_api_token ON users(api_token)');
      await db.run(
        'INSERT INTO migrations (name) VALUES (?)',
        'add_api_token'
      );
      console.log('add_api_token migration completed.');
    } catch (error) {
      if (error instanceof Error && error.message.includes('duplicate column name')) {
        await db.run(
          'INSERT INTO migrations (name) VALUES (?)',
          'add_api_token'
        );
        console.log('api_token column already existed, migration marked as completed.');
      } else {
        throw error;
      }
    }
  }

  // Check if add_event_metadata migration has been applied
  const migration11 = await db.get(
    'SELECT * FROM migrations WHERE name = ?',
    'add_event_metadata'
  );

  if (!migration11) {
    console.log('Running add_event_metadata migration...');
    await db.run('PRAGMA foreign_keys = OFF');
    try {
      await db.exec(`
        BEGIN TRANSACTION;

        -- 1. Create new table with updated schema
        CREATE TABLE media_events_new (
          id TEXT PRIMARY KEY,
          episode_id TEXT,
          title TEXT,
          type TEXT,
          event_type TEXT NOT NULL,
          created_at INTEGER NOT NULL DEFAULT (unixepoch()),
          FOREIGN KEY (episode_id) REFERENCES episodes(id) ON DELETE SET NULL
        );

        -- 2. Copy data from old table, joining with episodes to get title and type
        INSERT INTO media_events_new (id, episode_id, title, type, event_type, created_at)
        SELECT me.id, me.episode_id, e.title, e.type, me.type, me.created_at
        FROM media_events me
        LEFT JOIN episodes e ON me.episode_id = e.id;

        -- 3. Replace old table
        DROP TABLE media_events;
        ALTER TABLE media_events_new RENAME TO media_events;

        -- 4. Recreate indexes
        CREATE INDEX IF NOT EXISTS idx_media_events_episode_id ON media_events(episode_id);
        CREATE INDEX IF NOT EXISTS idx_media_events_event_type ON media_events(event_type);
        CREATE INDEX IF NOT EXISTS idx_media_events_created_at ON media_events(created_at);

        -- 5. Record migration
        INSERT INTO migrations (name) VALUES ('add_event_metadata');

        COMMIT;
      `);
      console.log('add_event_metadata migration completed.');
    } catch (error) {
      try { await db.run('ROLLBACK'); } catch {}
      console.error('Error running add_event_metadata migration:', error);
      throw error;
    } finally {
      await db.run('PRAGMA foreign_keys = ON');
    }
  }
}
===
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
    
    // Mark legacy migrations as completed since they are built into schema.sql
    const legacyMigrations = [
      'allow_channel_deletion',
      'add_view_count',
      'add_is_deleted',
      'add_video_events',
      'add_podcast_support',
      'add_user_management'
    ];
    for (const name of legacyMigrations) {
      await db.run('INSERT OR IGNORE INTO migrations (name) VALUES (?)', name);
    }
    console.log('Initial schema migration completed and legacy migrations marked as done.');
  }

  // Check if allow_channel_deletion migration has been applied
  const migration2 = await db.get(
    'SELECT * FROM migrations WHERE name = ?',
    'allow_channel_deletion'
  );

  if (!migration2) {
    const videosTable = await db.get("SELECT name FROM sqlite_master WHERE type='table' AND name='videos'");
    if (!videosTable) {
      console.log('Videos table not found, marking allow_channel_deletion migration as completed.');
      await db.run(
        'INSERT INTO migrations (name) VALUES (?)',
        'allow_channel_deletion'
      );
    } else {
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
    } else {
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
            } else {
                try { await db.run('ROLLBACK'); } catch { }
                await db.run('PRAGMA foreign_keys = ON');
                console.error('Error running add_podcast_support migration:', error);
                throw error;
            }
        }
    }
  }
  // Check if add_user_management migration has been applied
  const migration7 = await db.get(
    'SELECT * FROM migrations WHERE name = ?',
    'add_user_management'
  );

  if (!migration7) {
    console.log('Running add_user_management migration...');
    await db.run('PRAGMA foreign_keys = OFF');
    try {
      await db.exec(`
        BEGIN TRANSACTION;

        -- 1. Recreate users table with new columns
        CREATE TABLE IF NOT EXISTS users_backup (
          id TEXT PRIMARY KEY,
          created_at INTEGER,
          updated_at INTEGER
        );
        INSERT INTO users_backup SELECT * FROM users;
        DROP TABLE users;
        
        CREATE TABLE users (
          id TEXT PRIMARY KEY,
          username TEXT NOT NULL UNIQUE,
          password TEXT NOT NULL,
          display_name TEXT,
          emoji TEXT,
          color TEXT,
          is_admin BOOLEAN NOT NULL DEFAULT 0,
          created_at INTEGER NOT NULL DEFAULT (unixepoch()),
          updated_at INTEGER NOT NULL DEFAULT (unixepoch())
        );

        -- 2. Create a temporary system user for existing data
        -- This will be replaced/updated by the onboarding flow
        INSERT INTO users (id, username, password, display_name, is_admin)
        VALUES ('default-admin', 'admin', 'changeme', 'System Admin', 1);

        -- 3. Update tags table
        CREATE TABLE tags_new (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          color TEXT,
          user_id TEXT NOT NULL,
          created_at INTEGER NOT NULL DEFAULT (unixepoch()),
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
          UNIQUE(name, user_id)
        );
        INSERT INTO tags_new (id, name, color, user_id, created_at)
        SELECT id, name, color, COALESCE(user_id, 'default-admin'), created_at FROM tags;
        DROP TABLE tags;
        ALTER TABLE tags_new RENAME TO tags;

        -- 4. Update episodes table
        CREATE TABLE episodes_new (
          id TEXT PRIMARY KEY,
          type TEXT NOT NULL DEFAULT 'video',
          external_id TEXT NOT NULL,
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
          user_id TEXT NOT NULL,
          created_at INTEGER NOT NULL DEFAULT (unixepoch()),
          updated_at INTEGER NOT NULL DEFAULT (unixepoch()),
          FOREIGN KEY (channel_id) REFERENCES channels(id) ON DELETE SET NULL,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
          UNIQUE(external_id, user_id)
        );
        INSERT INTO episodes_new (
          id, type, external_id, title, description, duration, thumbnail_url,
          url, upload_date, published_date, view_count, channel_id,
          watched, favorite, is_deleted, priority, custom_order, user_id,
          created_at, updated_at
        )
        SELECT 
          id, type, external_id, title, description, duration, thumbnail_url,
          url, upload_date, published_date, view_count, channel_id,
          watched, favorite, is_deleted, priority, custom_order, COALESCE(user_id, 'default-admin'),
          created_at, updated_at
        FROM episodes;
        DROP TABLE episodes;
        ALTER TABLE episodes_new RENAME TO episodes;

        -- 5. Re-create indexes
        CREATE INDEX IF NOT EXISTS idx_episodes_type ON episodes(type);
        CREATE INDEX IF NOT EXISTS idx_episodes_channel_id ON episodes(channel_id);
        CREATE INDEX IF NOT EXISTS idx_episodes_watched ON episodes(watched);
        CREATE INDEX IF NOT EXISTS idx_episodes_is_deleted ON episodes(is_deleted);
        CREATE INDEX IF NOT EXISTS idx_episodes_favorite ON episodes(favorite);
        CREATE INDEX IF NOT EXISTS idx_episodes_priority ON episodes(priority);
        CREATE INDEX IF NOT EXISTS idx_episodes_created_at ON episodes(created_at);
        CREATE INDEX IF NOT EXISTS idx_tags_user_id ON tags(user_id);

        -- 6. Clean up
        DROP TABLE IF EXISTS users_backup;

        -- 7. Record migration
        INSERT INTO migrations (name) VALUES ('add_user_management');

        COMMIT;
      `);
      console.log('add_user_management migration completed.');
    } catch (error) {
      try { await db.run('ROLLBACK'); } catch {}
      console.error('Error running add_user_management migration:', error);
      throw error;
    } finally {
      await db.run('PRAGMA foreign_keys = ON');
    }
  }

  // Check if add_watch_status migration has been applied
  const migration8 = await db.get(
    'SELECT * FROM migrations WHERE name = ?',
    'add_watch_status'
  );

  if (!migration8) {
    console.log('Running add_watch_status migration...');
    try {
      await db.run("ALTER TABLE episodes ADD COLUMN watch_status TEXT NOT NULL DEFAULT 'unwatched'");
      await db.run('CREATE INDEX IF NOT EXISTS idx_episodes_watch_status ON episodes(watch_status)');

      // Migrate existing 'watched' data
      await db.run("UPDATE episodes SET watch_status = 'watched' WHERE watched = 1");
      await db.run("UPDATE episodes SET watch_status = 'unwatched' WHERE watched = 0");

      await db.run(
        'INSERT INTO migrations (name) VALUES (?)',
        'add_watch_status'
      );
      console.log('add_watch_status migration completed.');
    } catch (error) {
      if (error instanceof Error && error.message.includes('duplicate column name')) {
        await db.run(
          'INSERT INTO migrations (name) VALUES (?)',
          'add_watch_status'
        );
        console.log('watch_status column already existed, migration marked as completed.');
      }
    }
  }

  // Check if add_channel_order migration has been applied
  const migration9 = await db.get(
    'SELECT * FROM migrations WHERE name = ?',
    'add_channel_order'
  );

  if (!migration9) {
    console.log('Running add_channel_order migration...');
    try {
      await db.run('ALTER TABLE channels ADD COLUMN custom_order INTEGER');
      await db.run(
        'INSERT INTO migrations (name) VALUES (?)',
        'add_channel_order'
      );
      console.log('add_channel_order migration completed.');
    } catch (error) {
      if (error instanceof Error && error.message.includes('duplicate column name')) {
        await db.run(
          'INSERT INTO migrations (name) VALUES (?)',
          'add_channel_order'
        );
        console.log('custom_order column already existed, migration marked as completed.');
      } else {
        throw error;
      }
    }
  }

  // Check if add_api_token migration has been applied
  const migration10 = await db.get(
    'SELECT * FROM migrations WHERE name = ?',
    'add_api_token'
  );

  if (!migration10) {
    console.log('Running add_api_token migration...');
    try {
      await db.run('ALTER TABLE users ADD COLUMN api_token TEXT');
      await db.run('CREATE UNIQUE INDEX IF NOT EXISTS idx_users_api_token ON users(api_token)');
      await db.run(
        'INSERT INTO migrations (name) VALUES (?)',
        'add_api_token'
      );
      console.log('add_api_token migration completed.');
    } catch (error) {
      if (error instanceof Error && error.message.includes('duplicate column name')) {
        await db.run(
          'INSERT INTO migrations (name) VALUES (?)',
          'add_api_token'
        );
        console.log('api_token column already existed, migration marked as completed.');
      } else {
        throw error;
      }
    }
  }

  // Check if add_event_metadata migration has been applied
  const migration11 = await db.get(
    'SELECT * FROM migrations WHERE name = ?',
    'add_event_metadata'
  );

  if (!migration11) {
    console.log('Running add_event_metadata migration...');
    await db.run('PRAGMA foreign_keys = OFF');
    try {
      await db.exec(`
        BEGIN TRANSACTION;

        -- 1. Create new table with updated schema
        CREATE TABLE media_events_new (
          id TEXT PRIMARY KEY,
          episode_id TEXT,
          title TEXT,
          type TEXT,
          event_type TEXT NOT NULL,
          created_at INTEGER NOT NULL DEFAULT (unixepoch()),
          FOREIGN KEY (episode_id) REFERENCES episodes(id) ON DELETE SET NULL
        );

        -- 2. Copy data from old table, joining with episodes to get title and type
        INSERT INTO media_events_new (id, episode_id, title, type, event_type, created_at)
        SELECT me.id, me.episode_id, e.title, e.type, me.type, me.created_at
        FROM media_events me
        LEFT JOIN episodes e ON me.episode_id = e.id;

        -- 3. Replace old table
        DROP TABLE media_events;
        ALTER TABLE media_events_new RENAME TO media_events;

        -- 4. Recreate indexes
        CREATE INDEX IF NOT EXISTS idx_media_events_episode_id ON media_events(episode_id);
        CREATE INDEX IF NOT EXISTS idx_media_events_event_type ON media_events(event_type);
        CREATE INDEX IF NOT EXISTS idx_media_events_created_at ON media_events(created_at);

        -- 5. Record migration
        INSERT INTO migrations (name) VALUES ('add_event_metadata');

        COMMIT;
      `);
      console.log('add_event_metadata migration completed.');
    } catch (error) {
      try { await db.run('ROLLBACK'); } catch {}
      console.error('Error running add_event_metadata migration:', error);
      throw error;
    } finally {
      await db.run('PRAGMA foreign_keys = ON');
    }
  }

  // Check if add_is_short migration has been applied
  const migration12 = await db.get(
    'SELECT * FROM migrations WHERE name = ?',
    'add_is_short'
  );

  if (!migration12) {
    console.log('Running add_is_short migration...');
    try {
      await db.run('ALTER TABLE episodes ADD COLUMN is_short BOOLEAN NOT NULL DEFAULT 0');
      await db.run('CREATE INDEX IF NOT EXISTS idx_episodes_is_short ON episodes(is_short)');

      // Update existing data: mark episodes with /shorts/ in their URL as is_short = 1
      await db.run("UPDATE episodes SET is_short = 1 WHERE url LIKE '%/shorts/%'");

      await db.run(
        'INSERT INTO migrations (name) VALUES (?)',
        'add_is_short'
      );
      console.log('add_is_short migration completed.');
    } catch (error) {
      if (error instanceof Error && error.message.includes('duplicate column name')) {
        await db.run(
          'INSERT INTO migrations (name) VALUES (?)',
          'add_is_short'
        );
        console.log('is_short column already existed, migration marked as completed.');
      } else {
        throw error;
      }
    }
  }
}
```
```diff:models.ts
// Domain models for 2watcharr

export type Priority = 'none' | 'low' | 'medium' | 'high';
export type MediaType = 'video' | 'podcast';
export type WatchStatus = 'unwatched' | 'pending' | 'watched';

export type MediaEventType = 'added' | 'watched' | 'unwatched' | 'favorited' | 'unfavorited' | 'removed' | 'restored' | 'tagged' | 'pending';

export interface MediaEvent {
    id: string;
    episodeId: string;
    type: MediaEventType;
    createdAt: number;
}

export interface User {
    id: string;
    username: string;
    password?: string;               // Optional in UI, required in DB
    displayName: string | null;
    emoji: string | null;
    color: string | null;
    isAdmin: boolean;
    apiToken: string | null;
    createdAt: number;
    updatedAt: number;
}

export type UserProfile = Omit<User, 'password'>;

export interface MediaEpisode {
    id: string;
    type: MediaType;
    externalId: string;              // YouTube ID or Podcast ID
    title: string;
    description: string | null;
    duration: number | null;
    thumbnailUrl: string | null;
    url: string;                     // Video URL or Podcast Episode URL
    uploadDate: string | null;
    publishedDate: string | null;
    viewCount: number | null;
    channelId: string;
    channelName?: string;
    watched: boolean;
    watchStatus: WatchStatus;
    favorite: boolean;
    isDeleted: boolean;
    priority: Priority;
    customOrder: number | null;
    userId: string;
    tags?: Tag[];
    createdAt: number;
    updatedAt: number;
    // Event timestamps
    lastAddedAt?: number;
    lastWatchedAt?: number;
    lastPendingAt?: number;
    lastFavoritedAt?: number;
    lastRemovedAt?: number;
}

export interface Channel {
    id: string;
    type: MediaType;
    name: string;
    description: string | null;
    thumbnailUrl: string | null;
    url: string;
    customOrder: number | null;
    createdAt: number;
    updatedAt: number;
}

export interface Tag {
    id: string;
    name: string;
    color: string | null;
    userId: string;
    createdAt: number;
}

export interface EpisodeTag {
    episodeId: string;
    tagId: string;
    createdAt: number;
}

// DTOs for creating/updating entities

export interface CreateEpisodeDto {
    type: MediaType;
    externalId: string;
    title: string;
    description?: string;
    duration?: number;
    thumbnailUrl?: string;
    url: string;
    uploadDate?: string;
    publishedDate?: string;
    viewCount?: number;
    channelId: string;
    userId: string;
}

export interface UpdateEpisodeDto {
    title?: string;
    description?: string;
    watched?: boolean;
    watchStatus?: WatchStatus;
    favorite?: boolean;
    isDeleted?: boolean;
    priority?: Priority;
    customOrder?: number;
    viewCount?: number;
    tagIds?: string[];
}

export interface CreateChannelDto {
    id: string;
    type: MediaType;
    name: string;
    description?: string;
    thumbnailUrl?: string;
    thumbnail_url?: string;
    url: string;
}

export interface CreateTagDto {
    name: string;
    color?: string;
    userId: string;
}

// Filter and sort options

export interface EpisodeFilters {
    type?: MediaType;
    tagIds?: string[];
    search?: string;
    watched?: boolean;
    watchStatus?: WatchStatus;
    favorite?: boolean;
    channelId?: string;
    channelIds?: string[];
    isDeleted?: boolean;
    userId?: string;
}

export type SortField = 'created_at' | 'priority' | 'favorite' | 'duration' | 'title' | 'custom' | 'date_added' | 'date_watched' | 'date_favorited' | 'date_removed';
export type SortOrder = 'asc' | 'desc';

export interface SortOptions {
    field: SortField;
    order: SortOrder;
}

export interface PaginationOptions {
    limit?: number;
    offset?: number;
}

export interface PaginatedResponse<T> {
    items: T[];
    total: number;
    limit: number;
    offset: number;
}

export interface ChannelFilters {
    id?: string;
    search?: string;
    tagIds?: string[];
    type?: MediaType;
    userId?: string;
}
===
// Domain models for 2watcharr

export type Priority = 'none' | 'low' | 'medium' | 'high';
export type MediaType = 'video' | 'podcast';
export type WatchStatus = 'unwatched' | 'pending' | 'watched';

export type MediaEventType = 'added' | 'watched' | 'unwatched' | 'favorited' | 'unfavorited' | 'removed' | 'restored' | 'tagged' | 'pending';

export interface MediaEvent {
    id: string;
    episodeId: string;
    type: MediaEventType;
    createdAt: number;
}

export interface User {
    id: string;
    username: string;
    password?: string;               // Optional in UI, required in DB
    displayName: string | null;
    emoji: string | null;
    color: string | null;
    isAdmin: boolean;
    apiToken: string | null;
    createdAt: number;
    updatedAt: number;
}

export type UserProfile = Omit<User, 'password'>;

export interface MediaEpisode {
    id: string;
    type: MediaType;
    externalId: string;              // YouTube ID or Podcast ID
    title: string;
    description: string | null;
    duration: number | null;
    thumbnailUrl: string | null;
    url: string;                     // Video URL or Podcast Episode URL
    uploadDate: string | null;
    publishedDate: string | null;
    viewCount: number | null;
    channelId: string;
    channelName?: string;
    watched: boolean;
    watchStatus: WatchStatus;
    favorite: boolean;
    isDeleted: boolean;
    priority: Priority;
    customOrder: number | null;
    isShort: boolean;
    userId: string;
    tags?: Tag[];
    createdAt: number;
    updatedAt: number;
    // Event timestamps
    lastAddedAt?: number;
    lastWatchedAt?: number;
    lastPendingAt?: number;
    lastFavoritedAt?: number;
    lastRemovedAt?: number;
}

export interface Channel {
    id: string;
    type: MediaType;
    name: string;
    description: string | null;
    thumbnailUrl: string | null;
    url: string;
    customOrder: number | null;
    createdAt: number;
    updatedAt: number;
}

export interface Tag {
    id: string;
    name: string;
    color: string | null;
    userId: string;
    createdAt: number;
}

export interface EpisodeTag {
    episodeId: string;
    tagId: string;
    createdAt: number;
}

// DTOs for creating/updating entities

export interface CreateEpisodeDto {
    type: MediaType;
    externalId: string;
    title: string;
    description?: string;
    duration?: number;
    thumbnailUrl?: string;
    url: string;
    uploadDate?: string;
    publishedDate?: string;
    viewCount?: number;
    channelId: string;
    isShort?: boolean;
    userId: string;
}

export interface UpdateEpisodeDto {
    title?: string;
    description?: string;
    watched?: boolean;
    watchStatus?: WatchStatus;
    favorite?: boolean;
    isDeleted?: boolean;
    priority?: Priority;
    customOrder?: number;
    viewCount?: number;
    tagIds?: string[];
    isShort?: boolean;
}

export interface CreateChannelDto {
    id: string;
    type: MediaType;
    name: string;
    description?: string;
    thumbnailUrl?: string;
    thumbnail_url?: string;
    url: string;
}

export interface CreateTagDto {
    name: string;
    color?: string;
    userId: string;
}

// Filter and sort options

export interface EpisodeFilters {
    type?: MediaType;
    tagIds?: string[];
    search?: string;
    watched?: boolean;
    watchStatus?: WatchStatus;
    favorite?: boolean;
    channelId?: string;
    channelIds?: string[];
    isDeleted?: boolean;
    isShort?: boolean;
    userId?: string;
}

export type SortField = 'created_at' | 'priority' | 'favorite' | 'duration' | 'title' | 'custom' | 'date_added' | 'date_watched' | 'date_favorited' | 'date_removed';
export type SortOrder = 'asc' | 'desc';

export interface SortOptions {
    field: SortField;
    order: SortOrder;
}

export interface PaginationOptions {
    limit?: number;
    offset?: number;
}

export interface PaginatedResponse<T> {
    items: T[];
    total: number;
    limit: number;
    offset: number;
}

export interface ChannelFilters {
    id?: string;
    search?: string;
    tagIds?: string[];
    type?: MediaType;
    userId?: string;
}
```
```diff:episode.repository.ts
import { Database } from 'sqlite';
import { v4 as uuidv4 } from 'uuid';
import {
    MediaEpisode,
    CreateEpisodeDto,
    UpdateEpisodeDto,
    EpisodeFilters,
    SortOptions,
    MediaEventType,
    MediaType,
    WatchStatus,
    Priority,
    Tag,
    PaginationOptions,
} from '../domain/models';

export class EpisodeRepository {
    constructor(private db: Database) { }

    /**
     * Create a new episode
     */
    async create(dto: CreateEpisodeDto): Promise<MediaEpisode> {
        const id = uuidv4();
        const now = Math.floor(Date.now() / 1000);

        await this.db.run(
            `INSERT INTO episodes (
        id, type, external_id, title, description, duration, thumbnail_url,
        url, upload_date, published_date, view_count, channel_id, user_id,
        watch_status, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                id,
                dto.type,
                dto.externalId,
                dto.title,
                dto.description || null,
                dto.duration || null,
                dto.thumbnailUrl || null,
                dto.url,
                dto.uploadDate || null,
                dto.publishedDate || null,
                dto.viewCount || null,
                dto.channelId,
                dto.userId,
                'unwatched',
                now,
                now,
            ]
        );

        const episode = await this.findById(id);
        if (!episode) {
            throw new Error('Failed to create episode');
        }
        return episode;
    }

    /**
     * Find episode by ID
     */
    async findById(id: string): Promise<MediaEpisode | null> {
        const row = await this.db.get(`
            SELECT e.*, c.name as channel_name,
            (SELECT created_at FROM media_events WHERE episode_id = e.id AND event_type = 'added' ORDER BY created_at DESC LIMIT 1) as last_added_at,
            (SELECT created_at FROM media_events WHERE episode_id = e.id AND event_type = 'watched' ORDER BY created_at DESC LIMIT 1) as last_watched_at,
            (SELECT created_at FROM media_events WHERE episode_id = e.id AND event_type = 'pending' ORDER BY created_at DESC LIMIT 1) as last_pending_at,
            (SELECT created_at FROM media_events WHERE episode_id = e.id AND event_type = 'favorited' ORDER BY created_at DESC LIMIT 1) as last_favorited_at,
            (SELECT created_at FROM media_events WHERE episode_id = e.id AND event_type = 'removed' ORDER BY created_at DESC LIMIT 1) as last_removed_at
            FROM episodes e 
            LEFT JOIN channels c ON e.channel_id = c.id 
            WHERE e.id = ?
        `, id);
        if (!row) return null;

        const episode = this.mapRowToEpisode(row);
        const tagRows = await this.db.all(`
            SELECT t.* FROM tags t
            JOIN episode_tags et ON t.id = et.tag_id
            WHERE et.episode_id = ?
        `, id);
        episode.tags = tagRows.map(row => ({
            id: row.id,
            name: row.name,
            color: row.color,
            userId: row.user_id,
            createdAt: row.created_at,
        }));

        return episode;
    }

    /**
     * Find episode by External ID
     */
    async findByExternalId(externalId: string, userId: string): Promise<MediaEpisode | null> {
        const row = await this.db.get(
            'SELECT * FROM episodes WHERE external_id = ? AND user_id = ?',
            [externalId, userId]
        );
        return row ? this.mapRowToEpisode(row) : null;
    }

    /**
     * Find all episodes with optional filters and sorting
     */
    async findAll(
        filters?: EpisodeFilters,
        sort?: SortOptions,
        pagination?: PaginationOptions
    ): Promise<MediaEpisode[]> {
        const hasTagFilter = filters?.tagIds && filters.tagIds.length > 0;
        let query = `
            SELECT ${hasTagFilter ? 'DISTINCT ' : ''}e.*, c.name as channel_name,
            (SELECT created_at FROM media_events WHERE episode_id = e.id AND event_type = 'added' ORDER BY created_at DESC LIMIT 1) as last_added_at,
            (SELECT created_at FROM media_events WHERE episode_id = e.id AND event_type = 'watched' ORDER BY created_at DESC LIMIT 1) as last_watched_at,
            (SELECT created_at FROM media_events WHERE episode_id = e.id AND event_type = 'pending' ORDER BY created_at DESC LIMIT 1) as last_pending_at,
            (SELECT created_at FROM media_events WHERE episode_id = e.id AND event_type = 'favorited' ORDER BY created_at DESC LIMIT 1) as last_favorited_at,
            (SELECT created_at FROM media_events WHERE episode_id = e.id AND event_type = 'removed' ORDER BY created_at DESC LIMIT 1) as last_removed_at
            FROM episodes e
        `;
        query += ' LEFT JOIN channels c ON e.channel_id = c.id';
        const params: (string | number | null)[] = [];

        // Join with episode_tags if filtering by tags
        if (filters?.tagIds && filters.tagIds.length > 0) {
            query += ' INNER JOIN episode_tags et ON e.id = et.episode_id';
        }

        // Build WHERE clause
        const conditions: string[] = [];

        if (filters?.type) {
            conditions.push('e.type = ?');
            params.push(filters.type);
        }

        if (filters?.tagIds && filters.tagIds.length > 0) {
            const placeholders = filters.tagIds.map(() => '?').join(',');
            conditions.push(`et.tag_id IN (${placeholders})`);
            params.push(...filters.tagIds);
        }

        if (filters?.search) {
            conditions.push(
                '(e.title LIKE ? OR e.description LIKE ? OR EXISTS (SELECT 1 FROM channels c WHERE c.id = e.channel_id AND c.name LIKE ?))'
            );
            const searchTerm = `%${filters.search}%`;
            params.push(searchTerm, searchTerm, searchTerm);
        }

        if (filters?.watched !== undefined) {
            conditions.push('e.watched = ?');
            params.push(filters.watched ? 1 : 0);
        }

        if (filters?.watchStatus !== undefined) {
            conditions.push('e.watch_status = ?');
            params.push(filters.watchStatus);
        }

        if (filters?.favorite !== undefined) {
            conditions.push('e.favorite = ?');
            params.push(filters.favorite ? 1 : 0);
        }

        if (filters?.isDeleted !== undefined) {
            conditions.push('e.is_deleted = ?');
            params.push(filters.isDeleted ? 1 : 0);
        } else {
            // Default: only show non-deleted episodes
            conditions.push('e.is_deleted = 0');
        }

        if (filters?.channelId) {
            conditions.push('e.channel_id = ?');
            params.push(filters.channelId);
        }

        if (filters?.channelIds && filters.channelIds.length > 0) {
            const placeholders = filters.channelIds.map(() => '?').join(',');
            conditions.push(`e.channel_id IN (${placeholders})`);
            params.push(...filters.channelIds);
        }

        if (filters?.userId) {
            conditions.push('e.user_id = ?');
            params.push(filters.userId);
        }

        if (conditions.length > 0) {
            query += ' WHERE ' + conditions.join(' AND ');
        }

        // Add sorting
        if (sort) {
            const orderBy = this.buildOrderBy(sort);
            query += ` ORDER BY ${orderBy}`;
        } else {
            // Default sort: Manual order first, then fallback to newest first
            query += ' ORDER BY e.custom_order ASC, e.created_at DESC';
        }

        // Add pagination
        if (pagination?.limit !== undefined) {
            query += ' LIMIT ?';
            params.push(pagination.limit);
        }
        if (pagination?.offset !== undefined) {
            query += ' OFFSET ?';
            params.push(pagination.offset);
        }

        const rows = await this.db.all(query, params);
        const episodes = rows.map((row) => this.mapRowToEpisode(row));

        if (episodes.length > 0) {
            const episodeIds = episodes.map(e => e.id);
            const placeholders = episodeIds.map(() => '?').join(',');
            const tagRows = await this.db.all(`
                SELECT et.episode_id, t.* FROM tags t
                JOIN episode_tags et ON t.id = et.tag_id
                WHERE et.episode_id IN (${placeholders})
            `, episodeIds);

            // Group tags by episode_id
            const tagsByEpisodeId: Record<string, Tag[]> = {};
            tagRows.forEach((row: Record<string, unknown>) => {
                if (!tagsByEpisodeId[row.episode_id as string]) {
                    tagsByEpisodeId[row.episode_id as string] = [];
                }
                tagsByEpisodeId[row.episode_id as string].push({
                    id: row.id as string,
                    name: row.name as string,
                    color: row.color as string | null,
                    userId: row.user_id as string,
                    createdAt: row.created_at as number,
                });
            });

            // Attach tags to episodes
            episodes.forEach(e => {
                e.tags = tagsByEpisodeId[e.id] || [];
            });
        }

        return episodes;
    }

    /**
     * Count all episodes matching filters
     */
    async countAll(filters?: EpisodeFilters): Promise<number> {
        const hasTagFilter = filters?.tagIds && filters.tagIds.length > 0;
        let query = `SELECT COUNT(${hasTagFilter ? 'DISTINCT ' : ''}e.id) as count FROM episodes e`;
        const params: (string | number | null)[] = [];

        if (hasTagFilter) {
            query += ' INNER JOIN episode_tags et ON e.id = et.episode_id';
        }

        const conditions: string[] = [];

        if (filters?.type) {
            conditions.push('e.type = ?');
            params.push(filters.type);
        }

        if (filters?.tagIds && filters.tagIds.length > 0) {
            const placeholders = filters.tagIds.map(() => '?').join(',');
            conditions.push(`et.tag_id IN (${placeholders})`);
            params.push(...filters.tagIds);
        }

        if (filters?.search) {
            conditions.push(
                '(e.title LIKE ? OR e.description LIKE ? OR EXISTS (SELECT 1 FROM channels c WHERE c.id = e.channel_id AND c.name LIKE ?))'
            );
            const searchTerm = `%${filters.search}%`;
            params.push(searchTerm, searchTerm, searchTerm);
        }

        if (filters?.watched !== undefined) {
            conditions.push('e.watched = ?');
            params.push(filters.watched ? 1 : 0);
        }

        if (filters?.watchStatus !== undefined) {
            conditions.push('e.watch_status = ?');
            params.push(filters.watchStatus);
        }

        if (filters?.favorite !== undefined) {
            conditions.push('e.favorite = ?');
            params.push(filters.favorite ? 1 : 0);
        }

        if (filters?.isDeleted !== undefined) {
            conditions.push('e.is_deleted = ?');
            params.push(filters.isDeleted ? 1 : 0);
        } else {
            conditions.push('e.is_deleted = 0');
        }

        if (filters?.channelId) {
            conditions.push('e.channel_id = ?');
            params.push(filters.channelId);
        }

        if (filters?.channelIds && filters.channelIds.length > 0) {
            const placeholders = filters.channelIds.map(() => '?').join(',');
            conditions.push(`e.channel_id IN (${placeholders})`);
            params.push(...filters.channelIds);
        }

        if (filters?.userId) {
            conditions.push('e.user_id = ?');
            params.push(filters.userId);
        }

        if (conditions.length > 0) {
            query += ' WHERE ' + conditions.join(' AND ');
        }

        const result = await this.db.get(query, params);
        return result?.count || 0;
    }

    /**
     * Update episode
     */
    async update(id: string, dto: UpdateEpisodeDto): Promise<MediaEpisode> {
        const updates: string[] = [];
        const params: (string | number | null)[] = [];

        if (dto.title !== undefined) {
            updates.push('title = ?');
            params.push(dto.title);
        }
        if (dto.description !== undefined) {
            updates.push('description = ?');
            params.push(dto.description);
        }
        if (dto.watched !== undefined) {
            updates.push('watched = ?');
            params.push(dto.watched ? 1 : 0);
            // Sync watch_status if not explicitly provided
            if (dto.watchStatus === undefined) {
                updates.push('watch_status = ?');
                params.push(dto.watched ? 'watched' : 'unwatched');
            }
        }
        if (dto.watchStatus !== undefined) {
            updates.push('watch_status = ?');
            params.push(dto.watchStatus);
            // Sync watched boolean
            updates.push('watched = ?');
            params.push(dto.watchStatus === 'watched' ? 1 : 0);
        }
        if (dto.favorite !== undefined) {
            updates.push('favorite = ?');
            params.push(dto.favorite ? 1 : 0);
        }
        if (dto.priority !== undefined) {
            updates.push('priority = ?');
            params.push(dto.priority);
        }
        if (dto.isDeleted !== undefined) {
            updates.push('is_deleted = ?');
            params.push(dto.isDeleted ? 1 : 0);
        }
        if (dto.customOrder !== undefined) {
            updates.push('custom_order = ?');
            params.push(dto.customOrder);
        }
        if (dto.viewCount !== undefined) {
            updates.push('view_count = ?');
            params.push(dto.viewCount);
        }

        updates.push('updated_at = ?');
        params.push(Math.floor(Date.now() / 1000));

        params.push(id);

        await this.db.run(
            `UPDATE episodes SET ${updates.join(', ')} WHERE id = ?`,
            params
        );

        // Update tags if provided
        if (dto.tagIds !== undefined) {
            await this.removeTags(id);
            if (dto.tagIds.length > 0) {
                await this.addTags(id, dto.tagIds);
            }
        }

        const episode = await this.findById(id);
        if (!episode) {
            throw new Error('Episode not found after update');
        }
        return episode;
    }

    /**
     * Bulk update watch status for all episodes in a channel
     */
    async bulkUpdateWatchStatus(channelId: string, userId: string, watched: boolean): Promise<void> {
        const now = Math.floor(Date.now() / 1000);
        const watchStatus = watched ? 'watched' : 'unwatched';
        const watchedInt = watched ? 1 : 0;

        // Get all applicable episodes first to create events
        const episodes = await this.findAll({ channelId, userId, isDeleted: false });

        await this.db.run('BEGIN TRANSACTION');

        try {
            await this.db.run(
                `UPDATE episodes 
                 SET watched = ?, watch_status = ?, updated_at = ? 
                 WHERE channel_id = ? AND user_id = ? AND is_deleted = 0`,
                [watchedInt, watchStatus, now, channelId, userId]
            );

            // Add events for each episode
            const eventType = watched ? 'watched' : 'unwatched';
            for (const episode of episodes) {
                if (episode.watched !== watched) {
                    await this.addEvent(episode.id, eventType, episode.title, episode.type);
                }
            }

            await this.db.run('COMMIT');
        } catch (error) {
            await this.db.run('ROLLBACK');
            throw error;
        }
    }

    /**
     * Delete episode (soft delete)
     */
    async delete(id: string): Promise<void> {
        await this.db.run('UPDATE episodes SET is_deleted = 1, updated_at = ? WHERE id = ?', [
            Math.floor(Date.now() / 1000),
            id
        ]);
    }

    /**
     * Restore all soft-deleted episodes for a user
     */
    async bulkRestore(userId: string): Promise<void> {
        await this.db.run(
            'UPDATE episodes SET is_deleted = 0, updated_at = ? WHERE user_id = ? AND is_deleted = 1',
            [Math.floor(Date.now() / 1000), userId]
        );
    }

    /**
     * Permanently delete episode (hard delete)
     * Removes the episode and all associated data from the database
     */
    async hardDelete(id: string): Promise<void> {
        await this.db.run('BEGIN TRANSACTION');

        try {
            // Delete associated tags
            await this.db.run('DELETE FROM episode_tags WHERE episode_id = ?', id);

            // Delete associated events
            await this.db.run('DELETE FROM media_events WHERE episode_id = ?', id);

            // Delete the episode itself
            await this.db.run('DELETE FROM episodes WHERE id = ?', id);

            await this.db.run('COMMIT');
        } catch (error) {
            await this.db.run('ROLLBACK');
            throw error;
        }
    }

    /**
     * Permanently delete all soft-deleted episodes for a user
     */
    async bulkHardDelete(userId: string): Promise<void> {
        await this.db.run('BEGIN TRANSACTION');

        try {
            // Find all soft-deleted episode IDs first for cleaning up relations
            const rows = await this.db.all('SELECT id FROM episodes WHERE user_id = ? AND is_deleted = 1', userId);
            const ids = rows.map(row => row.id);

            if (ids.length > 0) {
                const placeholders = ids.map(() => '?').join(',');
                
                // Delete associated tags
                await this.db.run(`DELETE FROM episode_tags WHERE episode_id IN (${placeholders})`, ids);

                // Delete associated events
                await this.db.run(`DELETE FROM media_events WHERE episode_id IN (${placeholders})`, ids);

                // Delete the episodes
                await this.db.run(`DELETE FROM episodes WHERE user_id = ? AND is_deleted = 1`, userId);
            }

            await this.db.run('COMMIT');
        } catch (error) {
            await this.db.run('ROLLBACK');
            throw error;
        }
    }


    /**
     * Add a media event
     */
    async addEvent(episodeId: string, eventType: MediaEventType, title?: string, type?: string): Promise<void> {
        const id = uuidv4();
        const now = Math.floor(Date.now() / 1000);

        await this.db.run(
            'INSERT INTO media_events (id, episode_id, event_type, title, type, created_at) VALUES (?, ?, ?, ?, ?, ?)',
            [id, episodeId, eventType, title || null, type || null, now]
        );
    }

    /**
     * Reorder episodes
     */
    async reorder(episodeIds: string[]): Promise<void> {
        const now = Math.floor(Date.now() / 1000);

        // Use a transaction for consistency
        await this.db.run('BEGIN TRANSACTION');

        try {
            for (let i = 0; i < episodeIds.length; i++) {
                await this.db.run(
                    'UPDATE episodes SET custom_order = ?, updated_at = ? WHERE id = ?',
                    [i, now, episodeIds[i]]
                );
            }
            await this.db.run('COMMIT');
        } catch (error) {
            await this.db.run('ROLLBACK');
            throw error;
        }
    }

    /**
     * Move episode to the beginning of the list
     */
    async moveToBeginning(id: string): Promise<void> {
        const episodes = await this.findAll({ watched: false }, { field: 'custom', order: 'asc' });
        const episodeIds = episodes.map(e => e.id).filter(vid => vid !== id);
        episodeIds.unshift(id);
        await this.reorder(episodeIds);
    }

    /**
     * Move episode to the end of the list
     */
    async moveToEnd(id: string): Promise<void> {
        const episodes = await this.findAll({ watched: false }, { field: 'custom', order: 'asc' });
        const episodeIds = episodes.map(e => e.id).filter(vid => vid !== id);
        episodeIds.push(id);
        await this.reorder(episodeIds);
    }

    /**
     * Associate tags with an episode
     */
    async addTags(episodeId: string, tagIds: string[]): Promise<void> {
        const now = Math.floor(Date.now() / 1000);

        for (const tagId of tagIds) {
            await this.db.run(
                'INSERT OR IGNORE INTO episode_tags (episode_id, tag_id, created_at) VALUES (?, ?, ?)',
                [episodeId, tagId, now]
            );
        }
    }

    /**
     * Remove all tags from an episode
     */
    async removeTags(episodeId: string): Promise<void> {
        await this.db.run('DELETE FROM episode_tags WHERE episode_id = ?', episodeId);
    }

    /**
     * Get tags for an episode
     */
    async getTags(episodeId: string): Promise<string[]> {
        const rows = await this.db.all(
            'SELECT tag_id FROM episode_tags WHERE episode_id = ?',
            episodeId
        );
        return rows.map((row: Record<string, unknown>) => row.tag_id as string);
    }

    private buildOrderBy(sort: SortOptions): string {
        const direction = sort.order === 'asc' ? 'ASC' : 'DESC';

        switch (sort.field) {
            case 'custom':
                return `e.custom_order ${direction}, e.created_at DESC`;
            case 'created_at':
                return `e.created_at ${direction}`;
            case 'priority':
                return `e.priority ${direction}, e.created_at DESC`;
            case 'favorite':
                return `e.favorite ${direction}, e.created_at DESC`;
            case 'duration':
                return `e.duration ${direction}`;
            case 'title':
                return `e.title ${direction}`;
            case 'date_added':
                return `last_added_at ${direction}`;
            case 'date_watched':
                return `last_watched_at ${direction}`;
            case 'date_favorited':
                return `last_favorited_at ${direction}`;
            case 'date_removed':
                return `last_removed_at ${direction}`;
            default:
                return 'e.custom_order ASC, e.created_at DESC';
        }
    }

    private mapRowToEpisode(row: Record<string, unknown>): MediaEpisode {
        return {
            id: row.id as string,
            type: row.type as MediaType,
            externalId: row.external_id as string,
            title: row.title as string,
            description: row.description as string | null,
            duration: row.duration as number | null,
            thumbnailUrl: row.thumbnail_url as string | null,
            url: row.url as string,
            uploadDate: row.upload_date as string | null,
            publishedDate: row.published_date as string | null,
            viewCount: row.view_count as number | null,
            channelId: row.channel_id as string,
            channelName: row.channel_name as string | undefined,
            watched: Boolean(row.watched),
            watchStatus: row.watch_status as WatchStatus,
            favorite: Boolean(row.favorite),
            isDeleted: Boolean(row.is_deleted),
            priority: row.priority as Priority,
            customOrder: row.custom_order as number | null,
            userId: row.user_id as string,
            createdAt: row.created_at as number,
            updatedAt: row.updated_at as number,
            lastAddedAt: (row.last_added_at as number) || undefined,
            lastWatchedAt: (row.last_watched_at as number) || undefined,
            lastPendingAt: (row.last_pending_at as number) || undefined,
            lastFavoritedAt: (row.last_favorited_at as number) || undefined,
            lastRemovedAt: (row.last_removed_at as number) || undefined,
        };
    }
}
===
import { Database } from 'sqlite';
import { v4 as uuidv4 } from 'uuid';
import {
    MediaEpisode,
    CreateEpisodeDto,
    UpdateEpisodeDto,
    EpisodeFilters,
    SortOptions,
    MediaEventType,
    MediaType,
    WatchStatus,
    Priority,
    Tag,
    PaginationOptions,
} from '../domain/models';

export class EpisodeRepository {
    constructor(private db: Database) { }

    /**
     * Create a new episode
     */
    async create(dto: CreateEpisodeDto): Promise<MediaEpisode> {
        const id = uuidv4();
        const now = Math.floor(Date.now() / 1000);

        await this.db.run(
            `INSERT INTO episodes (
        id, type, external_id, title, description, duration, thumbnail_url,
        url, upload_date, published_date, view_count, channel_id, user_id,
        watch_status, is_short, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                id,
                dto.type,
                dto.externalId,
                dto.title,
                dto.description || null,
                dto.duration || null,
                dto.thumbnailUrl || null,
                dto.url,
                dto.uploadDate || null,
                dto.publishedDate || null,
                dto.viewCount || null,
                dto.channelId,
                dto.userId,
                'unwatched',
                dto.isShort ? 1 : 0,
                now,
                now,
            ]
        );

        const episode = await this.findById(id);
        if (!episode) {
            throw new Error('Failed to create episode');
        }
        return episode;
    }

    /**
     * Find episode by ID
     */
    async findById(id: string): Promise<MediaEpisode | null> {
        const row = await this.db.get(`
            SELECT e.*, c.name as channel_name,
            (SELECT created_at FROM media_events WHERE episode_id = e.id AND event_type = 'added' ORDER BY created_at DESC LIMIT 1) as last_added_at,
            (SELECT created_at FROM media_events WHERE episode_id = e.id AND event_type = 'watched' ORDER BY created_at DESC LIMIT 1) as last_watched_at,
            (SELECT created_at FROM media_events WHERE episode_id = e.id AND event_type = 'pending' ORDER BY created_at DESC LIMIT 1) as last_pending_at,
            (SELECT created_at FROM media_events WHERE episode_id = e.id AND event_type = 'favorited' ORDER BY created_at DESC LIMIT 1) as last_favorited_at,
            (SELECT created_at FROM media_events WHERE episode_id = e.id AND event_type = 'removed' ORDER BY created_at DESC LIMIT 1) as last_removed_at
            FROM episodes e 
            LEFT JOIN channels c ON e.channel_id = c.id 
            WHERE e.id = ?
        `, id);
        if (!row) return null;

        const episode = this.mapRowToEpisode(row);
        const tagRows = await this.db.all(`
            SELECT t.* FROM tags t
            JOIN episode_tags et ON t.id = et.tag_id
            WHERE et.episode_id = ?
        `, id);
        episode.tags = tagRows.map(row => ({
            id: row.id,
            name: row.name,
            color: row.color,
            userId: row.user_id,
            createdAt: row.created_at,
        }));

        return episode;
    }

    /**
     * Find episode by External ID
     */
    async findByExternalId(externalId: string, userId: string): Promise<MediaEpisode | null> {
        const row = await this.db.get(
            'SELECT * FROM episodes WHERE external_id = ? AND user_id = ?',
            [externalId, userId]
        );
        return row ? this.mapRowToEpisode(row) : null;
    }

    /**
     * Find all episodes with optional filters and sorting
     */
    async findAll(
        filters?: EpisodeFilters,
        sort?: SortOptions,
        pagination?: PaginationOptions
    ): Promise<MediaEpisode[]> {
        const hasTagFilter = filters?.tagIds && filters.tagIds.length > 0;
        let query = `
            SELECT ${hasTagFilter ? 'DISTINCT ' : ''}e.*, c.name as channel_name,
            (SELECT created_at FROM media_events WHERE episode_id = e.id AND event_type = 'added' ORDER BY created_at DESC LIMIT 1) as last_added_at,
            (SELECT created_at FROM media_events WHERE episode_id = e.id AND event_type = 'watched' ORDER BY created_at DESC LIMIT 1) as last_watched_at,
            (SELECT created_at FROM media_events WHERE episode_id = e.id AND event_type = 'pending' ORDER BY created_at DESC LIMIT 1) as last_pending_at,
            (SELECT created_at FROM media_events WHERE episode_id = e.id AND event_type = 'favorited' ORDER BY created_at DESC LIMIT 1) as last_favorited_at,
            (SELECT created_at FROM media_events WHERE episode_id = e.id AND event_type = 'removed' ORDER BY created_at DESC LIMIT 1) as last_removed_at
            FROM episodes e
        `;
        query += ' LEFT JOIN channels c ON e.channel_id = c.id';
        const params: (string | number | null)[] = [];

        // Join with episode_tags if filtering by tags
        if (filters?.tagIds && filters.tagIds.length > 0) {
            query += ' INNER JOIN episode_tags et ON e.id = et.episode_id';
        }

        // Build WHERE clause
        const conditions: string[] = [];

        if (filters?.type) {
            conditions.push('e.type = ?');
            params.push(filters.type);
        }

        if (filters?.tagIds && filters.tagIds.length > 0) {
            const placeholders = filters.tagIds.map(() => '?').join(',');
            conditions.push(`et.tag_id IN (${placeholders})`);
            params.push(...filters.tagIds);
        }

        if (filters?.search) {
            conditions.push(
                '(e.title LIKE ? OR e.description LIKE ? OR EXISTS (SELECT 1 FROM channels c WHERE c.id = e.channel_id AND c.name LIKE ?))'
            );
            const searchTerm = `%${filters.search}%`;
            params.push(searchTerm, searchTerm, searchTerm);
        }

        if (filters?.watched !== undefined) {
            conditions.push('e.watched = ?');
            params.push(filters.watched ? 1 : 0);
        }

        if (filters?.watchStatus !== undefined) {
            conditions.push('e.watch_status = ?');
            params.push(filters.watchStatus);
        }

        if (filters?.favorite !== undefined) {
            conditions.push('e.favorite = ?');
            params.push(filters.favorite ? 1 : 0);
        }

        if (filters?.isDeleted !== undefined) {
            conditions.push('e.is_deleted = ?');
            params.push(filters.isDeleted ? 1 : 0);
        } else {
            // Default: only show non-deleted episodes
            conditions.push('e.is_deleted = 0');
        }

        if (filters?.channelId) {
            conditions.push('e.channel_id = ?');
            params.push(filters.channelId);
        }

        if (filters?.channelIds && filters.channelIds.length > 0) {
            const placeholders = filters.channelIds.map(() => '?').join(',');
            conditions.push(`e.channel_id IN (${placeholders})`);
            params.push(...filters.channelIds);
        }

        if (filters?.userId) {
            conditions.push('e.user_id = ?');
            params.push(filters.userId);
        }

        if (conditions.length > 0) {
            query += ' WHERE ' + conditions.join(' AND ');
        }

        // Add sorting
        if (sort) {
            const orderBy = this.buildOrderBy(sort);
            query += ` ORDER BY ${orderBy}`;
        } else {
            // Default sort: Manual order first, then fallback to newest first
            query += ' ORDER BY e.custom_order ASC, e.created_at DESC';
        }

        // Add pagination
        if (pagination?.limit !== undefined) {
            query += ' LIMIT ?';
            params.push(pagination.limit);
        }
        if (pagination?.offset !== undefined) {
            query += ' OFFSET ?';
            params.push(pagination.offset);
        }

        const rows = await this.db.all(query, params);
        const episodes = rows.map((row) => this.mapRowToEpisode(row));

        if (episodes.length > 0) {
            const episodeIds = episodes.map(e => e.id);
            const placeholders = episodeIds.map(() => '?').join(',');
            const tagRows = await this.db.all(`
                SELECT et.episode_id, t.* FROM tags t
                JOIN episode_tags et ON t.id = et.tag_id
                WHERE et.episode_id IN (${placeholders})
            `, episodeIds);

            // Group tags by episode_id
            const tagsByEpisodeId: Record<string, Tag[]> = {};
            tagRows.forEach((row: Record<string, unknown>) => {
                if (!tagsByEpisodeId[row.episode_id as string]) {
                    tagsByEpisodeId[row.episode_id as string] = [];
                }
                tagsByEpisodeId[row.episode_id as string].push({
                    id: row.id as string,
                    name: row.name as string,
                    color: row.color as string | null,
                    userId: row.user_id as string,
                    createdAt: row.created_at as number,
                });
            });

            // Attach tags to episodes
            episodes.forEach(e => {
                e.tags = tagsByEpisodeId[e.id] || [];
            });
        }

        return episodes;
    }

    /**
     * Count all episodes matching filters
     */
    async countAll(filters?: EpisodeFilters): Promise<number> {
        const hasTagFilter = filters?.tagIds && filters.tagIds.length > 0;
        let query = `SELECT COUNT(${hasTagFilter ? 'DISTINCT ' : ''}e.id) as count FROM episodes e`;
        const params: (string | number | null)[] = [];

        if (hasTagFilter) {
            query += ' INNER JOIN episode_tags et ON e.id = et.episode_id';
        }

        const conditions: string[] = [];

        if (filters?.type) {
            conditions.push('e.type = ?');
            params.push(filters.type);
        }

        if (filters?.tagIds && filters.tagIds.length > 0) {
            const placeholders = filters.tagIds.map(() => '?').join(',');
            conditions.push(`et.tag_id IN (${placeholders})`);
            params.push(...filters.tagIds);
        }

        if (filters?.search) {
            conditions.push(
                '(e.title LIKE ? OR e.description LIKE ? OR EXISTS (SELECT 1 FROM channels c WHERE c.id = e.channel_id AND c.name LIKE ?))'
            );
            const searchTerm = `%${filters.search}%`;
            params.push(searchTerm, searchTerm, searchTerm);
        }

        if (filters?.watched !== undefined) {
            conditions.push('e.watched = ?');
            params.push(filters.watched ? 1 : 0);
        }

        if (filters?.watchStatus !== undefined) {
            conditions.push('e.watch_status = ?');
            params.push(filters.watchStatus);
        }

        if (filters?.favorite !== undefined) {
            conditions.push('e.favorite = ?');
            params.push(filters.favorite ? 1 : 0);
        }

        if (filters?.isDeleted !== undefined) {
            conditions.push('e.is_deleted = ?');
            params.push(filters.isDeleted ? 1 : 0);
        } else {
            conditions.push('e.is_deleted = 0');
        }

        if (filters?.channelId) {
            conditions.push('e.channel_id = ?');
            params.push(filters.channelId);
        }

        if (filters?.channelIds && filters.channelIds.length > 0) {
            const placeholders = filters.channelIds.map(() => '?').join(',');
            conditions.push(`e.channel_id IN (${placeholders})`);
            params.push(...filters.channelIds);
        }

        if (filters?.userId) {
            conditions.push('e.user_id = ?');
            params.push(filters.userId);
        }

        if (conditions.length > 0) {
            query += ' WHERE ' + conditions.join(' AND ');
        }

        const result = await this.db.get(query, params);
        return result?.count || 0;
    }

    /**
     * Update episode
     */
    async update(id: string, dto: UpdateEpisodeDto): Promise<MediaEpisode> {
        const updates: string[] = [];
        const params: (string | number | null)[] = [];

        if (dto.title !== undefined) {
            updates.push('title = ?');
            params.push(dto.title);
        }
        if (dto.description !== undefined) {
            updates.push('description = ?');
            params.push(dto.description);
        }
        if (dto.watched !== undefined) {
            updates.push('watched = ?');
            params.push(dto.watched ? 1 : 0);
            // Sync watch_status if not explicitly provided
            if (dto.watchStatus === undefined) {
                updates.push('watch_status = ?');
                params.push(dto.watched ? 'watched' : 'unwatched');
            }
        }
        if (dto.watchStatus !== undefined) {
            updates.push('watch_status = ?');
            params.push(dto.watchStatus);
            // Sync watched boolean
            updates.push('watched = ?');
            params.push(dto.watchStatus === 'watched' ? 1 : 0);
        }
        if (dto.favorite !== undefined) {
            updates.push('favorite = ?');
            params.push(dto.favorite ? 1 : 0);
        }
        if (dto.priority !== undefined) {
            updates.push('priority = ?');
            params.push(dto.priority);
        }
        if (dto.isDeleted !== undefined) {
            updates.push('is_deleted = ?');
            params.push(dto.isDeleted ? 1 : 0);
        }
        if (dto.customOrder !== undefined) {
            updates.push('custom_order = ?');
            params.push(dto.customOrder);
        }
        if (dto.viewCount !== undefined) {
            updates.push('view_count = ?');
            params.push(dto.viewCount);
        }
        if (dto.isShort !== undefined) {
            updates.push('is_short = ?');
            params.push(dto.isShort ? 1 : 0);
        }

        updates.push('updated_at = ?');
        params.push(Math.floor(Date.now() / 1000));

        params.push(id);

        await this.db.run(
            `UPDATE episodes SET ${updates.join(', ')} WHERE id = ?`,
            params
        );

        // Update tags if provided
        if (dto.tagIds !== undefined) {
            await this.removeTags(id);
            if (dto.tagIds.length > 0) {
                await this.addTags(id, dto.tagIds);
            }
        }

        const episode = await this.findById(id);
        if (!episode) {
            throw new Error('Episode not found after update');
        }
        return episode;
    }

    /**
     * Bulk update watch status for all episodes in a channel
     */
    async bulkUpdateWatchStatus(channelId: string, userId: string, watched: boolean): Promise<void> {
        const now = Math.floor(Date.now() / 1000);
        const watchStatus = watched ? 'watched' : 'unwatched';
        const watchedInt = watched ? 1 : 0;

        // Get all applicable episodes first to create events
        const episodes = await this.findAll({ channelId, userId, isDeleted: false });

        await this.db.run('BEGIN TRANSACTION');

        try {
            await this.db.run(
                `UPDATE episodes 
                 SET watched = ?, watch_status = ?, updated_at = ? 
                 WHERE channel_id = ? AND user_id = ? AND is_deleted = 0`,
                [watchedInt, watchStatus, now, channelId, userId]
            );

            // Add events for each episode
            const eventType = watched ? 'watched' : 'unwatched';
            for (const episode of episodes) {
                if (episode.watched !== watched) {
                    await this.addEvent(episode.id, eventType, episode.title, episode.type);
                }
            }

            await this.db.run('COMMIT');
        } catch (error) {
            await this.db.run('ROLLBACK');
            throw error;
        }
    }

    /**
     * Delete episode (soft delete)
     */
    async delete(id: string): Promise<void> {
        await this.db.run('UPDATE episodes SET is_deleted = 1, updated_at = ? WHERE id = ?', [
            Math.floor(Date.now() / 1000),
            id
        ]);
    }

    /**
     * Restore all soft-deleted episodes for a user
     */
    async bulkRestore(userId: string): Promise<void> {
        await this.db.run(
            'UPDATE episodes SET is_deleted = 0, updated_at = ? WHERE user_id = ? AND is_deleted = 1',
            [Math.floor(Date.now() / 1000), userId]
        );
    }

    /**
     * Permanently delete episode (hard delete)
     * Removes the episode and all associated data from the database
     */
    async hardDelete(id: string): Promise<void> {
        await this.db.run('BEGIN TRANSACTION');

        try {
            // Delete associated tags
            await this.db.run('DELETE FROM episode_tags WHERE episode_id = ?', id);

            // Delete associated events
            await this.db.run('DELETE FROM media_events WHERE episode_id = ?', id);

            // Delete the episode itself
            await this.db.run('DELETE FROM episodes WHERE id = ?', id);

            await this.db.run('COMMIT');
        } catch (error) {
            await this.db.run('ROLLBACK');
            throw error;
        }
    }

    /**
     * Permanently delete all soft-deleted episodes for a user
     */
    async bulkHardDelete(userId: string): Promise<void> {
        await this.db.run('BEGIN TRANSACTION');

        try {
            // Find all soft-deleted episode IDs first for cleaning up relations
            const rows = await this.db.all('SELECT id FROM episodes WHERE user_id = ? AND is_deleted = 1', userId);
            const ids = rows.map(row => row.id);

            if (ids.length > 0) {
                const placeholders = ids.map(() => '?').join(',');
                
                // Delete associated tags
                await this.db.run(`DELETE FROM episode_tags WHERE episode_id IN (${placeholders})`, ids);

                // Delete associated events
                await this.db.run(`DELETE FROM media_events WHERE episode_id IN (${placeholders})`, ids);

                // Delete the episodes
                await this.db.run(`DELETE FROM episodes WHERE user_id = ? AND is_deleted = 1`, userId);
            }

            await this.db.run('COMMIT');
        } catch (error) {
            await this.db.run('ROLLBACK');
            throw error;
        }
    }


    /**
     * Add a media event
     */
    async addEvent(episodeId: string, eventType: MediaEventType, title?: string, type?: string): Promise<void> {
        const id = uuidv4();
        const now = Math.floor(Date.now() / 1000);

        await this.db.run(
            'INSERT INTO media_events (id, episode_id, event_type, title, type, created_at) VALUES (?, ?, ?, ?, ?, ?)',
            [id, episodeId, eventType, title || null, type || null, now]
        );
    }

    /**
     * Reorder episodes
     */
    async reorder(episodeIds: string[]): Promise<void> {
        const now = Math.floor(Date.now() / 1000);

        // Use a transaction for consistency
        await this.db.run('BEGIN TRANSACTION');

        try {
            for (let i = 0; i < episodeIds.length; i++) {
                await this.db.run(
                    'UPDATE episodes SET custom_order = ?, updated_at = ? WHERE id = ?',
                    [i, now, episodeIds[i]]
                );
            }
            await this.db.run('COMMIT');
        } catch (error) {
            await this.db.run('ROLLBACK');
            throw error;
        }
    }

    /**
     * Move episode to the beginning of the list
     */
    async moveToBeginning(id: string): Promise<void> {
        const episodes = await this.findAll({ watched: false }, { field: 'custom', order: 'asc' });
        const episodeIds = episodes.map(e => e.id).filter(vid => vid !== id);
        episodeIds.unshift(id);
        await this.reorder(episodeIds);
    }

    /**
     * Move episode to the end of the list
     */
    async moveToEnd(id: string): Promise<void> {
        const episodes = await this.findAll({ watched: false }, { field: 'custom', order: 'asc' });
        const episodeIds = episodes.map(e => e.id).filter(vid => vid !== id);
        episodeIds.push(id);
        await this.reorder(episodeIds);
    }

    /**
     * Associate tags with an episode
     */
    async addTags(episodeId: string, tagIds: string[]): Promise<void> {
        const now = Math.floor(Date.now() / 1000);

        for (const tagId of tagIds) {
            await this.db.run(
                'INSERT OR IGNORE INTO episode_tags (episode_id, tag_id, created_at) VALUES (?, ?, ?)',
                [episodeId, tagId, now]
            );
        }
    }

    /**
     * Remove all tags from an episode
     */
    async removeTags(episodeId: string): Promise<void> {
        await this.db.run('DELETE FROM episode_tags WHERE episode_id = ?', episodeId);
    }

    /**
     * Get tags for an episode
     */
    async getTags(episodeId: string): Promise<string[]> {
        const rows = await this.db.all(
            'SELECT tag_id FROM episode_tags WHERE episode_id = ?',
            episodeId
        );
        return rows.map((row: Record<string, unknown>) => row.tag_id as string);
    }

    private buildOrderBy(sort: SortOptions): string {
        const direction = sort.order === 'asc' ? 'ASC' : 'DESC';

        switch (sort.field) {
            case 'custom':
                return `e.custom_order ${direction}, e.created_at DESC`;
            case 'created_at':
                return `e.created_at ${direction}`;
            case 'priority':
                return `e.priority ${direction}, e.created_at DESC`;
            case 'favorite':
                return `e.favorite ${direction}, e.created_at DESC`;
            case 'duration':
                return `e.duration ${direction}`;
            case 'title':
                return `e.title ${direction}`;
            case 'date_added':
                return `last_added_at ${direction}`;
            case 'date_watched':
                return `last_watched_at ${direction}`;
            case 'date_favorited':
                return `last_favorited_at ${direction}`;
            case 'date_removed':
                return `last_removed_at ${direction}`;
            default:
                return 'e.custom_order ASC, e.created_at DESC';
        }
    }

    private mapRowToEpisode(row: Record<string, unknown>): MediaEpisode {
        return {
            id: row.id as string,
            type: row.type as MediaType,
            externalId: row.external_id as string,
            title: row.title as string,
            description: row.description as string | null,
            duration: row.duration as number | null,
            thumbnailUrl: row.thumbnail_url as string | null,
            url: row.url as string,
            uploadDate: row.upload_date as string | null,
            publishedDate: row.published_date as string | null,
            viewCount: row.view_count as number | null,
            channelId: row.channel_id as string,
            channelName: row.channel_name as string | undefined,
            watched: Boolean(row.watched),
            watchStatus: row.watch_status as WatchStatus,
            favorite: Boolean(row.favorite),
            isDeleted: Boolean(row.is_deleted),
            priority: row.priority as Priority,
            customOrder: row.custom_order as number | null,
            isShort: Boolean(row.is_short),
            userId: row.user_id as string,
            createdAt: row.created_at as number,
            updatedAt: row.updated_at as number,
            lastAddedAt: (row.last_added_at as number) || undefined,
            lastWatchedAt: (row.last_watched_at as number) || undefined,
            lastPendingAt: (row.last_pending_at as number) || undefined,
            lastFavoritedAt: (row.last_favorited_at as number) || undefined,
            lastRemovedAt: (row.last_removed_at as number) || undefined,
        };
    }
}
```
```diff:youtube-metadata.service.ts
import { exec } from 'child_process';
import { promisify } from 'util';
import { CreateEpisodeDto, CreateChannelDto } from '../domain/models';

const execAsync = promisify(exec);

export interface UnifiedMetadata {
    episode: Partial<CreateEpisodeDto>;
    channel: CreateChannelDto;
}

export class YouTubeMetadataService {
    /**
     * Extract metadata from a YouTube video URL using yt-dlp
     * @param url YouTube video URL
     * @returns Promise resolving to unified metadata
     */
    async extractMetadata(url: string): Promise<UnifiedMetadata> {
        // Use yt-dlp to extract JSON metadata without downloading
        const command = `yt-dlp --no-download --dump-json "${url}"`;

        try {
            const { stdout } = await execAsync(command, { maxBuffer: 10 * 1024 * 1024 });
            const rawData = JSON.parse(stdout);

            const channel: CreateChannelDto = {
                id: rawData.channel_id || rawData.uploader_id || '',
                type: 'video',
                name: rawData.channel || rawData.uploader || 'Unknown',
                url: rawData.channel_url || rawData.uploader_url || '',
                description: rawData.channel_description || '',
                thumbnailUrl: rawData.channel_thumbnail || '',
            };

            const episode: Partial<CreateEpisodeDto> = {
                type: 'video',
                externalId: rawData.id,
                title: rawData.title,
                description: rawData.description || '',
                duration: rawData.duration || 0,
                thumbnailUrl: rawData.thumbnail || '',
                url: url,
                uploadDate: this.formatDate(rawData.upload_date),
                publishedDate: this.formatDate(rawData.release_date || rawData.upload_date),
                viewCount: rawData.view_count || 0,
                channelId: channel.id,
            };

            return { episode, channel };
        } catch (error) {
            console.error('Failed to extract metadata:', error);
            throw new Error(`Failed to extract video metadata: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    /**
     * Extract metadata from a YouTube channel URL using yt-dlp
     * @param url YouTube channel URL
     * @returns Promise resolving to channel metadata
     */
    async extractChannelMetadata(url: string): Promise<Partial<CreateChannelDto>> {
        const command = `yt-dlp --no-download --dump-single-json --flat-playlist "${url}"`;

        try {
            const { stdout } = await execAsync(command, { maxBuffer: 10 * 1024 * 1024 });
            const rawData = JSON.parse(stdout);

            let thumbnailUrl = '';
            if (rawData.thumbnails && rawData.thumbnails.length > 0) {
                // Try to find a high quality thumbnail (avatar)
                interface Thumbnail { id?: string; width?: number; url: string; }
                const thumbnails = rawData.thumbnails as Thumbnail[];
                const avatar = thumbnails.find((t) => t.id === 'avatar_uncropped') ||
                    [...thumbnails].sort((a, b) => (b.width || 0) - (a.width || 0))[0];
                thumbnailUrl = avatar?.url || '';
            }

            return {
                id: rawData.id || '',
                type: 'video',
                name: rawData.title || rawData.channel || 'Unknown',
                url: rawData.channel_url || rawData.webpage_url || url,
                description: rawData.description || '',
                thumbnailUrl: thumbnailUrl,
            };
        } catch (error) {
            console.error('Failed to extract channel metadata:', error);
            return {};
        }
    }

    /**
     * Format date from yt-dlp format (YYYYMMDD) to ISO 8601
     */
    private formatDate(dateString: string | undefined): string {
        if (!dateString) return '';

        // yt-dlp returns dates in YYYYMMDD format
        if (dateString.length === 8) {
            const year = dateString.substring(0, 4);
            const month = dateString.substring(4, 6);
            const day = dateString.substring(6, 8);
            return `${year}-${month}-${day}`;
        }

        return dateString;
    }
}
===
import { exec } from 'child_process';
import { promisify } from 'util';
import { CreateEpisodeDto, CreateChannelDto } from '../domain/models';

const execAsync = promisify(exec);

export interface UnifiedMetadata {
    episode: Partial<CreateEpisodeDto>;
    channel: CreateChannelDto;
}

export class YouTubeMetadataService {
    /**
     * Extract metadata from a YouTube video URL using yt-dlp
     * @param url YouTube video URL
     * @returns Promise resolving to unified metadata
     */
    async extractMetadata(url: string): Promise<UnifiedMetadata> {
        // Use yt-dlp to extract JSON metadata without downloading
        const command = `yt-dlp --no-download --dump-json "${url}"`;

        try {
            const { stdout } = await execAsync(command, { maxBuffer: 10 * 1024 * 1024 });
            const rawData = JSON.parse(stdout);

            const channel: CreateChannelDto = {
                id: rawData.channel_id || rawData.uploader_id || '',
                type: 'video',
                name: rawData.channel || rawData.uploader || 'Unknown',
                url: rawData.channel_url || rawData.uploader_url || '',
                description: rawData.channel_description || '',
                thumbnailUrl: rawData.channel_thumbnail || '',
            };

            const isShort = url.includes('/shorts/') || (rawData.duration && rawData.duration <= 60 && !url.includes('/playlist'));

            const episode: Partial<CreateEpisodeDto> = {
                type: 'video',
                externalId: rawData.id,
                title: rawData.title,
                description: rawData.description || '',
                duration: rawData.duration || 0,
                thumbnailUrl: rawData.thumbnail || '',
                url: url,
                uploadDate: this.formatDate(rawData.upload_date),
                publishedDate: this.formatDate(rawData.release_date || rawData.upload_date),
                viewCount: rawData.view_count || 0,
                channelId: channel.id,
                isShort: isShort,
            };

            return { episode, channel };
        } catch (error) {
            console.error('Failed to extract metadata:', error);
            throw new Error(`Failed to extract video metadata: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    /**
     * Extract metadata from a YouTube channel URL using yt-dlp
     * @param url YouTube channel URL
     * @returns Promise resolving to channel metadata
     */
    async extractChannelMetadata(url: string): Promise<Partial<CreateChannelDto>> {
        const command = `yt-dlp --no-download --dump-single-json --flat-playlist "${url}"`;

        try {
            const { stdout } = await execAsync(command, { maxBuffer: 10 * 1024 * 1024 });
            const rawData = JSON.parse(stdout);

            let thumbnailUrl = '';
            if (rawData.thumbnails && rawData.thumbnails.length > 0) {
                // Try to find a high quality thumbnail (avatar)
                interface Thumbnail { id?: string; width?: number; url: string; }
                const thumbnails = rawData.thumbnails as Thumbnail[];
                const avatar = thumbnails.find((t) => t.id === 'avatar_uncropped') ||
                    [...thumbnails].sort((a, b) => (b.width || 0) - (a.width || 0))[0];
                thumbnailUrl = avatar?.url || '';
            }

            return {
                id: rawData.id || '',
                type: 'video',
                name: rawData.title || rawData.channel || 'Unknown',
                url: rawData.channel_url || rawData.webpage_url || url,
                description: rawData.description || '',
                thumbnailUrl: thumbnailUrl,
            };
        } catch (error) {
            console.error('Failed to extract channel metadata:', error);
            return {};
        }
    }

    /**
     * Format date from yt-dlp format (YYYYMMDD) to ISO 8601
     */
    private formatDate(dateString: string | undefined): string {
        if (!dateString) return '';

        // yt-dlp returns dates in YYYYMMDD format
        if (dateString.length === 8) {
            const year = dateString.substring(0, 4);
            const month = dateString.substring(4, 6);
            const day = dateString.substring(6, 8);
            return `${year}-${month}-${day}`;
        }

        return dateString;
    }
}
```
```diff:media.service.ts
import { Database } from 'sqlite';
import { EpisodeRepository, ChannelRepository, TagRepository } from '../repositories';
import { MetadataService } from './metadata.service';
import {
    MediaEpisode,
    UpdateEpisodeDto,
    EpisodeFilters,
    SortOptions,
    Priority,
    MediaEventType,
    PaginationOptions,
} from '../domain/models';

export class MediaService {
    private episodeRepo: EpisodeRepository;
    private channelRepo: ChannelRepository;
    private tagRepo: TagRepository;
    private metadataService: MetadataService;

    constructor(db: Database, metadataService?: MetadataService) {
        this.episodeRepo = new EpisodeRepository(db);
        this.channelRepo = new ChannelRepository(db);
        this.tagRepo = new TagRepository(db);
        this.metadataService = metadataService || new MetadataService();
    }

    /**
     * Add a media episode from a URL (YouTube or Podcast)
     * @param url Media URL
     * @param userId User ID adding the episode
     * @param tagIds Optional array of tag IDs to associate with the episode
     * @returns Promise resolving to the created episode
     */
    async addEpisodeFromUrl(url: string, userId: string, tagIds?: string[]): Promise<MediaEpisode> {
        // Extract metadata
        const metadata = await this.metadataService.extractMetadata(url);

        if (!metadata.episode.externalId) {
            throw new Error('Could not extract external ID from metadata');
        }

        // Check if episode already exists
        const existing = await this.episodeRepo.findByExternalId(metadata.episode.externalId, userId);
        if (existing) {
            // If it already exists, we "add it back" by clearing the isDeleted flag
            // and marking it as unwatched, while also updating metadata
            const updated = await this.episodeRepo.update(existing.id, {
                isDeleted: false,
                watched: false,
                title: metadata.episode.title,
                description: metadata.episode.description,
                viewCount: metadata.episode.viewCount,
            });

            // Record 'restored' event
            await this.episodeRepo.addEvent(existing.id, 'restored', updated.title, updated.type);

            // Re-associate tags if provided
            if (tagIds && tagIds.length > 0) {
                await this.episodeRepo.removeTags(existing.id);
                await this.episodeRepo.addTags(existing.id, tagIds);
            }

            // Move to beginning of the list
            await this.episodeRepo.moveToBeginning(existing.id);

            return updated;
        }

        // Create or update channel
        let channel = await this.channelRepo.findById(metadata.channel.id);

        // If channel exists but lacks description or thumnail, try to fetch it
        let channelMetadata = metadata.channel;
        if (channelMetadata.type === 'video' && (!channelMetadata.description || !channelMetadata.thumbnailUrl)) {
            const extraChannelMetadata = await this.metadataService.extractChannelMetadata(channelMetadata.url);
            channelMetadata = { ...channelMetadata, ...extraChannelMetadata };
        }

        if (!channel) {
            channel = await this.channelRepo.create(channelMetadata);
        } else {
            // Update channel info if it exists
            channel = await this.channelRepo.update(channelMetadata.id, {
                name: channelMetadata.name,
                description: channelMetadata.description,
                thumbnailUrl: channelMetadata.thumbnailUrl,
                url: channelMetadata.url,
            });
        }

        // Create episode
        const episode = await this.episodeRepo.create({
            type: metadata.episode.type || 'video',
            externalId: metadata.episode.externalId,
            title: metadata.episode.title || 'Unknown Title',
            description: metadata.episode.description,
            duration: metadata.episode.duration,
            thumbnailUrl: metadata.episode.thumbnailUrl,
            url: metadata.episode.url || url,
            uploadDate: metadata.episode.uploadDate,
            publishedDate: metadata.episode.publishedDate,
            viewCount: metadata.episode.viewCount,
            channelId: channel.id,
            userId: userId,
        });

        // Record 'added' event
        await this.episodeRepo.addEvent(episode.id, 'added', episode.title, episode.type);

        // Associate tags if provided
        if (tagIds && tagIds.length > 0) {
            await this.episodeRepo.addTags(episode.id, tagIds);
        }

        return episode;
    }

    /**
     * List episodes with optional filters, sorting and pagination
     */
    async listEpisodes(
        filters?: EpisodeFilters,
        sort?: SortOptions,
        pagination?: PaginationOptions
    ): Promise<{ episodes: MediaEpisode[], total: number }> {
        const episodes = await this.episodeRepo.findAll(filters, sort, pagination);
        const total = await this.episodeRepo.countAll(filters);
        return { episodes, total };
    }

    /**
     * Get an episode by ID
     */
    async getEpisode(id: string): Promise<MediaEpisode | null> {
        return this.episodeRepo.findById(id);
    }

    /**
     * Update an episode
     */
    async updateEpisode(id: string, updates: UpdateEpisodeDto): Promise<MediaEpisode> {
        const episode = await this.episodeRepo.update(id, updates);
        
        if (updates.watchStatus !== undefined) {
             await this.episodeRepo.addEvent(id, updates.watchStatus as MediaEventType, episode.title, episode.type);
        } else if (updates.watched !== undefined) {
             await this.episodeRepo.addEvent(id, updates.watched ? 'watched' : 'unwatched', episode.title, episode.type);
        }

        if (updates.favorite !== undefined) {
             await this.episodeRepo.addEvent(id, updates.favorite ? 'favorited' : 'unfavorited', episode.title, episode.type);
        }

        if (updates.isDeleted === true) {
             await this.episodeRepo.addEvent(id, 'removed', episode.title, episode.type);
        } else if (updates.isDeleted === false) {
             await this.episodeRepo.addEvent(id, 'restored', episode.title, episode.type);
        }

        return episode;
    }

    /**
     * Delete an episode
     */
    async deleteEpisode(id: string): Promise<void> {
        const episode = await this.episodeRepo.findById(id);
        await this.episodeRepo.delete(id);
        if (episode) {
            await this.episodeRepo.addEvent(id, 'removed', episode.title, episode.type);
        }
    }

    /**
     * Permanently delete an episode (hard delete)
     */
    async hardDeleteEpisode(id: string): Promise<void> {
        await this.episodeRepo.hardDelete(id);
    }

    /**
     * Soft delete all episodes with a specific tag
     */
    async softDeleteEpisodesByTag(tagId: string, userId: string): Promise<void> {
        const episodes = await this.episodeRepo.findAll({ tagIds: [tagId], userId, isDeleted: false });
        
        for (const episode of episodes) {
            // Remove the specific tag
            const currentTagIds = await this.episodeRepo.getTags(episode.id);
            const remainingTagIds = currentTagIds.filter(id => id !== tagId);
            await this.episodeRepo.removeTags(episode.id);
            if (remainingTagIds.length > 0) {
                await this.episodeRepo.addTags(episode.id, remainingTagIds);
            }

            // Soft delete the episode
            await this.episodeRepo.delete(episode.id);
            
            // Record event
            await this.episodeRepo.addEvent(episode.id, 'removed', episode.title, episode.type);
        }
    }

    /**
     * Restore all soft-deleted episodes for a user
     */
    async restoreAllEpisodes(userId: string): Promise<void> {
        const episodes = await this.episodeRepo.findAll({ userId, isDeleted: true });
        await this.episodeRepo.bulkRestore(userId);
        
        for (const episode of episodes) {
            await this.episodeRepo.addEvent(episode.id, 'restored', episode.title, episode.type);
        }
    }

    /**
     * Permanently delete all soft-deleted episodes for a user
     */
    async hardDeleteAllEpisodes(userId: string): Promise<void> {
        await this.episodeRepo.bulkHardDelete(userId);
    }


    /**
     * Toggle watched status
     */
    async toggleWatched(id: string): Promise<MediaEpisode> {
        const episode = await this.episodeRepo.findById(id);
        if (!episode) {
            throw new Error('Episode not found');
        }
        const newWatched = !episode.watched;
        const updated = await this.episodeRepo.update(id, { 
            watched: newWatched,
            watchStatus: newWatched ? 'watched' : 'unwatched'
        });
        
        // Record event
        await this.episodeRepo.addEvent(id, newWatched ? 'watched' : 'unwatched', updated.title, updated.type);
        
        return updated;
    }

    /**
     * Set watch status
     */
    async setWatchStatus(id: string, status: 'unwatched' | 'pending' | 'watched'): Promise<MediaEpisode> {
        const updated = await this.episodeRepo.update(id, { watchStatus: status });
        
        // Record event
        if (status === 'watched') {
            await this.episodeRepo.addEvent(id, 'watched', updated.title, updated.type);
        } else if (status === 'pending') {
            await this.episodeRepo.addEvent(id, 'pending', updated.title, updated.type);
        } else {
            await this.episodeRepo.addEvent(id, 'unwatched', updated.title, updated.type);
        }
        
        return updated;
    }

    /**
     * Toggle favorite status
     */
    async toggleFavorite(id: string): Promise<MediaEpisode> {
        const episode = await this.episodeRepo.findById(id);
        if (!episode) {
            throw new Error('Episode not found');
        }
        const newFavorite = !episode.favorite;
        const updated = await this.episodeRepo.update(id, { favorite: newFavorite });
        
        // Record event
        await this.episodeRepo.addEvent(id, newFavorite ? 'favorited' : 'unfavorited', updated.title, updated.type);
        
        return updated;
    }

    /**
     * Set episode priority
     */
    async setPriority(id: string, priority: Priority): Promise<MediaEpisode> {
        return this.episodeRepo.update(id, { priority });
    }

    /**
     * Reorder episodes
     */
    async reorderEpisodes(episodeIds: string[]): Promise<void> {
        return this.episodeRepo.reorder(episodeIds);
    }

    /**
     * Move episode to the beginning
     */
    async moveToBeginning(id: string): Promise<void> {
        return this.episodeRepo.moveToBeginning(id);
    }

    /**
     * Move episode to the end
     */
    async moveToEnd(id: string): Promise<void> {
        return this.episodeRepo.moveToEnd(id);
    }

    /**
     * Update episode tags
     */
    async updateTags(id: string, tagIds: string[]): Promise<void> {
        // Remove existing tags
        await this.episodeRepo.removeTags(id);

        // Add new tags
        if (tagIds.length > 0) {
            await this.episodeRepo.addTags(id, tagIds);
            
            const episode = await this.episodeRepo.findById(id);
            if (episode) {
                // Record 'tagged' event
                await this.episodeRepo.addEvent(id, 'tagged', episode.title, episode.type);
            }
        }
    }

    /**
     * Get tags for an episode
     */
    async getEpisodeTags(id: string): Promise<string[]> {
        return this.episodeRepo.getTags(id);
    }

    /**
     * Sync metadata for all channels
     */
    async syncAllChannelsMetadata(): Promise<{ total: number; synced: number }> {
        const channels = await this.channelRepo.findAll();
        let synced = 0;

        for (const channel of channels) {
            try {
                // Only sync video (YouTube) channels for now as podcast metadata might be harder to sync individually without an episode
                if (channel.type === 'video' && channel.url) {
                    const success = await this.syncChannelMetadata(channel.id, channel.url);
                    if (success) synced++;
                }
            } catch (error) {
                console.error(`Failed to sync channel ${channel.id}:`, error);
            }
        }

        return { total: channels.length, synced };
    }

    /**
     * Sync metadata for a single channel
     */
    async syncChannelMetadata(id: string, url: string): Promise<boolean> {
        const metadata = await this.metadataService.extractChannelMetadata(url);
        if (metadata.name) {
            await this.channelRepo.update(id, {
                name: metadata.name,
                description: metadata.description,
                thumbnailUrl: metadata.thumbnailUrl,
                url: metadata.url,
            });
            return true;
        }
        return false;
    }
}
===
import { Database } from 'sqlite';
import { EpisodeRepository, ChannelRepository, TagRepository } from '../repositories';
import { MetadataService } from './metadata.service';
import {
    MediaEpisode,
    UpdateEpisodeDto,
    EpisodeFilters,
    SortOptions,
    Priority,
    MediaEventType,
    PaginationOptions,
} from '../domain/models';

export class MediaService {
    private episodeRepo: EpisodeRepository;
    private channelRepo: ChannelRepository;
    private tagRepo: TagRepository;
    private metadataService: MetadataService;

    constructor(db: Database, metadataService?: MetadataService) {
        this.episodeRepo = new EpisodeRepository(db);
        this.channelRepo = new ChannelRepository(db);
        this.tagRepo = new TagRepository(db);
        this.metadataService = metadataService || new MetadataService();
    }

    /**
     * Add a media episode from a URL (YouTube or Podcast)
     * @param url Media URL
     * @param userId User ID adding the episode
     * @param tagIds Optional array of tag IDs to associate with the episode
     * @returns Promise resolving to the created episode
     */
    async addEpisodeFromUrl(url: string, userId: string, tagIds?: string[]): Promise<MediaEpisode> {
        // Extract metadata
        const metadata = await this.metadataService.extractMetadata(url);

        if (!metadata.episode.externalId) {
            throw new Error('Could not extract external ID from metadata');
        }

        // Check if episode already exists
        const existing = await this.episodeRepo.findByExternalId(metadata.episode.externalId, userId);
        if (existing) {
            // If it already exists, we "add it back" by clearing the isDeleted flag
            // and marking it as unwatched, while also updating metadata
            const updated = await this.episodeRepo.update(existing.id, {
                isDeleted: false,
                watched: false,
                title: metadata.episode.title,
                description: metadata.episode.description,
                viewCount: metadata.episode.viewCount,
            });

            // Record 'restored' event
            await this.episodeRepo.addEvent(existing.id, 'restored', updated.title, updated.type);

            // Re-associate tags if provided
            if (tagIds && tagIds.length > 0) {
                await this.episodeRepo.removeTags(existing.id);
                await this.episodeRepo.addTags(existing.id, tagIds);
            }

            // Move to beginning of the list
            await this.episodeRepo.moveToBeginning(existing.id);

            return updated;
        }

        // Create or update channel
        let channel = await this.channelRepo.findById(metadata.channel.id);

        // If channel exists but lacks description or thumnail, try to fetch it
        let channelMetadata = metadata.channel;
        if (channelMetadata.type === 'video' && (!channelMetadata.description || !channelMetadata.thumbnailUrl)) {
            const extraChannelMetadata = await this.metadataService.extractChannelMetadata(channelMetadata.url);
            channelMetadata = { ...channelMetadata, ...extraChannelMetadata };
        }

        if (!channel) {
            channel = await this.channelRepo.create(channelMetadata);
        } else {
            // Update channel info if it exists
            channel = await this.channelRepo.update(channelMetadata.id, {
                name: channelMetadata.name,
                description: channelMetadata.description,
                thumbnailUrl: channelMetadata.thumbnailUrl,
                url: channelMetadata.url,
            });
        }

        // Create episode
        const episode = await this.episodeRepo.create({
            type: metadata.episode.type || 'video',
            externalId: metadata.episode.externalId,
            title: metadata.episode.title || 'Unknown Title',
            description: metadata.episode.description,
            duration: metadata.episode.duration,
            thumbnailUrl: metadata.episode.thumbnailUrl,
            url: metadata.episode.url || url,
            uploadDate: metadata.episode.uploadDate,
            publishedDate: metadata.episode.publishedDate,
            viewCount: metadata.episode.viewCount,
            channelId: channel.id,
            isShort: metadata.episode.isShort,
            userId: userId,
        });

        // Record 'added' event
        await this.episodeRepo.addEvent(episode.id, 'added', episode.title, episode.type);

        // Associate tags if provided
        if (tagIds && tagIds.length > 0) {
            await this.episodeRepo.addTags(episode.id, tagIds);
        }

        return episode;
    }

    /**
     * List episodes with optional filters, sorting and pagination
     */
    async listEpisodes(
        filters?: EpisodeFilters,
        sort?: SortOptions,
        pagination?: PaginationOptions
    ): Promise<{ episodes: MediaEpisode[], total: number }> {
        const episodes = await this.episodeRepo.findAll(filters, sort, pagination);
        const total = await this.episodeRepo.countAll(filters);
        return { episodes, total };
    }

    /**
     * Get an episode by ID
     */
    async getEpisode(id: string): Promise<MediaEpisode | null> {
        return this.episodeRepo.findById(id);
    }

    /**
     * Update an episode
     */
    async updateEpisode(id: string, updates: UpdateEpisodeDto): Promise<MediaEpisode> {
        const episode = await this.episodeRepo.update(id, updates);
        
        if (updates.watchStatus !== undefined) {
             await this.episodeRepo.addEvent(id, updates.watchStatus as MediaEventType, episode.title, episode.type);
        } else if (updates.watched !== undefined) {
             await this.episodeRepo.addEvent(id, updates.watched ? 'watched' : 'unwatched', episode.title, episode.type);
        }

        if (updates.favorite !== undefined) {
             await this.episodeRepo.addEvent(id, updates.favorite ? 'favorited' : 'unfavorited', episode.title, episode.type);
        }

        if (updates.isDeleted === true) {
             await this.episodeRepo.addEvent(id, 'removed', episode.title, episode.type);
        } else if (updates.isDeleted === false) {
             await this.episodeRepo.addEvent(id, 'restored', episode.title, episode.type);
        }

        return episode;
    }

    /**
     * Delete an episode
     */
    async deleteEpisode(id: string): Promise<void> {
        const episode = await this.episodeRepo.findById(id);
        await this.episodeRepo.delete(id);
        if (episode) {
            await this.episodeRepo.addEvent(id, 'removed', episode.title, episode.type);
        }
    }

    /**
     * Permanently delete an episode (hard delete)
     */
    async hardDeleteEpisode(id: string): Promise<void> {
        await this.episodeRepo.hardDelete(id);
    }

    /**
     * Soft delete all episodes with a specific tag
     */
    async softDeleteEpisodesByTag(tagId: string, userId: string): Promise<void> {
        const episodes = await this.episodeRepo.findAll({ tagIds: [tagId], userId, isDeleted: false });
        
        for (const episode of episodes) {
            // Remove the specific tag
            const currentTagIds = await this.episodeRepo.getTags(episode.id);
            const remainingTagIds = currentTagIds.filter(id => id !== tagId);
            await this.episodeRepo.removeTags(episode.id);
            if (remainingTagIds.length > 0) {
                await this.episodeRepo.addTags(episode.id, remainingTagIds);
            }

            // Soft delete the episode
            await this.episodeRepo.delete(episode.id);
            
            // Record event
            await this.episodeRepo.addEvent(episode.id, 'removed', episode.title, episode.type);
        }
    }

    /**
     * Restore all soft-deleted episodes for a user
     */
    async restoreAllEpisodes(userId: string): Promise<void> {
        const episodes = await this.episodeRepo.findAll({ userId, isDeleted: true });
        await this.episodeRepo.bulkRestore(userId);
        
        for (const episode of episodes) {
            await this.episodeRepo.addEvent(episode.id, 'restored', episode.title, episode.type);
        }
    }

    /**
     * Permanently delete all soft-deleted episodes for a user
     */
    async hardDeleteAllEpisodes(userId: string): Promise<void> {
        await this.episodeRepo.bulkHardDelete(userId);
    }


    /**
     * Toggle watched status
     */
    async toggleWatched(id: string): Promise<MediaEpisode> {
        const episode = await this.episodeRepo.findById(id);
        if (!episode) {
            throw new Error('Episode not found');
        }
        const newWatched = !episode.watched;
        const updated = await this.episodeRepo.update(id, { 
            watched: newWatched,
            watchStatus: newWatched ? 'watched' : 'unwatched'
        });
        
        // Record event
        await this.episodeRepo.addEvent(id, newWatched ? 'watched' : 'unwatched', updated.title, updated.type);
        
        return updated;
    }

    /**
     * Set watch status
     */
    async setWatchStatus(id: string, status: 'unwatched' | 'pending' | 'watched'): Promise<MediaEpisode> {
        const updated = await this.episodeRepo.update(id, { watchStatus: status });
        
        // Record event
        if (status === 'watched') {
            await this.episodeRepo.addEvent(id, 'watched', updated.title, updated.type);
        } else if (status === 'pending') {
            await this.episodeRepo.addEvent(id, 'pending', updated.title, updated.type);
        } else {
            await this.episodeRepo.addEvent(id, 'unwatched', updated.title, updated.type);
        }
        
        return updated;
    }

    /**
     * Toggle favorite status
     */
    async toggleFavorite(id: string): Promise<MediaEpisode> {
        const episode = await this.episodeRepo.findById(id);
        if (!episode) {
            throw new Error('Episode not found');
        }
        const newFavorite = !episode.favorite;
        const updated = await this.episodeRepo.update(id, { favorite: newFavorite });
        
        // Record event
        await this.episodeRepo.addEvent(id, newFavorite ? 'favorited' : 'unfavorited', updated.title, updated.type);
        
        return updated;
    }

    /**
     * Set episode priority
     */
    async setPriority(id: string, priority: Priority): Promise<MediaEpisode> {
        return this.episodeRepo.update(id, { priority });
    }

    /**
     * Reorder episodes
     */
    async reorderEpisodes(episodeIds: string[]): Promise<void> {
        return this.episodeRepo.reorder(episodeIds);
    }

    /**
     * Move episode to the beginning
     */
    async moveToBeginning(id: string): Promise<void> {
        return this.episodeRepo.moveToBeginning(id);
    }

    /**
     * Move episode to the end
     */
    async moveToEnd(id: string): Promise<void> {
        return this.episodeRepo.moveToEnd(id);
    }

    /**
     * Update episode tags
     */
    async updateTags(id: string, tagIds: string[]): Promise<void> {
        // Remove existing tags
        await this.episodeRepo.removeTags(id);

        // Add new tags
        if (tagIds.length > 0) {
            await this.episodeRepo.addTags(id, tagIds);
            
            const episode = await this.episodeRepo.findById(id);
            if (episode) {
                // Record 'tagged' event
                await this.episodeRepo.addEvent(id, 'tagged', episode.title, episode.type);
            }
        }
    }

    /**
     * Get tags for an episode
     */
    async getEpisodeTags(id: string): Promise<string[]> {
        return this.episodeRepo.getTags(id);
    }

    /**
     * Sync metadata for all channels
     */
    async syncAllChannelsMetadata(): Promise<{ total: number; synced: number }> {
        const channels = await this.channelRepo.findAll();
        let synced = 0;

        for (const channel of channels) {
            try {
                // Only sync video (YouTube) channels for now as podcast metadata might be harder to sync individually without an episode
                if (channel.type === 'video' && channel.url) {
                    const success = await this.syncChannelMetadata(channel.id, channel.url);
                    if (success) synced++;
                }
            } catch (error) {
                console.error(`Failed to sync channel ${channel.id}:`, error);
            }
        }

        return { total: channels.length, synced };
    }

    /**
     * Sync metadata for a single channel
     */
    async syncChannelMetadata(id: string, url: string): Promise<boolean> {
        const metadata = await this.metadataService.extractChannelMetadata(url);
        if (metadata.name) {
            await this.channelRepo.update(id, {
                name: metadata.name,
                description: metadata.description,
                thumbnailUrl: metadata.thumbnailUrl,
                url: metadata.url,
            });
            return true;
        }
        return false;
    }
}
```
```diff:episode-card.tsx
import { useState } from 'react';
import Image from 'next/image';
import { MediaEpisode, Tag } from '@/lib/domain/models';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    Check,
    Star,
    MoreVertical,
    Trash2,
    GripVertical,
    ArrowUp,
    ArrowDown,
    Tag as TagIcon,
    Plus,
    Youtube,
    Mic,
} from 'lucide-react';
import {
    CommandDialog,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from '@/components/ui/command';
import { toast } from 'sonner';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { formatDistanceToNow } from 'date-fns';

interface EpisodeCardProps {
    episode: MediaEpisode;
    onUpdate?: () => void;
    onDelete?: () => void;
    isDraggable?: boolean;
}

export function EpisodeCard({ episode, onUpdate, onDelete, isDraggable = true }: EpisodeCardProps) {
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [isHardDeleteDialogOpen, setIsHardDeleteDialogOpen] = useState(false);
    const [isTagPopoverOpen, setIsTagPopoverOpen] = useState(false);
    const [availableTags, setAvailableTags] = useState<Tag[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [isUpdatingTags, setIsUpdatingTags] = useState(false);

    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
    } = useSortable({ 
        id: episode.id,
        disabled: !isDraggable
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    const handleToggleWatched = async () => {
        try {
            const response = await fetch(`/api/episodes/${episode.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ watched: !episode.watched }),
            });

            if (!response.ok) throw new Error('Failed to update episode');

            toast.success(episode.watched ? 'Marked as unwatched' : 'Marked as watched');
            onUpdate?.();
        } catch {
            toast.error('Failed to update episode');
        }
    };

    const handleToggleFavorite = async () => {
        try {
            const response = await fetch(`/api/episodes/${episode.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ favorite: !episode.favorite }),
            });

            if (!response.ok) throw new Error('Failed to update episode');

            toast.success(episode.favorite ? 'Removed from favorites' : 'Added to favorites');
            onUpdate?.();
        } catch {
            toast.error('Failed to update episode');
        }
    };

    const handleDelete = async () => {
        try {
            const response = await fetch(`/api/episodes/${episode.id}`, {
                method: 'DELETE',
            });

            if (!response.ok) throw new Error('Failed to delete episode');

            toast.success(`${episode.type === 'podcast' ? 'Podcast' : 'Video'} removed from list`);
            setIsDeleteDialogOpen(false);
            onDelete?.();
        } catch {
            toast.error('Failed to delete episode');
        }
    };

    const handleHardDelete = async () => {
        try {
            const response = await fetch(`/api/episodes/${episode.id}?permanent=true`, {
                method: 'DELETE',
            });

            if (!response.ok) throw new Error('Failed to permanently delete episode');

            toast.success(`${episode.type === 'podcast' ? 'Podcast' : 'Video'} permanently deleted`);
            setIsHardDeleteDialogOpen(false);
            onDelete?.();
        } catch {
            toast.error('Failed to permanently delete episode');
        }
    };

    const handleRestore = async () => {
        try {
            const response = await fetch(`/api/episodes/${episode.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ isDeleted: false }),
            });

            if (!response.ok) throw new Error('Failed to restore episode');

            toast.success(`${episode.type === 'podcast' ? 'Podcast' : 'Video'} restored to watch list`);
            window.dispatchEvent(new Event('episode-restored'));
            onUpdate?.();
        } catch {
            toast.error('Failed to restore episode');
        }
    };

    const handleReorder = async (position: 'beginning' | 'end') => {
        try {
            const response = await fetch(`/api/episodes/${episode.id}/reorder`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ position }),
            });

            if (!response.ok) throw new Error('Failed to reorder');

            toast.success(`Moved to ${position}`);
            onUpdate?.();
        } catch {
            toast.error('Failed to reorder episode');
        }
    };

    const handlePlay = async () => {
        window.open(episode.url, '_blank');
        
        const watchAction = localStorage.getItem('watchAction') || 'pending';
        if (watchAction === 'watched' && episode.watchStatus === 'unwatched') {
            handleToggleWatched();
        } else if (watchAction === 'pending' && episode.watchStatus === 'unwatched') {
            try {
                const response = await fetch(`/api/episodes/${episode.id}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ watchStatus: 'pending' }),
                });
                if (response.ok) {
                    toast.success('Marked as pending confirmation');
                    onUpdate?.();
                }
            } catch (error) {
                console.error('Failed to set pending status:', error);
            }
        }
    };

    const fetchTags = async () => {
        try {
            const response = await fetch('/api/tags');
            const data = await response.json();
            if (data.tags) {
                setAvailableTags(data.tags);
            }
        } catch (error) {
            console.error('Error fetching tags:', error);
        }
    };

    const handleToggleTag = async (tagId: string) => {
        setIsUpdatingTags(true);
        try {
            const currentTagIds = episode.tags?.map(t => t.id) || [];
            const isTagSelected = currentTagIds.includes(tagId);
            const newTagIds = isTagSelected
                ? currentTagIds.filter(id => id !== tagId)
                : [...currentTagIds, tagId];

            const response = await fetch(`/api/episodes/${episode.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ tagIds: newTagIds }),
            });

            if (!response.ok) throw new Error('Failed to update tags');

            toast.success('Tags updated');
            onUpdate?.();
        } catch {
            toast.error('Failed to update tags');
        } finally {
            setIsUpdatingTags(false);
        }
    };

    const getRandomColor = () => {
        const colors = [
            '#ef4444', '#f97316', '#f59e0b', '#10b981', '#06b6d4',
            '#3b82f6', '#6366f1', '#8b5cf6', '#d946ef', '#ec4899'
        ];
        return colors[Math.floor(Math.random() * colors.length)];
    };

    const handleCreateTag = async (name: string) => {
        setIsUpdatingTags(true);
        try {
            // 1. Create the tag
            const createResponse = await fetch('/api/tags', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, color: getRandomColor() }),
            });

            if (!createResponse.ok) {
                const error = await createResponse.json();
                throw new Error(error.error || 'Failed to create tag');
            }

            const newTag = await createResponse.json();

            // 2. Add tag to episode
            await handleToggleTag(newTag.id);

            setSearchQuery('');
            fetchTags(); // Refresh local list
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Failed to create tag');
        } finally {
            setIsUpdatingTags(false);
        }
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'high':
                return 'bg-red-500';
            case 'medium':
                return 'bg-yellow-500';
            case 'low':
                return 'bg-blue-500';
            default:
                return 'bg-gray-500';
        }
    };

    const formatDuration = (seconds: number | null) => {
        if (!seconds) return '';
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;

        if (hours > 0) {
            return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        }
        return `${minutes}:${secs.toString().padStart(2, '0')}`;
    };

    const formatViews = (views: number | null) => {
        if (views === null || views === undefined) return '';
        if (views >= 1000000) return `${(views / 1000000).toFixed(1)}M views`;
        if (views >= 1000) return `${(views / 1000).toFixed(1)}K views`;
        return `${views} views`;
    };

    const formatPublishedDate = (dateStr: string | null) => {
        if (!dateStr) return '';
        try {
            return formatDistanceToNow(new Date(dateStr), { addSuffix: true });
        } catch {
            return dateStr;
        }
    };

    const formatEventDate = () => {
        if (episode.lastRemovedAt && episode.isDeleted) {
            return `Removed ${formatDistanceToNow(new Date(episode.lastRemovedAt * 1000), { addSuffix: true })}`;
        }
        
        // Find the latest significant event
        const events = [
            { type: 'Watched', date: episode.lastWatchedAt },
            { type: 'Status updated', date: episode.lastPendingAt },
            { type: 'Restored', date: episode.lastAddedAt && episode.lastAddedAt > (episode.createdAt + 10) ? episode.lastAddedAt : null },
            { type: 'Added', date: episode.lastAddedAt || episode.createdAt }
        ].filter(e => e.date).sort((a, b) => (b.date || 0) - (a.date || 0));

        if (events.length > 0 && events[0].date) {
            return `${events[0].type} ${formatDistanceToNow(new Date(events[0].date * 1000), { addSuffix: true })}`;
        }
        
        return '';
    };

    return (
        <div ref={setNodeRef} style={style} className="h-full">
            <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <Card className={`group relative h-full flex flex-col overflow-hidden p-0 gap-0 ${episode.watched ? 'opacity-60' : ''}`}>
                    {/* Thumbnail */}
                    <div className="relative aspect-video overflow-hidden bg-muted cursor-pointer" onClick={handlePlay}>
                        {episode.thumbnailUrl && (
                            <Image
                                src={episode.thumbnailUrl}
                                alt={episode.title}
                                fill
                                className="object-cover transition-transform duration-500 group-hover:scale-105"
                                unoptimized
                            />
                        )}

                        {/* Media Type Icon */}
                        <div className="absolute top-2 right-2">
                            {episode.type === 'podcast' ? (
                                <Badge className="bg-purple-600 text-white border-none px-1.5 py-0.5">
                                    <Mic className="h-3 w-3 mr-1" />
                                    Podcast
                                </Badge>
                            ) : (
                                <Badge className="bg-red-600 text-white border-none px-1.5 py-0.5">
                                    <Youtube className="h-3 w-3 mr-1" />
                                    Video
                                </Badge>
                            )}
                        </div>

                        {/* Duration Badge */}
                        {episode.duration && (
                            <Badge className="absolute bottom-2 right-2 bg-black/80 text-white border-none">
                                {formatDuration(episode.duration)}
                            </Badge>
                        )}

                        {/* Watched Overlay */}
                        {episode.watched && (
                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                <Check className="h-12 w-12 text-white" />
                            </div>
                        )}
                    </div>

                    <CardContent className="p-4 flex-1 flex flex-col">
                        {/* Drag Handle */}
                        {isDraggable && (
                            <div
                                {...attributes}
                                {...listeners}
                                className="absolute left-2 top-2 cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity z-10 bg-black/50 p-1 rounded-sm"
                            >
                                <GripVertical className="h-4 w-4 text-white" />
                            </div>
                        )}

                        {/* Title and Channel */}
                        <div className="mb-2">
                            <h3
                                className="font-semibold line-clamp-2 mb-1 cursor-pointer hover:text-primary transition-colors"
                                title={episode.title}
                                onClick={handlePlay}
                            >
                                {episode.title}
                            </h3>
                            <div className="flex flex-wrap items-center gap-x-1 gap-y-0 text-xs text-muted-foreground">
                                <span
                                    className="hover:text-foreground cursor-pointer font-medium"
                                    onClick={() => window.location.href = `/channels/${episode.channelId}`}
                                >
                                    {episode.channelName || 'Unknown Channel'}
                                </span>
                                {episode.viewCount !== null && episode.type === 'video' && (
                                    <>
                                        <span>•</span>
                                        <span>{formatViews(episode.viewCount)}</span>
                                    </>
                                )}
                                {episode.publishedDate && (
                                    <>
                                        <span>•</span>
                                        <span>{formatPublishedDate(episode.publishedDate)}</span>
                                    </>
                                )}
                                {formatEventDate() && (
                                    <>
                                        <span>•</span>
                                        <span className="text-primary/80 font-medium">{formatEventDate()}</span>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Badges */}
                        <div className="flex flex-wrap gap-2 mb-auto pb-3">
                            {episode.priority !== 'none' && (
                                <Badge className={getPriorityColor(episode.priority)}>
                                    {episode.priority.charAt(0).toUpperCase() + episode.priority.slice(1)}
                                </Badge>
                            )}
                            {episode.tags?.map((tag) => (
                                <Badge
                                    key={tag.id}
                                    variant="outline"
                                    style={{
                                        backgroundColor: `${tag.color}15`,
                                        color: tag.color || 'inherit',
                                        borderColor: `${tag.color}40`,
                                    }}
                                    className="font-medium"
                                >
                                    {tag.name}
                                </Badge>
                            ))}
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2 mt-2">
                            <Button
                                size="sm"
                                variant={episode.watchStatus === 'pending' ? 'outline' : (episode.watched ? 'secondary' : 'outline')}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleToggleWatched();
                                }}
                                className={`flex-1 ${episode.watchStatus === 'pending' ? 'text-red-600 border-red-600 dark:text-red-500 dark:border-red-500 hover:bg-red-500/10' : ''}`}
                                title={episode.watchStatus === 'pending' ? "Confirm watched" : (episode.watched ? "Mark as unwatched" : "Mark as watched")}
                            >
                                {episode.watchStatus === 'pending' ? (
                                    <>
                                        <Check className="h-4 w-4 mr-2" />
                                        Confirm Watched
                                    </>
                                ) : (
                                    <>
                                        <Check className={`h-4 w-4 mr-2 ${episode.watched ? 'text-primary' : ''}`} />
                                        {episode.watched ? 'Watched' : 'Mark Watched'}
                                    </>
                                )}
                            </Button>

                            <Button
                                size="sm"
                                variant={episode.favorite ? 'secondary' : 'outline'}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleToggleFavorite();
                                }}
                                title={episode.favorite ? "Remove from favorites" : "Add to favorites"}
                            >
                                <Star className={`h-4 w-4 ${episode.favorite ? 'fill-primary text-primary' : ''}`} />
                            </Button>

                            <Button
                                size="sm"
                                variant="outline"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setIsTagPopoverOpen(true);
                                    fetchTags();
                                }}
                                title="Manage Tags"
                            >
                                <TagIcon className="h-4 w-4" />
                            </Button>

                            <CommandDialog 
                                open={isTagPopoverOpen} 
                                onOpenChange={setIsTagPopoverOpen}
                                title="Manage Tags"
                                description="Search or create tags for this episode"
                            >
                                <CommandInput
                                    placeholder="Search or create tag..."
                                    value={searchQuery}
                                    onValueChange={setSearchQuery}
                                />
                                <CommandList>
                                    <CommandEmpty>
                                        {searchQuery.trim() && (
                                            <Button
                                                variant="ghost"
                                                className="w-full justify-start text-xs h-8"
                                                onClick={() => handleCreateTag(searchQuery)}
                                                disabled={isUpdatingTags}
                                            >
                                                <Plus className="h-3 w-3 mr-2" />
                                                Create &quot;{searchQuery}&quot;
                                            </Button>
                                        )}
                                        {!searchQuery.trim() && "No tags found."}
                                    </CommandEmpty>
                                    <CommandGroup heading="Recent Tags">
                                        {availableTags.map((tag) => {
                                            const isSelected = episode.tags?.some(t => t.id === tag.id);
                                            return (
                                                <CommandItem
                                                    key={tag.id}
                                                    onSelect={() => handleToggleTag(tag.id)}
                                                    className="flex items-center justify-between"
                                                >
                                                    <div className="flex items-center gap-2">
                                                        <div
                                                            className="w-2 h-2 rounded-full"
                                                            style={{ backgroundColor: tag.color || '#94a3b8' }}
                                                        />
                                                        <span>{tag.name}</span>
                                                    </div>
                                                    {isSelected && <Check className="h-3 w-3" />}
                                                </CommandItem>
                                            );
                                        })}
                                    </CommandGroup>
                                </CommandList>
                            </CommandDialog>

                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        <MoreVertical className="h-4 w-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                                    <DropdownMenuItem onSelect={(e) => {
                                        e.preventDefault();
                                        handleReorder('beginning');
                                    }}>
                                        <ArrowUp className="mr-2 h-4 w-4" />
                                        Move to beginning
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onSelect={(e) => {
                                        e.preventDefault();
                                        handleReorder('end');
                                    }}>
                                        <ArrowDown className="mr-2 h-4 w-4" />
                                        Move to end
                                    </DropdownMenuItem>
                                    
                                    <DropdownMenuSeparator />
                                    
                                    <DropdownMenuItem onSelect={(e) => {
                                        e.preventDefault();
                                        handleToggleWatched();
                                    }}>
                                        <Check className={`mr-2 h-4 w-4 ${episode.watched ? 'text-primary' : ''}`} />
                                        {episode.watched ? 'Mark unwatched' : 'Mark watched'}
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onSelect={(e) => {
                                        e.preventDefault();
                                        setIsTagPopoverOpen(true);
                                        fetchTags();
                                    }}>
                                        <TagIcon className="mr-2 h-4 w-4" />
                                        Add tags
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onSelect={(e) => {
                                        e.preventDefault();
                                        handleToggleFavorite();
                                    }}>
                                        <Star className={`mr-2 h-4 w-4 ${episode.favorite ? 'fill-primary text-primary' : ''}`} />
                                        {episode.favorite ? 'Remove favorite' : 'Add favorite'}
                                    </DropdownMenuItem>

                                    <DropdownMenuSeparator />

                                    {episode.isDeleted ? (
                                        <>
                                            <DropdownMenuItem onSelect={(e) => {
                                                e.preventDefault();
                                                handleRestore();
                                            }} className="text-green-600 font-medium">
                                                <Check className="mr-2 h-4 w-4" />
                                                Restore to watch list
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onSelect={(e) => {
                                                e.preventDefault();
                                                setIsHardDeleteDialogOpen(true);
                                            }} className="text-destructive font-medium">
                                                <Trash2 className="mr-2 h-4 w-4" />
                                                Remove permanently
                                            </DropdownMenuItem>
                                        </>
                                    ) : (
                                        <DropdownMenuItem onSelect={(e) => {
                                            e.preventDefault();
                                            setIsDeleteDialogOpen(true);
                                        }} className="text-destructive font-medium">
                                            <Trash2 className="mr-2 h-4 w-4" />
                                            Remove from list
                                        </DropdownMenuItem>
                                    )}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </CardContent>

                    {/* Bottom Drag Handle Line */}
                    <div
                        {...(isDraggable ? attributes : {})}
                        {...(isDraggable ? listeners : {})}
                        className={`absolute bottom-0 left-0 w-full h-1.5 bg-primary opacity-0 group-hover:opacity-100 transition-opacity z-20 ${isDraggable ? 'cursor-grab active:cursor-grabbing' : ''}`}
                    />
                </Card>

                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Remove from list</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to remove &quot;{episode.title}&quot;? You can restore it later from the Deleted Episodes page.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={handleDelete}>
                            Remove
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Hard Delete Confirmation Dialog */}
            <Dialog open={isHardDeleteDialogOpen} onOpenChange={setIsHardDeleteDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Permanently Delete Episode</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to permanently delete &quot;{episode.title}&quot;? This action cannot be undone and the episode will be completely removed from the database.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsHardDeleteDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={handleHardDelete}>
                            Permanently Delete
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
===
import { useState } from 'react';
import Image from 'next/image';
import { MediaEpisode, Tag } from '@/lib/domain/models';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    Check,
    Star,
    MoreVertical,
    Trash2,
    GripVertical,
    ArrowUp,
    ArrowDown,
    Tag as TagIcon,
    Plus,
    Youtube,
    Mic,
} from 'lucide-react';
import {
    CommandDialog,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from '@/components/ui/command';
import { toast } from 'sonner';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { formatDistanceToNow } from 'date-fns';

interface EpisodeCardProps {
    episode: MediaEpisode;
    onUpdate?: () => void;
    onDelete?: () => void;
    isDraggable?: boolean;
}

export function EpisodeCard({ episode, onUpdate, onDelete, isDraggable = true }: EpisodeCardProps) {
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [isHardDeleteDialogOpen, setIsHardDeleteDialogOpen] = useState(false);
    const [isTagPopoverOpen, setIsTagPopoverOpen] = useState(false);
    const [availableTags, setAvailableTags] = useState<Tag[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [isUpdatingTags, setIsUpdatingTags] = useState(false);

    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
    } = useSortable({ 
        id: episode.id,
        disabled: !isDraggable
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    const handleToggleWatched = async () => {
        try {
            const response = await fetch(`/api/episodes/${episode.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ watched: !episode.watched }),
            });

            if (!response.ok) throw new Error('Failed to update episode');

            toast.success(episode.watched ? 'Marked as unwatched' : 'Marked as watched');
            onUpdate?.();
        } catch {
            toast.error('Failed to update episode');
        }
    };

    const handleToggleFavorite = async () => {
        try {
            const response = await fetch(`/api/episodes/${episode.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ favorite: !episode.favorite }),
            });

            if (!response.ok) throw new Error('Failed to update episode');

            toast.success(episode.favorite ? 'Removed from favorites' : 'Added to favorites');
            onUpdate?.();
        } catch {
            toast.error('Failed to update episode');
        }
    };

    const handleDelete = async () => {
        try {
            const response = await fetch(`/api/episodes/${episode.id}`, {
                method: 'DELETE',
            });

            if (!response.ok) throw new Error('Failed to delete episode');

            toast.success(`${episode.type === 'podcast' ? 'Podcast' : 'Video'} removed from list`);
            setIsDeleteDialogOpen(false);
            onDelete?.();
        } catch {
            toast.error('Failed to delete episode');
        }
    };

    const handleHardDelete = async () => {
        try {
            const response = await fetch(`/api/episodes/${episode.id}?permanent=true`, {
                method: 'DELETE',
            });

            if (!response.ok) throw new Error('Failed to permanently delete episode');

            toast.success(`${episode.type === 'podcast' ? 'Podcast' : 'Video'} permanently deleted`);
            setIsHardDeleteDialogOpen(false);
            onDelete?.();
        } catch {
            toast.error('Failed to permanently delete episode');
        }
    };

    const handleRestore = async () => {
        try {
            const response = await fetch(`/api/episodes/${episode.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ isDeleted: false }),
            });

            if (!response.ok) throw new Error('Failed to restore episode');

            toast.success(`${episode.type === 'podcast' ? 'Podcast' : 'Video'} restored to watch list`);
            window.dispatchEvent(new Event('episode-restored'));
            onUpdate?.();
        } catch {
            toast.error('Failed to restore episode');
        }
    };

    const handleReorder = async (position: 'beginning' | 'end') => {
        try {
            const response = await fetch(`/api/episodes/${episode.id}/reorder`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ position }),
            });

            if (!response.ok) throw new Error('Failed to reorder');

            toast.success(`Moved to ${position}`);
            onUpdate?.();
        } catch {
            toast.error('Failed to reorder episode');
        }
    };

    const handlePlay = async () => {
        window.open(episode.url, '_blank');
        
        const watchAction = localStorage.getItem('watchAction') || 'pending';
        if (watchAction === 'watched' && episode.watchStatus === 'unwatched') {
            handleToggleWatched();
        } else if (watchAction === 'pending' && episode.watchStatus === 'unwatched') {
            try {
                const response = await fetch(`/api/episodes/${episode.id}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ watchStatus: 'pending' }),
                });
                if (response.ok) {
                    toast.success('Marked as pending confirmation');
                    onUpdate?.();
                }
            } catch (error) {
                console.error('Failed to set pending status:', error);
            }
        }
    };

    const fetchTags = async () => {
        try {
            const response = await fetch('/api/tags');
            const data = await response.json();
            if (data.tags) {
                setAvailableTags(data.tags);
            }
        } catch (error) {
            console.error('Error fetching tags:', error);
        }
    };

    const handleToggleTag = async (tagId: string) => {
        setIsUpdatingTags(true);
        try {
            const currentTagIds = episode.tags?.map(t => t.id) || [];
            const isTagSelected = currentTagIds.includes(tagId);
            const newTagIds = isTagSelected
                ? currentTagIds.filter(id => id !== tagId)
                : [...currentTagIds, tagId];

            const response = await fetch(`/api/episodes/${episode.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ tagIds: newTagIds }),
            });

            if (!response.ok) throw new Error('Failed to update tags');

            toast.success('Tags updated');
            onUpdate?.();
        } catch {
            toast.error('Failed to update tags');
        } finally {
            setIsUpdatingTags(false);
        }
    };

    const getRandomColor = () => {
        const colors = [
            '#ef4444', '#f97316', '#f59e0b', '#10b981', '#06b6d4',
            '#3b82f6', '#6366f1', '#8b5cf6', '#d946ef', '#ec4899'
        ];
        return colors[Math.floor(Math.random() * colors.length)];
    };

    const handleCreateTag = async (name: string) => {
        setIsUpdatingTags(true);
        try {
            // 1. Create the tag
            const createResponse = await fetch('/api/tags', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, color: getRandomColor() }),
            });

            if (!createResponse.ok) {
                const error = await createResponse.json();
                throw new Error(error.error || 'Failed to create tag');
            }

            const newTag = await createResponse.json();

            // 2. Add tag to episode
            await handleToggleTag(newTag.id);

            setSearchQuery('');
            fetchTags(); // Refresh local list
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Failed to create tag');
        } finally {
            setIsUpdatingTags(false);
        }
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'high':
                return 'bg-red-500';
            case 'medium':
                return 'bg-yellow-500';
            case 'low':
                return 'bg-blue-500';
            default:
                return 'bg-gray-500';
        }
    };

    const formatDuration = (seconds: number | null) => {
        if (!seconds) return '';
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;

        if (hours > 0) {
            return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        }
        return `${minutes}:${secs.toString().padStart(2, '0')}`;
    };

    const formatViews = (views: number | null) => {
        if (views === null || views === undefined) return '';
        if (views >= 1000000) return `${(views / 1000000).toFixed(1)}M views`;
        if (views >= 1000) return `${(views / 1000).toFixed(1)}K views`;
        return `${views} views`;
    };

    const formatPublishedDate = (dateStr: string | null) => {
        if (!dateStr) return '';
        try {
            return formatDistanceToNow(new Date(dateStr), { addSuffix: true });
        } catch {
            return dateStr;
        }
    };

    const formatEventDate = () => {
        if (episode.lastRemovedAt && episode.isDeleted) {
            return `Removed ${formatDistanceToNow(new Date(episode.lastRemovedAt * 1000), { addSuffix: true })}`;
        }
        
        // Find the latest significant event
        const events = [
            { type: 'Watched', date: episode.lastWatchedAt },
            { type: 'Status updated', date: episode.lastPendingAt },
            { type: 'Restored', date: episode.lastAddedAt && episode.lastAddedAt > (episode.createdAt + 10) ? episode.lastAddedAt : null },
            { type: 'Added', date: episode.lastAddedAt || episode.createdAt }
        ].filter(e => e.date).sort((a, b) => (b.date || 0) - (a.date || 0));

        if (events.length > 0 && events[0].date) {
            return `${events[0].type} ${formatDistanceToNow(new Date(events[0].date * 1000), { addSuffix: true })}`;
        }
        
        return '';
    };

    return (
        <div ref={setNodeRef} style={style} className="h-full">
            <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <Card className={`group relative h-full flex flex-col overflow-hidden p-0 gap-0 ${episode.watched ? 'opacity-60' : ''}`}>
                    {/* Thumbnail */}
                    <div className="relative aspect-video overflow-hidden bg-muted cursor-pointer" onClick={handlePlay}>
                        {episode.thumbnailUrl && (
                            <Image
                                src={episode.thumbnailUrl}
                                alt={episode.title}
                                fill
                                className="object-cover transition-transform duration-500 group-hover:scale-105"
                                unoptimized
                            />
                        )}

                        {/* Media Type Icon */}
                        <div className="absolute top-2 right-2">
                            {episode.type === 'podcast' ? (
                                <Badge className="bg-purple-600 text-white border-none px-1.5 py-0.5">
                                    <Mic className="h-3 w-3 mr-1" />
                                    Podcast
                                </Badge>
                            ) : episode.isShort ? (
                                <Badge className="bg-red-600 text-white border-none px-1.5 py-0.5">
                                    <Youtube className="h-3 w-3 mr-1" />
                                    Shorts
                                </Badge>
                            ) : (
                                <Badge className="bg-red-600 text-white border-none px-1.5 py-0.5">
                                    <Youtube className="h-3 w-3 mr-1" />
                                    Video
                                </Badge>
                            )}
                        </div>

                        {/* Duration Badge */}
                        {episode.duration && (
                            <Badge className="absolute bottom-2 right-2 bg-black/80 text-white border-none">
                                {formatDuration(episode.duration)}
                            </Badge>
                        )}

                        {/* Watched Overlay */}
                        {episode.watched && (
                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                <Check className="h-12 w-12 text-white" />
                            </div>
                        )}
                    </div>

                    <CardContent className="p-4 flex-1 flex flex-col">
                        {/* Drag Handle */}
                        {isDraggable && (
                            <div
                                {...attributes}
                                {...listeners}
                                className="absolute left-2 top-2 cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity z-10 bg-black/50 p-1 rounded-sm"
                            >
                                <GripVertical className="h-4 w-4 text-white" />
                            </div>
                        )}

                        {/* Title and Channel */}
                        <div className="mb-2">
                            <h3
                                className="font-semibold line-clamp-2 mb-1 cursor-pointer hover:text-primary transition-colors"
                                title={episode.title}
                                onClick={handlePlay}
                            >
                                {episode.title}
                            </h3>
                            <div className="flex flex-wrap items-center gap-x-1 gap-y-0 text-xs text-muted-foreground">
                                <span
                                    className="hover:text-foreground cursor-pointer font-medium"
                                    onClick={() => window.location.href = `/channels/${episode.channelId}`}
                                >
                                    {episode.channelName || 'Unknown Channel'}
                                </span>
                                {episode.viewCount !== null && episode.type === 'video' && (
                                    <>
                                        <span>•</span>
                                        <span>{formatViews(episode.viewCount)}</span>
                                    </>
                                )}
                                {episode.publishedDate && (
                                    <>
                                        <span>•</span>
                                        <span>{formatPublishedDate(episode.publishedDate)}</span>
                                    </>
                                )}
                                {formatEventDate() && (
                                    <>
                                        <span>•</span>
                                        <span className="text-primary/80 font-medium">{formatEventDate()}</span>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Badges */}
                        <div className="flex flex-wrap gap-2 mb-auto pb-3">
                            {episode.priority !== 'none' && (
                                <Badge className={getPriorityColor(episode.priority)}>
                                    {episode.priority.charAt(0).toUpperCase() + episode.priority.slice(1)}
                                </Badge>
                            )}
                            {episode.tags?.map((tag) => (
                                <Badge
                                    key={tag.id}
                                    variant="outline"
                                    style={{
                                        backgroundColor: `${tag.color}15`,
                                        color: tag.color || 'inherit',
                                        borderColor: `${tag.color}40`,
                                    }}
                                    className="font-medium"
                                >
                                    {tag.name}
                                </Badge>
                            ))}
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2 mt-2">
                            <Button
                                size="sm"
                                variant={episode.watchStatus === 'pending' ? 'outline' : (episode.watched ? 'secondary' : 'outline')}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleToggleWatched();
                                }}
                                className={`flex-1 ${episode.watchStatus === 'pending' ? 'text-red-600 border-red-600 dark:text-red-500 dark:border-red-500 hover:bg-red-500/10' : ''}`}
                                title={episode.watchStatus === 'pending' ? "Confirm watched" : (episode.watched ? "Mark as unwatched" : "Mark as watched")}
                            >
                                {episode.watchStatus === 'pending' ? (
                                    <>
                                        <Check className="h-4 w-4 mr-2" />
                                        Confirm Watched
                                    </>
                                ) : (
                                    <>
                                        <Check className={`h-4 w-4 mr-2 ${episode.watched ? 'text-primary' : ''}`} />
                                        {episode.watched ? 'Watched' : 'Mark Watched'}
                                    </>
                                )}
                            </Button>

                            <Button
                                size="sm"
                                variant={episode.favorite ? 'secondary' : 'outline'}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleToggleFavorite();
                                }}
                                title={episode.favorite ? "Remove from favorites" : "Add to favorites"}
                            >
                                <Star className={`h-4 w-4 ${episode.favorite ? 'fill-primary text-primary' : ''}`} />
                            </Button>

                            <Button
                                size="sm"
                                variant="outline"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setIsTagPopoverOpen(true);
                                    fetchTags();
                                }}
                                title="Manage Tags"
                            >
                                <TagIcon className="h-4 w-4" />
                            </Button>

                            <CommandDialog 
                                open={isTagPopoverOpen} 
                                onOpenChange={setIsTagPopoverOpen}
                                title="Manage Tags"
                                description="Search or create tags for this episode"
                            >
                                <CommandInput
                                    placeholder="Search or create tag..."
                                    value={searchQuery}
                                    onValueChange={setSearchQuery}
                                />
                                <CommandList>
                                    <CommandEmpty>
                                        {searchQuery.trim() && (
                                            <Button
                                                variant="ghost"
                                                className="w-full justify-start text-xs h-8"
                                                onClick={() => handleCreateTag(searchQuery)}
                                                disabled={isUpdatingTags}
                                            >
                                                <Plus className="h-3 w-3 mr-2" />
                                                Create &quot;{searchQuery}&quot;
                                            </Button>
                                        )}
                                        {!searchQuery.trim() && "No tags found."}
                                    </CommandEmpty>
                                    <CommandGroup heading="Recent Tags">
                                        {availableTags.map((tag) => {
                                            const isSelected = episode.tags?.some(t => t.id === tag.id);
                                            return (
                                                <CommandItem
                                                    key={tag.id}
                                                    onSelect={() => handleToggleTag(tag.id)}
                                                    className="flex items-center justify-between"
                                                >
                                                    <div className="flex items-center gap-2">
                                                        <div
                                                            className="w-2 h-2 rounded-full"
                                                            style={{ backgroundColor: tag.color || '#94a3b8' }}
                                                        />
                                                        <span>{tag.name}</span>
                                                    </div>
                                                    {isSelected && <Check className="h-3 w-3" />}
                                                </CommandItem>
                                            );
                                        })}
                                    </CommandGroup>
                                </CommandList>
                            </CommandDialog>

                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        <MoreVertical className="h-4 w-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                                    <DropdownMenuItem onSelect={(e) => {
                                        e.preventDefault();
                                        handleReorder('beginning');
                                    }}>
                                        <ArrowUp className="mr-2 h-4 w-4" />
                                        Move to beginning
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onSelect={(e) => {
                                        e.preventDefault();
                                        handleReorder('end');
                                    }}>
                                        <ArrowDown className="mr-2 h-4 w-4" />
                                        Move to end
                                    </DropdownMenuItem>
                                    
                                    <DropdownMenuSeparator />
                                    
                                    <DropdownMenuItem onSelect={(e) => {
                                        e.preventDefault();
                                        handleToggleWatched();
                                    }}>
                                        <Check className={`mr-2 h-4 w-4 ${episode.watched ? 'text-primary' : ''}`} />
                                        {episode.watched ? 'Mark unwatched' : 'Mark watched'}
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onSelect={(e) => {
                                        e.preventDefault();
                                        setIsTagPopoverOpen(true);
                                        fetchTags();
                                    }}>
                                        <TagIcon className="mr-2 h-4 w-4" />
                                        Add tags
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onSelect={(e) => {
                                        e.preventDefault();
                                        handleToggleFavorite();
                                    }}>
                                        <Star className={`mr-2 h-4 w-4 ${episode.favorite ? 'fill-primary text-primary' : ''}`} />
                                        {episode.favorite ? 'Remove favorite' : 'Add favorite'}
                                    </DropdownMenuItem>

                                    <DropdownMenuSeparator />

                                    {episode.isDeleted ? (
                                        <>
                                            <DropdownMenuItem onSelect={(e) => {
                                                e.preventDefault();
                                                handleRestore();
                                            }} className="text-green-600 font-medium">
                                                <Check className="mr-2 h-4 w-4" />
                                                Restore to watch list
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onSelect={(e) => {
                                                e.preventDefault();
                                                setIsHardDeleteDialogOpen(true);
                                            }} className="text-destructive font-medium">
                                                <Trash2 className="mr-2 h-4 w-4" />
                                                Remove permanently
                                            </DropdownMenuItem>
                                        </>
                                    ) : (
                                        <DropdownMenuItem onSelect={(e) => {
                                            e.preventDefault();
                                            setIsDeleteDialogOpen(true);
                                        }} className="text-destructive font-medium">
                                            <Trash2 className="mr-2 h-4 w-4" />
                                            Remove from list
                                        </DropdownMenuItem>
                                    )}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </CardContent>

                    {/* Bottom Drag Handle Line */}
                    <div
                        {...(isDraggable ? attributes : {})}
                        {...(isDraggable ? listeners : {})}
                        className={`absolute bottom-0 left-0 w-full h-1.5 bg-primary opacity-0 group-hover:opacity-100 transition-opacity z-20 ${isDraggable ? 'cursor-grab active:cursor-grabbing' : ''}`}
                    />
                </Card>

                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Remove from list</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to remove &quot;{episode.title}&quot;? You can restore it later from the Deleted Episodes page.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={handleDelete}>
                            Remove
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Hard Delete Confirmation Dialog */}
            <Dialog open={isHardDeleteDialogOpen} onOpenChange={setIsHardDeleteDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Permanently Delete Episode</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to permanently delete &quot;{episode.title}&quot;? This action cannot be undone and the episode will be completely removed from the database.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsHardDeleteDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={handleHardDelete}>
                            Permanently Delete
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
```
```diff:episode-list-row.tsx
'use client';

import { useState } from 'react';
import Image from 'next/image';
import { MediaEpisode, Tag } from '@/lib/domain/models';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
    Check,
    Star,
    MoreVertical,
    Trash2,
    GripVertical,
    ArrowUp,
    ArrowDown,
    Tag as TagIcon,
    Plus,
    Youtube,
    Mic,
} from 'lucide-react';
import {
    CommandDialog,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from '@/components/ui/command';
import { toast } from 'sonner';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { formatDistanceToNow } from 'date-fns';

interface EpisodeListRowProps {
    episode: MediaEpisode;
    onUpdate?: () => void;
    onDelete?: () => void;
    isDraggable?: boolean;
}

export function EpisodeListRow({ episode, onUpdate, onDelete, isDraggable = true }: EpisodeListRowProps) {
    const [isTagPopoverOpen, setIsTagPopoverOpen] = useState(false);
    const [availableTags, setAvailableTags] = useState<Tag[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [isUpdatingTags, setIsUpdatingTags] = useState(false);

    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ 
        id: episode.id,
        disabled: !isDraggable
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 50 : 'auto',
    };

    const handleToggleWatched = async (e: React.MouseEvent) => {
        e.stopPropagation();
        try {
            const response = await fetch(`/api/episodes/${episode.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ watched: !episode.watched }),
            });

            if (!response.ok) throw new Error('Failed to update episode');

            toast.success(episode.watched ? 'Marked as unwatched' : 'Marked as watched');
            onUpdate?.();
        } catch {
            toast.error('Failed to update episode');
        }
    };

    const handleToggleFavorite = async (e: React.MouseEvent) => {
        e.stopPropagation();
        try {
            const response = await fetch(`/api/episodes/${episode.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ favorite: !episode.favorite }),
            });

            if (!response.ok) throw new Error('Failed to update episode');

            toast.success(episode.favorite ? 'Removed from favorites' : 'Added to favorites');
            onUpdate?.();
        } catch {
            toast.error('Failed to update episode');
        }
    };

    const handleDelete = async () => {
        try {
            const response = await fetch(`/api/episodes/${episode.id}`, {
                method: 'DELETE',
            });

            if (!response.ok) throw new Error('Failed to delete episode');

            toast.success(`${episode.type === 'podcast' ? 'Podcast' : 'Video'} removed from list`);
            onDelete?.();
        } catch {
            toast.error('Failed to remove episode');
        }
    };

    const handleHardDelete = async () => {
        try {
            const response = await fetch(`/api/episodes/${episode.id}?permanent=true`, {
                method: 'DELETE',
            });

            if (!response.ok) throw new Error('Failed to permanently delete episode');

            toast.success(`${episode.type === 'podcast' ? 'Podcast' : 'Video'} permanently deleted`);
            onDelete?.();
        } catch {
            toast.error('Failed to permanently delete episode');
        }
    };

    const handleRestore = async () => {
        try {
            const response = await fetch(`/api/episodes/${episode.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ isDeleted: false }),
            });

            if (!response.ok) throw new Error('Failed to restore episode');

            toast.success(`${episode.type === 'podcast' ? 'Podcast' : 'Video'} restored to watch list`);
            window.dispatchEvent(new Event('episode-restored'));
            onUpdate?.();
        } catch {
            toast.error('Failed to restore episode');
        }
    };

    const handleReorder = async (position: 'beginning' | 'end') => {
        try {
            const response = await fetch(`/api/episodes/${episode.id}/reorder`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ position }),
            });

            if (!response.ok) throw new Error('Failed to reorder');

            toast.success(`Moved to ${position}`);
            onUpdate?.();
        } catch {
            toast.error('Failed to reorder episode');
        }
    };

    const fetchTags = async () => {
        try {
            const response = await fetch('/api/tags');
            const data = await response.json();
            if (data.tags) {
                setAvailableTags(data.tags);
            }
        } catch (error) {
            console.error('Error fetching tags:', error);
        }
    };

    const handleToggleTag = async (tagId: string) => {
        setIsUpdatingTags(true);
        try {
            const currentTagIds = episode.tags?.map(t => t.id) || [];
            const isTagSelected = currentTagIds.includes(tagId);
            const newTagIds = isTagSelected
                ? currentTagIds.filter(id => id !== tagId)
                : [...currentTagIds, tagId];

            const response = await fetch(`/api/episodes/${episode.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ tagIds: newTagIds }),
            });

            if (!response.ok) throw new Error('Failed to update tags');

            toast.success('Tags updated');
            onUpdate?.();
        } catch {
            toast.error('Failed to update tags');
        } finally {
            setIsUpdatingTags(false);
        }
    };

    const getRandomColor = () => {
        const colors = [
            '#ef4444', '#f97316', '#f59e0b', '#10b981', '#06b6d4',
            '#3b82f6', '#6366f1', '#8b5cf6', '#d946ef', '#ec4899'
        ];
        return colors[Math.floor(Math.random() * colors.length)];
    };

    const handleCreateTag = async (name: string) => {
        setIsUpdatingTags(true);
        try {
            const createResponse = await fetch('/api/tags', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, color: getRandomColor() }),
            });

            if (!createResponse.ok) {
                const error = await createResponse.json();
                throw new Error(error.error || 'Failed to create tag');
            }

            const newTag = await createResponse.json();
            await handleToggleTag(newTag.id);

            setSearchQuery('');
            fetchTags();
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Failed to create tag');
        } finally {
            setIsUpdatingTags(false);
        }
    };

    const handlePlay = async () => {
        window.open(episode.url, '_blank');
        
        const watchAction = localStorage.getItem('watchAction') || 'pending';
        if (watchAction === 'watched' && episode.watchStatus === 'unwatched') {
            try {
                const response = await fetch(`/api/episodes/${episode.id}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ watched: true, watchStatus: 'watched' }),
                });
                if (response.ok) {
                    toast.success('Marked as watched');
                    onUpdate?.();
                }
            } catch (error) {
                console.error('Failed to mark as watched:', error);
            }
        } else if (watchAction === 'pending' && episode.watchStatus === 'unwatched') {
            try {
                const response = await fetch(`/api/episodes/${episode.id}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ watchStatus: 'pending' }),
                });
                if (response.ok) {
                    toast.success('Marked as pending confirmation');
                    onUpdate?.();
                }
            } catch (error) {
                console.error('Failed to set pending status:', error);
            }
        }
    };

    const formatDuration = (seconds: number | null) => {
        if (!seconds) return '';
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;

        if (hours > 0) {
            return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        }
        return `${minutes}:${secs.toString().padStart(2, '0')}`;
    };

    const formatViews = (views: number | null) => {
        if (views === null || views === undefined) return '';
        if (views >= 1000000) return `${(views / 1000000).toFixed(1)}M views`;
        if (views >= 1000) return `${(views / 1000).toFixed(1)}K views`;
        return `${views} views`;
    };

    const formatPublishedDate = (dateStr: string | null) => {
        if (!dateStr) return '';
        try {
            return formatDistanceToNow(new Date(dateStr), { addSuffix: true });
        } catch {
            return dateStr;
        }
    };

    const formatEventDate = () => {
        if (episode.lastRemovedAt && episode.isDeleted) {
            return `Removed ${formatDistanceToNow(new Date(episode.lastRemovedAt * 1000), { addSuffix: true })}`;
        }
        
        // Find the latest significant event
        const events = [
            { type: 'Watched', date: episode.lastWatchedAt },
            { type: 'Restored', date: episode.lastAddedAt && episode.lastAddedAt > (episode.createdAt + 10) ? episode.lastAddedAt : null },
            { type: 'Added', date: episode.lastAddedAt || episode.createdAt }
        ].filter(e => e.date).sort((a, b) => (b.date || 0) - (a.date || 0));

        if (events.length > 0 && events[0].date) {
            return `${events[0].type} ${formatDistanceToNow(new Date(events[0].date * 1000), { addSuffix: true })}`;
        }
        
        return '';
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`group relative w-full border-b last:border-b-0 hover:bg-accent/30 transition-colors ${isDragging ? 'opacity-50 z-50' : ''} ${episode.watched ? 'opacity-60' : ''}`}
        >
            <div className="flex flex-col sm:flex-row w-full">
                <div className="flex items-center gap-2 sm:gap-3 p-2 cursor-default flex-1 min-w-0">
                    {/* Drag Handle */}
                    {isDraggable && (
                        <div
                            {...attributes}
                            {...listeners}
                            className="flex-shrink-0 cursor-grab active:cursor-grabbing p-1 text-muted-foreground/50 hover:text-muted-foreground transition-colors"
                        >
                            <GripVertical className="h-4 w-4 sm:h-5 sm:w-5" />
                        </div>
                    )}

                    {/* Clickable Area (Thumbnail + Metadata) */}
                    <div
                        className="flex-1 min-w-0 flex items-center gap-2 sm:gap-3 cursor-pointer"
                        onClick={handlePlay}
                    >
                        {/* Thumbnail */}
                        <div className="relative w-28 xs:w-32 sm:w-48 aspect-video flex-shrink-0 rounded-md overflow-hidden bg-muted">
                            {episode.thumbnailUrl && (
                                <Image
                                    src={episode.thumbnailUrl}
                                    alt={episode.title}
                                    fill
                                    className="object-cover"
                                    unoptimized
                                />
                            )}
                            {episode.duration && (
                                <Badge className="absolute bottom-1 right-1 bg-black/80 text-white text-[10px] px-1 py-0 h-4 border-none">
                                    {formatDuration(episode.duration)}
                                </Badge>
                            )}
                            {episode.watched && (
                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                    <Check className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
                                </div>
                            )}
                            {/* Media Type Icon */}
                            <div className="absolute top-1 right-1">
                                {episode.type === 'podcast' ? (
                                    <Mic className="h-3 w-3 text-white drop-shadow-md" />
                                ) : (
                                    <Youtube className="h-3 w-3 text-white drop-shadow-md" />
                                )}
                            </div>
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0 flex flex-col gap-0.5 sm:gap-1">
                            <h3 className="font-semibold text-xs sm:text-sm line-clamp-2 leading-tight hover:text-primary transition-colors" title={episode.title}>
                                {episode.title}
                            </h3>
                            <div className="flex flex-wrap items-center gap-x-1 sm:gap-x-2 gap-y-0.5 text-[10px] sm:text-xs text-muted-foreground">
                                <span
                                    className="font-medium hover:text-foreground truncate"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        window.location.href = `/channels/${episode.channelId}`;
                                    }}
                                >
                                    {episode.channelName || 'Unknown Channel'}
                                </span>
                                <span>•</span>
                                {episode.viewCount !== null && episode.type === 'video' && (
                                    <>
                                        <span>{formatViews(episode.viewCount)}</span>
                                        <span>•</span>
                                    </>
                                )}
                                <span>{formatPublishedDate(episode.publishedDate)}</span>
                                {formatEventDate() && (
                                    <>
                                        <span>•</span>
                                        <span className="text-primary/80 font-medium">{formatEventDate()}</span>
                                    </>
                                )}
                            </div>

                            {/* Tags Badges (Only on desktop, mobile has them in the info row or we can keep them here) */}
                            {episode.tags && episode.tags.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-0.5 sm:mt-1">
                                    {episode.tags.map((tag) => (
                                        <Badge
                                            key={tag.id}
                                            variant="outline"
                                            style={{
                                                backgroundColor: `${tag.color}15`,
                                                color: tag.color || 'inherit',
                                                borderColor: `${tag.color}40`,
                                            }}
                                            className="text-[9px] sm:text-[10px] px-1 sm:px-1.5 py-0 h-3.5 sm:h-4 font-medium"
                                        >
                                            {tag.name}
                                        </Badge>
                                    ))}
                                </div>
                            )}

                            {/* Status Icons */}
                            <div className="flex items-center gap-2 mt-0.5">
                                {episode.favorite && (
                                    <Star className="h-3 w-3 sm:h-3.5 sm:w-3.5 fill-primary text-primary" />
                                )}
                                {episode.priority !== 'none' && (
                                    <Badge variant="outline" className="text-[9px] sm:text-[10px] px-1 py-0 h-3.5 sm:h-4 border-primary/30 text-primary">
                                        {episode.priority}
                                    </Badge>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Actions (Outside the clickable play area) */}
                    <div className="flex items-center gap-1 pr-1">
                        <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 flex"
                            onClick={(e) => {
                                e.stopPropagation();
                                handleToggleWatched(e);
                            }}
                            title={episode.watched ? "Mark as unwatched" : "Mark as watched"}
                        >
                            <Check className={`h-4 w-4 ${episode.watched ? 'text-primary' : ''}`} />
                        </Button>
                        <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 flex"
                            onClick={(e) => {
                                e.stopPropagation();
                                handleToggleFavorite(e);
                            }}
                            title={episode.favorite ? "Remove from favorites" : "Add to favorites"}
                        >
                            <Star className={`h-4 w-4 ${episode.favorite ? 'fill-primary text-primary' : ''}`} />
                        </Button>

                        <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 flex"
                            onClick={(e) => {
                                e.stopPropagation();
                                setIsTagPopoverOpen(true);
                                fetchTags();
                            }}
                            title="Manage Tags"
                        >
                            <TagIcon className="h-4 w-4" />
                        </Button>

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    size="icon"
                                    variant="ghost"
                                    className="h-8 w-8"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <MoreVertical className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                                <DropdownMenuItem onSelect={(e) => {
                                    e.preventDefault();
                                    handleReorder('beginning');
                                }}>
                                    <ArrowUp className="mr-2 h-4 w-4" />
                                    Move to beginning
                                </DropdownMenuItem>
                                <DropdownMenuItem onSelect={(e) => {
                                    e.preventDefault();
                                    handleReorder('end');
                                }}>
                                    <ArrowDown className="mr-2 h-4 w-4" />
                                    Move to end
                                </DropdownMenuItem>
                                
                                <DropdownMenuSeparator />
                                
                                <DropdownMenuItem onSelect={(e) => {
                                    e.preventDefault();
                                    handleToggleWatched(e as unknown as React.MouseEvent);
                                }}>
                                    <Check className={`mr-2 h-4 w-4 ${episode.watched ? 'text-primary' : ''}`} />
                                    {episode.watched ? 'Mark unwatched' : 'Mark watched'}
                                </DropdownMenuItem>
                                <DropdownMenuItem onSelect={(e) => {
                                    e.preventDefault();
                                    setIsTagPopoverOpen(true);
                                    fetchTags();
                                }}>
                                    <TagIcon className="mr-2 h-4 w-4" />
                                    Add tags
                                </DropdownMenuItem>
                                <DropdownMenuItem onSelect={(e) => {
                                    e.preventDefault();
                                    handleToggleFavorite(e as unknown as React.MouseEvent);
                                }}>
                                    <Star className={`mr-2 h-4 w-4 ${episode.favorite ? 'fill-primary text-primary' : ''}`} />
                                    {episode.favorite ? 'Remove favorite' : 'Add favorite'}
                                </DropdownMenuItem>

                                <DropdownMenuSeparator />

                                {episode.isDeleted ? (
                                    <>
                                        <DropdownMenuItem onSelect={(e) => {
                                            e.preventDefault();
                                            handleRestore();
                                        }} className="text-green-600 font-medium">
                                            <Check className="mr-2 h-4 w-4" />
                                            Restore to watch list
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onSelect={(e) => {
                                            e.preventDefault();
                                            handleHardDelete();
                                        }} className="text-destructive font-medium">
                                            <Trash2 className="mr-2 h-4 w-4" />
                                            Remove permanently
                                        </DropdownMenuItem>
                                    </>
                                ) : (
                                    <DropdownMenuItem onSelect={(e) => {
                                        e.preventDefault();
                                        handleDelete();
                                    }} className="text-destructive">
                                        <Trash2 className="mr-2 h-4 w-4" />
                                        Remove from list
                                    </DropdownMenuItem>
                                )}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>

                {/* Mobile Specific Actions Row */}
                <div className="flex sm:hidden items-center border-t border-border/40 bg-accent/5 px-4 py-1 gap-1">
                    <Button
                        variant="ghost"
                        size="sm"
                        className="flex-1 h-8 text-[10px] gap-2 font-medium"
                        onClick={(e) => {
                            e.stopPropagation();
                            handleToggleWatched(e);
                        }}
                    >
                        <Check className={`h-3.5 w-3.5 ${episode.watched ? 'text-primary' : ''}`} />
                        {episode.watched ? 'Watched' : 'Mark Watched'}
                    </Button>
                    <div className="w-px h-4 bg-border/40" />
                    <Button
                        variant="ghost"
                        size="sm"
                        className="flex-1 h-8 text-[10px] gap-2 font-medium"
                        onClick={(e) => {
                            e.stopPropagation();
                            handleToggleFavorite(e);
                        }}
                    >
                        <Star className={`h-3.5 w-3.5 ${episode.favorite ? 'fill-primary text-primary' : ''}`} />
                        {episode.favorite ? 'Favorited' : 'Favorite'}
                    </Button>
                    <div className="w-px h-4 bg-border/40" />
                    <Button
                        variant="ghost"
                        size="sm"
                        className="flex-1 h-8 text-[10px] gap-2 font-medium"
                        onClick={(e) => {
                            e.stopPropagation();
                            setIsTagPopoverOpen(true);
                            fetchTags();
                        }}
                    >
                        <TagIcon className="h-3.5 w-3.5" />
                        Tags
                    </Button>
                </div>
            </div>

            <CommandDialog 
                open={isTagPopoverOpen} 
                onOpenChange={setIsTagPopoverOpen}
                title="Manage Tags"
                description="Search or create tags for this episode"
            >
                <CommandInput
                    placeholder="Search or create tag..."
                    value={searchQuery}
                    onValueChange={setSearchQuery}
                />
                <CommandList>
                    <CommandEmpty>
                        {searchQuery.trim() && (
                            <Button
                                variant="ghost"
                                className="w-full justify-start text-xs h-8"
                                onClick={() => handleCreateTag(searchQuery)}
                                disabled={isUpdatingTags}
                            >
                                <Plus className="h-3 w-3 mr-2" />
                                Create &quot;{searchQuery}&quot;
                            </Button>
                        )}
                        {!searchQuery.trim() && "No tags found."}
                    </CommandEmpty>
                    <CommandGroup heading="Recent Tags">
                        {availableTags.map((tag) => {
                            const isSelected = episode.tags?.some(t => t.id === tag.id);
                            return (
                                <CommandItem
                                    key={tag.id}
                                    onSelect={() => handleToggleTag(tag.id)}
                                    className="flex items-center justify-between"
                                >
                                    <div className="flex items-center gap-2">
                                        <div
                                            className="w-2 h-2 rounded-full"
                                            style={{ backgroundColor: tag.color || '#94a3b8' }}
                                        />
                                        <span>{tag.name}</span>
                                    </div>
                                    {isSelected && <Check className="h-3 w-3" />}
                                </CommandItem>
                            );
                        })}
                    </CommandGroup>
                </CommandList>
            </CommandDialog>
        </div>
    );
}
===
'use client';

import { useState } from 'react';
import Image from 'next/image';
import { MediaEpisode, Tag } from '@/lib/domain/models';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
    Check,
    Star,
    MoreVertical,
    Trash2,
    GripVertical,
    ArrowUp,
    ArrowDown,
    Tag as TagIcon,
    Plus,
    Youtube,
    Mic,
} from 'lucide-react';
import {
    CommandDialog,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from '@/components/ui/command';
import { toast } from 'sonner';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { formatDistanceToNow } from 'date-fns';

interface EpisodeListRowProps {
    episode: MediaEpisode;
    onUpdate?: () => void;
    onDelete?: () => void;
    isDraggable?: boolean;
}

export function EpisodeListRow({ episode, onUpdate, onDelete, isDraggable = true }: EpisodeListRowProps) {
    const [isTagPopoverOpen, setIsTagPopoverOpen] = useState(false);
    const [availableTags, setAvailableTags] = useState<Tag[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [isUpdatingTags, setIsUpdatingTags] = useState(false);

    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ 
        id: episode.id,
        disabled: !isDraggable
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 50 : 'auto',
    };

    const handleToggleWatched = async (e: React.MouseEvent) => {
        e.stopPropagation();
        try {
            const response = await fetch(`/api/episodes/${episode.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ watched: !episode.watched }),
            });

            if (!response.ok) throw new Error('Failed to update episode');

            toast.success(episode.watched ? 'Marked as unwatched' : 'Marked as watched');
            onUpdate?.();
        } catch {
            toast.error('Failed to update episode');
        }
    };

    const handleToggleFavorite = async (e: React.MouseEvent) => {
        e.stopPropagation();
        try {
            const response = await fetch(`/api/episodes/${episode.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ favorite: !episode.favorite }),
            });

            if (!response.ok) throw new Error('Failed to update episode');

            toast.success(episode.favorite ? 'Removed from favorites' : 'Added to favorites');
            onUpdate?.();
        } catch {
            toast.error('Failed to update episode');
        }
    };

    const handleDelete = async () => {
        try {
            const response = await fetch(`/api/episodes/${episode.id}`, {
                method: 'DELETE',
            });

            if (!response.ok) throw new Error('Failed to delete episode');

            toast.success(`${episode.type === 'podcast' ? 'Podcast' : 'Video'} removed from list`);
            onDelete?.();
        } catch {
            toast.error('Failed to remove episode');
        }
    };

    const handleHardDelete = async () => {
        try {
            const response = await fetch(`/api/episodes/${episode.id}?permanent=true`, {
                method: 'DELETE',
            });

            if (!response.ok) throw new Error('Failed to permanently delete episode');

            toast.success(`${episode.type === 'podcast' ? 'Podcast' : 'Video'} permanently deleted`);
            onDelete?.();
        } catch {
            toast.error('Failed to permanently delete episode');
        }
    };

    const handleRestore = async () => {
        try {
            const response = await fetch(`/api/episodes/${episode.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ isDeleted: false }),
            });

            if (!response.ok) throw new Error('Failed to restore episode');

            toast.success(`${episode.type === 'podcast' ? 'Podcast' : 'Video'} restored to watch list`);
            window.dispatchEvent(new Event('episode-restored'));
            onUpdate?.();
        } catch {
            toast.error('Failed to restore episode');
        }
    };

    const handleReorder = async (position: 'beginning' | 'end') => {
        try {
            const response = await fetch(`/api/episodes/${episode.id}/reorder`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ position }),
            });

            if (!response.ok) throw new Error('Failed to reorder');

            toast.success(`Moved to ${position}`);
            onUpdate?.();
        } catch {
            toast.error('Failed to reorder episode');
        }
    };

    const fetchTags = async () => {
        try {
            const response = await fetch('/api/tags');
            const data = await response.json();
            if (data.tags) {
                setAvailableTags(data.tags);
            }
        } catch (error) {
            console.error('Error fetching tags:', error);
        }
    };

    const handleToggleTag = async (tagId: string) => {
        setIsUpdatingTags(true);
        try {
            const currentTagIds = episode.tags?.map(t => t.id) || [];
            const isTagSelected = currentTagIds.includes(tagId);
            const newTagIds = isTagSelected
                ? currentTagIds.filter(id => id !== tagId)
                : [...currentTagIds, tagId];

            const response = await fetch(`/api/episodes/${episode.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ tagIds: newTagIds }),
            });

            if (!response.ok) throw new Error('Failed to update tags');

            toast.success('Tags updated');
            onUpdate?.();
        } catch {
            toast.error('Failed to update tags');
        } finally {
            setIsUpdatingTags(false);
        }
    };

    const getRandomColor = () => {
        const colors = [
            '#ef4444', '#f97316', '#f59e0b', '#10b981', '#06b6d4',
            '#3b82f6', '#6366f1', '#8b5cf6', '#d946ef', '#ec4899'
        ];
        return colors[Math.floor(Math.random() * colors.length)];
    };

    const handleCreateTag = async (name: string) => {
        setIsUpdatingTags(true);
        try {
            const createResponse = await fetch('/api/tags', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, color: getRandomColor() }),
            });

            if (!createResponse.ok) {
                const error = await createResponse.json();
                throw new Error(error.error || 'Failed to create tag');
            }

            const newTag = await createResponse.json();
            await handleToggleTag(newTag.id);

            setSearchQuery('');
            fetchTags();
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Failed to create tag');
        } finally {
            setIsUpdatingTags(false);
        }
    };

    const handlePlay = async () => {
        window.open(episode.url, '_blank');
        
        const watchAction = localStorage.getItem('watchAction') || 'pending';
        if (watchAction === 'watched' && episode.watchStatus === 'unwatched') {
            try {
                const response = await fetch(`/api/episodes/${episode.id}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ watched: true, watchStatus: 'watched' }),
                });
                if (response.ok) {
                    toast.success('Marked as watched');
                    onUpdate?.();
                }
            } catch (error) {
                console.error('Failed to mark as watched:', error);
            }
        } else if (watchAction === 'pending' && episode.watchStatus === 'unwatched') {
            try {
                const response = await fetch(`/api/episodes/${episode.id}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ watchStatus: 'pending' }),
                });
                if (response.ok) {
                    toast.success('Marked as pending confirmation');
                    onUpdate?.();
                }
            } catch (error) {
                console.error('Failed to set pending status:', error);
            }
        }
    };

    const formatDuration = (seconds: number | null) => {
        if (!seconds) return '';
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;

        if (hours > 0) {
            return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        }
        return `${minutes}:${secs.toString().padStart(2, '0')}`;
    };

    const formatViews = (views: number | null) => {
        if (views === null || views === undefined) return '';
        if (views >= 1000000) return `${(views / 1000000).toFixed(1)}M views`;
        if (views >= 1000) return `${(views / 1000).toFixed(1)}K views`;
        return `${views} views`;
    };

    const formatPublishedDate = (dateStr: string | null) => {
        if (!dateStr) return '';
        try {
            return formatDistanceToNow(new Date(dateStr), { addSuffix: true });
        } catch {
            return dateStr;
        }
    };

    const formatEventDate = () => {
        if (episode.lastRemovedAt && episode.isDeleted) {
            return `Removed ${formatDistanceToNow(new Date(episode.lastRemovedAt * 1000), { addSuffix: true })}`;
        }
        
        // Find the latest significant event
        const events = [
            { type: 'Watched', date: episode.lastWatchedAt },
            { type: 'Restored', date: episode.lastAddedAt && episode.lastAddedAt > (episode.createdAt + 10) ? episode.lastAddedAt : null },
            { type: 'Added', date: episode.lastAddedAt || episode.createdAt }
        ].filter(e => e.date).sort((a, b) => (b.date || 0) - (a.date || 0));

        if (events.length > 0 && events[0].date) {
            return `${events[0].type} ${formatDistanceToNow(new Date(events[0].date * 1000), { addSuffix: true })}`;
        }
        
        return '';
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`group relative w-full border-b last:border-b-0 hover:bg-accent/30 transition-colors ${isDragging ? 'opacity-50 z-50' : ''} ${episode.watched ? 'opacity-60' : ''}`}
        >
            <div className="flex flex-col sm:flex-row w-full">
                <div className="flex items-center gap-2 sm:gap-3 p-2 cursor-default flex-1 min-w-0">
                    {/* Drag Handle */}
                    {isDraggable && (
                        <div
                            {...attributes}
                            {...listeners}
                            className="flex-shrink-0 cursor-grab active:cursor-grabbing p-1 text-muted-foreground/50 hover:text-muted-foreground transition-colors"
                        >
                            <GripVertical className="h-4 w-4 sm:h-5 sm:w-5" />
                        </div>
                    )}

                    {/* Clickable Area (Thumbnail + Metadata) */}
                    <div
                        className="flex-1 min-w-0 flex items-center gap-2 sm:gap-3 cursor-pointer"
                        onClick={handlePlay}
                    >
                        {/* Thumbnail */}
                        <div className="relative w-28 xs:w-32 sm:w-48 aspect-video flex-shrink-0 rounded-md overflow-hidden bg-muted">
                            {episode.thumbnailUrl && (
                                <Image
                                    src={episode.thumbnailUrl}
                                    alt={episode.title}
                                    fill
                                    className="object-cover"
                                    unoptimized
                                />
                            )}
                            {episode.duration && (
                                <Badge className="absolute bottom-1 right-1 bg-black/80 text-white text-[10px] px-1 py-0 h-4 border-none">
                                    {formatDuration(episode.duration)}
                                </Badge>
                            )}
                            {episode.watched && (
                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                    <Check className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
                                </div>
                            )}
                            {/* Media Type Icon */}
                            <div className="absolute top-1 right-1">
                                {episode.type === 'podcast' ? (
                                    <Mic className="h-3 w-3 text-white drop-shadow-md" />
                                ) : episode.isShort ? (
                                    <Badge className="bg-red-600 text-white border-none px-1 py-0 h-4 flex items-center gap-1 scale-75 origin-top-right">
                                        <Youtube className="h-3 w-3" />
                                        <span>Shorts</span>
                                    </Badge>
                                ) : (
                                    <Youtube className="h-3 w-3 text-white drop-shadow-md" />
                                )}
                            </div>
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0 flex flex-col gap-0.5 sm:gap-1">
                            <h3 className="font-semibold text-xs sm:text-sm line-clamp-2 leading-tight hover:text-primary transition-colors" title={episode.title}>
                                {episode.title}
                            </h3>
                            <div className="flex flex-wrap items-center gap-x-1 sm:gap-x-2 gap-y-0.5 text-[10px] sm:text-xs text-muted-foreground">
                                <span
                                    className="font-medium hover:text-foreground truncate"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        window.location.href = `/channels/${episode.channelId}`;
                                    }}
                                >
                                    {episode.channelName || 'Unknown Channel'}
                                </span>
                                <span>•</span>
                                {episode.viewCount !== null && episode.type === 'video' && (
                                    <>
                                        <span>{formatViews(episode.viewCount)}</span>
                                        <span>•</span>
                                    </>
                                )}
                                <span>{formatPublishedDate(episode.publishedDate)}</span>
                                {formatEventDate() && (
                                    <>
                                        <span>•</span>
                                        <span className="text-primary/80 font-medium">{formatEventDate()}</span>
                                    </>
                                )}
                            </div>

                            {/* Tags Badges (Only on desktop, mobile has them in the info row or we can keep them here) */}
                            {episode.tags && episode.tags.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-0.5 sm:mt-1">
                                    {episode.tags.map((tag) => (
                                        <Badge
                                            key={tag.id}
                                            variant="outline"
                                            style={{
                                                backgroundColor: `${tag.color}15`,
                                                color: tag.color || 'inherit',
                                                borderColor: `${tag.color}40`,
                                            }}
                                            className="text-[9px] sm:text-[10px] px-1 sm:px-1.5 py-0 h-3.5 sm:h-4 font-medium"
                                        >
                                            {tag.name}
                                        </Badge>
                                    ))}
                                </div>
                            )}

                            {/* Status Icons */}
                            <div className="flex items-center gap-2 mt-0.5">
                                {episode.favorite && (
                                    <Star className="h-3 w-3 sm:h-3.5 sm:w-3.5 fill-primary text-primary" />
                                )}
                                {episode.priority !== 'none' && (
                                    <Badge variant="outline" className="text-[9px] sm:text-[10px] px-1 py-0 h-3.5 sm:h-4 border-primary/30 text-primary">
                                        {episode.priority}
                                    </Badge>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Actions (Outside the clickable play area) */}
                    <div className="flex items-center gap-1 pr-1">
                        <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 flex"
                            onClick={(e) => {
                                e.stopPropagation();
                                handleToggleWatched(e);
                            }}
                            title={episode.watched ? "Mark as unwatched" : "Mark as watched"}
                        >
                            <Check className={`h-4 w-4 ${episode.watched ? 'text-primary' : ''}`} />
                        </Button>
                        <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 flex"
                            onClick={(e) => {
                                e.stopPropagation();
                                handleToggleFavorite(e);
                            }}
                            title={episode.favorite ? "Remove from favorites" : "Add to favorites"}
                        >
                            <Star className={`h-4 w-4 ${episode.favorite ? 'fill-primary text-primary' : ''}`} />
                        </Button>

                        <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 flex"
                            onClick={(e) => {
                                e.stopPropagation();
                                setIsTagPopoverOpen(true);
                                fetchTags();
                            }}
                            title="Manage Tags"
                        >
                            <TagIcon className="h-4 w-4" />
                        </Button>

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    size="icon"
                                    variant="ghost"
                                    className="h-8 w-8"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <MoreVertical className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                                <DropdownMenuItem onSelect={(e) => {
                                    e.preventDefault();
                                    handleReorder('beginning');
                                }}>
                                    <ArrowUp className="mr-2 h-4 w-4" />
                                    Move to beginning
                                </DropdownMenuItem>
                                <DropdownMenuItem onSelect={(e) => {
                                    e.preventDefault();
                                    handleReorder('end');
                                }}>
                                    <ArrowDown className="mr-2 h-4 w-4" />
                                    Move to end
                                </DropdownMenuItem>
                                
                                <DropdownMenuSeparator />
                                
                                <DropdownMenuItem onSelect={(e) => {
                                    e.preventDefault();
                                    handleToggleWatched(e as unknown as React.MouseEvent);
                                }}>
                                    <Check className={`mr-2 h-4 w-4 ${episode.watched ? 'text-primary' : ''}`} />
                                    {episode.watched ? 'Mark unwatched' : 'Mark watched'}
                                </DropdownMenuItem>
                                <DropdownMenuItem onSelect={(e) => {
                                    e.preventDefault();
                                    setIsTagPopoverOpen(true);
                                    fetchTags();
                                }}>
                                    <TagIcon className="mr-2 h-4 w-4" />
                                    Add tags
                                </DropdownMenuItem>
                                <DropdownMenuItem onSelect={(e) => {
                                    e.preventDefault();
                                    handleToggleFavorite(e as unknown as React.MouseEvent);
                                }}>
                                    <Star className={`mr-2 h-4 w-4 ${episode.favorite ? 'fill-primary text-primary' : ''}`} />
                                    {episode.favorite ? 'Remove favorite' : 'Add favorite'}
                                </DropdownMenuItem>

                                <DropdownMenuSeparator />

                                {episode.isDeleted ? (
                                    <>
                                        <DropdownMenuItem onSelect={(e) => {
                                            e.preventDefault();
                                            handleRestore();
                                        }} className="text-green-600 font-medium">
                                            <Check className="mr-2 h-4 w-4" />
                                            Restore to watch list
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onSelect={(e) => {
                                            e.preventDefault();
                                            handleHardDelete();
                                        }} className="text-destructive font-medium">
                                            <Trash2 className="mr-2 h-4 w-4" />
                                            Remove permanently
                                        </DropdownMenuItem>
                                    </>
                                ) : (
                                    <DropdownMenuItem onSelect={(e) => {
                                        e.preventDefault();
                                        handleDelete();
                                    }} className="text-destructive">
                                        <Trash2 className="mr-2 h-4 w-4" />
                                        Remove from list
                                    </DropdownMenuItem>
                                )}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>

                {/* Mobile Specific Actions Row */}
                <div className="flex sm:hidden items-center border-t border-border/40 bg-accent/5 px-4 py-1 gap-1">
                    <Button
                        variant="ghost"
                        size="sm"
                        className="flex-1 h-8 text-[10px] gap-2 font-medium"
                        onClick={(e) => {
                            e.stopPropagation();
                            handleToggleWatched(e);
                        }}
                    >
                        <Check className={`h-3.5 w-3.5 ${episode.watched ? 'text-primary' : ''}`} />
                        {episode.watched ? 'Watched' : 'Mark Watched'}
                    </Button>
                    <div className="w-px h-4 bg-border/40" />
                    <Button
                        variant="ghost"
                        size="sm"
                        className="flex-1 h-8 text-[10px] gap-2 font-medium"
                        onClick={(e) => {
                            e.stopPropagation();
                            handleToggleFavorite(e);
                        }}
                    >
                        <Star className={`h-3.5 w-3.5 ${episode.favorite ? 'fill-primary text-primary' : ''}`} />
                        {episode.favorite ? 'Favorited' : 'Favorite'}
                    </Button>
                    <div className="w-px h-4 bg-border/40" />
                    <Button
                        variant="ghost"
                        size="sm"
                        className="flex-1 h-8 text-[10px] gap-2 font-medium"
                        onClick={(e) => {
                            e.stopPropagation();
                            setIsTagPopoverOpen(true);
                            fetchTags();
                        }}
                    >
                        <TagIcon className="h-3.5 w-3.5" />
                        Tags
                    </Button>
                </div>
            </div>

            <CommandDialog 
                open={isTagPopoverOpen} 
                onOpenChange={setIsTagPopoverOpen}
                title="Manage Tags"
                description="Search or create tags for this episode"
            >
                <CommandInput
                    placeholder="Search or create tag..."
                    value={searchQuery}
                    onValueChange={setSearchQuery}
                />
                <CommandList>
                    <CommandEmpty>
                        {searchQuery.trim() && (
                            <Button
                                variant="ghost"
                                className="w-full justify-start text-xs h-8"
                                onClick={() => handleCreateTag(searchQuery)}
                                disabled={isUpdatingTags}
                            >
                                <Plus className="h-3 w-3 mr-2" />
                                Create &quot;{searchQuery}&quot;
                            </Button>
                        )}
                        {!searchQuery.trim() && "No tags found."}
                    </CommandEmpty>
                    <CommandGroup heading="Recent Tags">
                        {availableTags.map((tag) => {
                            const isSelected = episode.tags?.some(t => t.id === tag.id);
                            return (
                                <CommandItem
                                    key={tag.id}
                                    onSelect={() => handleToggleTag(tag.id)}
                                    className="flex items-center justify-between"
                                >
                                    <div className="flex items-center gap-2">
                                        <div
                                            className="w-2 h-2 rounded-full"
                                            style={{ backgroundColor: tag.color || '#94a3b8' }}
                                        />
                                        <span>{tag.name}</span>
                                    </div>
                                    {isSelected && <Check className="h-3 w-3" />}
                                </CommandItem>
                            );
                        })}
                    </CommandGroup>
                </CommandList>
            </CommandDialog>
        </div>
    );
}
```
