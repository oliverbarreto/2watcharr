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
  like_status TEXT CHECK(like_status IN ('none', 'like', 'dislike')) DEFAULT 'none',
  notes TEXT,                       -- User personal notes
  
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
CREATE INDEX IF NOT EXISTS idx_episodes_like_status ON episodes(like_status);
CREATE INDEX IF NOT EXISTS idx_episodes_created_at ON episodes(created_at);
CREATE INDEX IF NOT EXISTS idx_episode_tags_tag_id ON episode_tags(tag_id);
CREATE INDEX IF NOT EXISTS idx_tags_user_id ON tags(user_id);
CREATE INDEX IF NOT EXISTS idx_media_events_episode_id ON media_events(episode_id);
CREATE INDEX IF NOT EXISTS idx_media_events_type ON media_events(type);
CREATE INDEX IF NOT EXISTS idx_media_events_created_at ON media_events(created_at);
CREATE INDEX IF NOT EXISTS idx_channels_type ON channels(type);
