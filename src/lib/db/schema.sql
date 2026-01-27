-- 2watcharr Database Schema
-- SQLite database for managing YouTube "Watch Later" videos

-- Users table (for future multi-user support)
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch())
);

-- Channels table
CREATE TABLE IF NOT EXISTS channels (
  id TEXT PRIMARY KEY,              -- YouTube channel ID
  name TEXT NOT NULL,
  description TEXT,
  thumbnail_url TEXT,
  channel_url TEXT NOT NULL,
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch())
);

-- Tags table
CREATE TABLE IF NOT EXISTS tags (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  color TEXT,                       -- Hex color for UI
  user_id TEXT,                     -- For future multi-user support
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Videos table
CREATE TABLE IF NOT EXISTS videos (
  id TEXT PRIMARY KEY,              -- Auto-generated UUID
  youtube_id TEXT NOT NULL UNIQUE,  -- YouTube video ID
  title TEXT NOT NULL,
  description TEXT,
  duration INTEGER,                 -- Duration in seconds
  thumbnail_url TEXT,
  video_url TEXT NOT NULL,
  upload_date TEXT,                 -- YouTube upload date (ISO 8601)
  published_date TEXT,              -- YouTube published date (ISO 8601)
  view_count INTEGER,               -- YouTube view count
  channel_id TEXT,
  
  -- User management fields
  watched BOOLEAN NOT NULL DEFAULT 0,
  favorite BOOLEAN NOT NULL DEFAULT 0,
  is_deleted BOOLEAN NOT NULL DEFAULT 0,
  priority TEXT CHECK(priority IN ('none', 'low', 'medium', 'high')) DEFAULT 'none',
  custom_order INTEGER,             -- For manual reordering
  
  -- Metadata
  user_id TEXT,                     -- For future multi-user support
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch()),
  
  FOREIGN KEY (channel_id) REFERENCES channels(id) ON DELETE SET NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Video-Tag relationship (many-to-many)
CREATE TABLE IF NOT EXISTS video_tags (
  video_id TEXT NOT NULL,
  tag_id TEXT NOT NULL,
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  
  PRIMARY KEY (video_id, tag_id),
  FOREIGN KEY (video_id) REFERENCES videos(id) ON DELETE CASCADE,
  FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_videos_channel_id ON videos(channel_id);
CREATE INDEX IF NOT EXISTS idx_videos_watched ON videos(watched);
CREATE INDEX IF NOT EXISTS idx_videos_is_deleted ON videos(is_deleted);
CREATE INDEX IF NOT EXISTS idx_videos_favorite ON videos(favorite);
CREATE INDEX IF NOT EXISTS idx_videos_priority ON videos(priority);
CREATE INDEX IF NOT EXISTS idx_videos_created_at ON videos(created_at);
CREATE INDEX IF NOT EXISTS idx_video_tags_tag_id ON video_tags(tag_id);
CREATE INDEX IF NOT EXISTS idx_tags_user_id ON tags(user_id);
