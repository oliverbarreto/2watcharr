# 2watcharr PoC Implementation Plan

A YouTube "Watch Later" management application that allows users to save, organize, and manage videos they want to watch later with tags, priorities, and comprehensive metadata.

## User Review Required

> [!IMPORTANT]
> **Single-User PoC**: This implementation is designed for single-user usage without authentication. The database schema will accommodate future multi-user support, but authentication is explicitly out of scope for the PoC.

> [!IMPORTANT]
> **Production-Ready Local Deployment**: The Docker Compose setup will be production-ready but deployed locally on macOS. This means proper security, logging, and error handling, but optimized for local development and personal use.

> [!IMPORTANT]
> **No Video Downloads**: The application uses `yt-dlp` ONLY for metadata extraction. No videos or audio files will be downloaded or stored. The app stores metadata and provides links to play videos in YouTube.

## Proposed Changes

### Phase 1: Project Foundation

#### [NEW] Project Initialization

**Summary**: Bootstrap a Next.js 14+ application with TypeScript, Tailwind CSS, and shadcn/ui. Set up the foundational project structure following Clean Architecture principles.

**Tasks**:
1. Initialize Next.js project with TypeScript and App Router
   ```bash
   npx create-next-app@latest 2watcharr --typescript --tailwind --app --src-dir
   ```
2. Install and configure shadcn/ui
   ```bash
   npx shadcn-ui@latest init
   ```
3. Install core dependencies:
   - `better-sqlite3` for SQLite database
   - `@types/better-sqlite3` for TypeScript support
   - `zod` for schema validation
   - `date-fns` for date formatting
4. Configure ESLint and Prettier for code quality
5. Set up project structure:
   ```
   src/
   ├── app/              # Next.js App Router pages
   ├── lib/
   │   ├── domain/       # Domain models and business logic
   │   ├── services/     # Application services
   │   ├── repositories/ # Data access layer
   │   ├── utils/        # Utility functions
   │   └── db/          # Database configuration
   └── components/       # React components
       ├── ui/          # shadcn/ui components
       └── features/    # Feature-specific components
   ```

---

#### [NEW] Docker Configuration

**Files**:
- `Dockerfile`
- `docker-compose.yml`
- `.dockerignore`

**Dockerfile Strategy**:
- Multi-stage build for optimized image size
- Install `yt-dlp` and Python runtime in the container
- Use Node.js 20 LTS as base image
- Production-ready with proper user permissions

**Docker Compose Services**:
1. **app**: Next.js application
   - Expose port 3000
   - Volume mount for SQLite database persistence
   - Volume mount for logs
2. **Environment Variables**: Configure via `.env` file
   - `DATABASE_PATH=/data/2watcharr.db`
   - `LOG_LEVEL=info`
   - `NODE_ENV=production`

---

#### [NEW] Documentation Structure

**Files**:
- `CHANGELOG.md` - Following [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) format
- `docs/tracking/features.json` - Feature tracking
- `docs/tracking/bugs.json` - Bug tracking
- `README.md` - Project overview and setup instructions

---

### Phase 2: Database Layer

#### Database Schema Design

**Summary**: Design SQLite database schema with tables for videos, channels, tags, and their relationships. Schema is designed to accommodate future multi-user support.

**[NEW] Database Schema** (`src/lib/db/schema.sql`):

```sql
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
  channel_id TEXT NOT NULL,
  
  -- User management fields
  watched BOOLEAN NOT NULL DEFAULT 0,
  favorite BOOLEAN NOT NULL DEFAULT 0,
  priority TEXT CHECK(priority IN ('none', 'low', 'medium', 'high')) DEFAULT 'none',
  custom_order INTEGER,             -- For manual reordering
  
  -- Metadata
  user_id TEXT,                     -- For future multi-user support
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch()),
  
  FOREIGN KEY (channel_id) REFERENCES channels(id) ON DELETE CASCADE,
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
CREATE INDEX IF NOT EXISTS idx_videos_favorite ON videos(favorite);
CREATE INDEX IF NOT EXISTS idx_videos_priority ON videos(priority);
CREATE INDEX IF NOT EXISTS idx_videos_created_at ON videos(created_at);
CREATE INDEX IF NOT EXISTS idx_video_tags_tag_id ON video_tags(tag_id);
CREATE INDEX IF NOT EXISTS idx_tags_user_id ON tags(user_id);
```

---

#### [NEW] Database Access Layer (`src/lib/db/`)

**Files**:
- `database.ts` - Database connection and initialization
- `migrations.ts` - Database migration runner

**`database.ts`**:
```typescript
import Database from 'better-sqlite3';
import { runMigrations } from './migrations';

let db: Database.Database | null = null;

export function getDatabase(): Database.Database {
  if (!db) {
    const dbPath = process.env.DATABASE_PATH || './data/2watcharr.db';
    db = new Database(dbPath);
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
    runMigrations(db);
  }
  return db;
}

export function closeDatabase(): void {
  if (db) {
    db.close();
    db = null;
  }
}
```

---

#### [NEW] Repository Pattern (`src/lib/repositories/`)

**Files**:
- `video.repository.ts` - Video CRUD operations
- `channel.repository.ts` - Channel CRUD operations
- `tag.repository.ts` - Tag CRUD operations

**Key Operations**:
- `VideoRepository`:
  - `create(video: CreateVideoDto): Video`
  - `findById(id: string): Video | null`
  - `findAll(filters: VideoFilters, sort: SortOptions): Video[]`
  - `update(id: string, updates: UpdateVideoDto): Video`
  - `delete(id: string): void`
  - `reorder(videoIds: string[]): void`
- `ChannelRepository`:
  - `create(channel: CreateChannelDto): Channel`
  - `findById(id: string): Channel | null`
  - `findByYouTubeId(youtubeId: string): Channel | null`
  - `findAll(): Channel[]`
- `TagRepository`:
  - `create(tag: CreateTagDto): Tag`
  - `findById(id: string): Tag | null`
  - `findAll(): Tag[]`
  - `delete(id: string): void`

---

### Phase 3: Backend Services & API

#### [NEW] yt-dlp Metadata Service (`src/lib/services/youtube-metadata.service.ts`)

**Summary**: Service to extract comprehensive metadata from YouTube videos using `yt-dlp`.

**Implementation**:
```typescript
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export interface YouTubeMetadata {
  videoId: string;
  title: string;
  description: string;
  duration: number;
  thumbnailUrl: string;
  videoUrl: string;
  uploadDate: string;
  publishedDate: string;
  channel: {
    id: string;
    name: string;
    url: string;
    description: string;
    thumbnailUrl: string;
  };
}

export class YouTubeMetadataService {
  async extractMetadata(url: string): Promise<YouTubeMetadata> {
    // Use yt-dlp to extract JSON metadata
    const command = `yt-dlp --no-download --dump-json "${url}"`;
    
    try {
      const { stdout } = await execAsync(command);
      const rawData = JSON.parse(stdout);
      
      return {
        videoId: rawData.id,
        title: rawData.title,
        description: rawData.description || '',
        duration: rawData.duration,
        thumbnailUrl: rawData.thumbnail,
        videoUrl: url,
        uploadDate: rawData.upload_date,
        publishedDate: rawData.release_date || rawData.upload_date,
        channel: {
          id: rawData.channel_id,
          name: rawData.channel,
          url: rawData.channel_url,
          description: rawData.channel_description || '',
          thumbnailUrl: rawData.channel_thumbnail || '',
        },
      };
    } catch (error) {
      // Log error and re-throw
      console.error('Failed to extract metadata:', error);
      throw new Error('Failed to extract video metadata');
    }
  }
}
```

**Tests**: Unit tests for metadata extraction with mocked `yt-dlp` responses

---

#### [NEW] Video Management Service (`src/lib/services/video.service.ts`)

**Summary**: Business logic layer for video management operations.

**Key Methods**:
- `addVideoFromUrl(url: string, tagIds?: string[]): Promise<Video>`
  - Extract metadata using YouTubeMetadataService
  - Check if video already exists
  - Create or update channel
  - Create video record
  - Associate tags
- `updateVideo(id: string, updates: UpdateVideoDto): Promise<Video>`
- `deleteVideo(id: string): Promise<void>`
- `listVideos(filters: VideoFilters, sort: SortOptions): Promise<Video[]>`
  - Apply filters (tags, search, watched status)
  - Apply sorting (favorite > priority > custom_order > date)
- `reorderVideos(videoIds: string[]): Promise<void>`
- `toggleWatched(id: string): Promise<Video>`
- `toggleFavorite(id: string): Promise<Video>`
- `setPriority(id: string, priority: Priority): Promise<Video>`

**Tests**: Unit tests for all business logic

---

#### [NEW] REST API Endpoints (`src/app/api/`)

**Summary**: Next.js API routes for all video and channel operations.

**Endpoints**:

1. **POST `/api/videos`** - Add video from URL
   ```typescript
   // Request body
   {
     "url": "https://youtube.com/watch?v=...",
     "tagIds": ["tag-id-1", "tag-id-2"]  // Optional
   }
   
   // Response
   {
     "id": "uuid",
     "youtubeId": "...",
     "title": "...",
     // ... full video object
   }
   ```

2. **GET `/api/videos`** - List videos with filtering and sorting
   ```typescript
   // Query params
   ?tags=tag1,tag2&search=query&watched=false&sort=priority&order=desc
   
   // Response
   {
     "videos": [/* array of videos */],
     "total": 42
   }
   ```

3. **PATCH `/api/videos/:id`** - Update video properties
   ```typescript
   // Request body
   {
     "watched": true,
     "favorite": true,
     "priority": "high",
     "tagIds": ["tag-id-1"]
   }
   ```

4. **DELETE `/api/videos/:id`** - Delete video

5. **POST `/api/videos/reorder`** - Reorder videos
   ```typescript
   // Request body
   {
     "videoIds": ["id1", "id2", "id3", ...]
   }
   ```

6. **GET `/api/channels`** - List all channels
   ```typescript
   // Response
   {
     "channels": [
       {
         "id": "channel-id",
         "name": "Channel Name",
         "thumbnailUrl": "...",
         "videoCount": 5
       }
     ]
   }
   ```

7. **POST `/api/tags`** - Create tag
8. **GET `/api/tags`** - List all tags
9. **DELETE `/api/tags/:id`** - Delete tag

**Tests**: Integration tests for all endpoints

---

### Phase 4: Frontend UI/UX

#### [NEW] Layout & Navigation (`src/components/`)

**Components**:
- `Layout` - Main app layout with navigation
- `Navbar` - Top navigation with logo and quick actions
- `Sidebar` - Tag filtering sidebar (desktop)
- `MobileNav` - Mobile navigation drawer

---

#### [NEW] Video List View (`src/app/page.tsx`, `src/components/features/videos/`)

**Summary**: Main view displaying the list of videos with filtering, sorting, and management capabilities.

**Components**:

1. **`VideoCard`** - Individual video card displaying:
   - Thumbnail image
   - Title and channel name
   - Duration badge
   - Watched status indicator (checkmark overlay)
   - Favorite icon (star)
   - Priority badge (color-coded: high=red, medium=yellow, low=blue)
   - Tags list
   - Quick actions: Watch, Mark Watched, Favorite, Edit, Delete
   - Drag handle for reordering

2. **`VideoList`** - Container for video cards
   - Implements drag-and-drop using `@dnd-kit/core`
   - Responsive grid layout (1 col mobile, 2-3 cols tablet, 4+ cols desktop)
   - Virtual scrolling for performance with large lists

3. **`FilterBar`** - Filtering and sorting controls
   - Tag multi-select dropdown
   - Search input (title/description/channel)
   - Quick filters: All, Unwatched, Favorites
   - Sort dropdown: Date Added, Priority, Favorite, Duration, Alphabetical
   - Sort order toggle (ascending/descending)

4. **`AddVideoDialog`** - Modal for adding videos
   - URL input field
   - Tag selection (multi-select)
   - Loading state during metadata extraction
   - Error handling and display

**Features**:
- Visual hierarchy: Favorites at top → High priority → Medium → Low → None
- Within each level: Latest first (by created_at)
- Smooth animations for drag-and-drop
- Responsive design with shadcn/ui components

---

#### [NEW] Channels View (`src/app/channels/page.tsx`)

**Summary**: Display all channels with video counts and quick navigation.

**Components**:
- `ChannelGrid` - Grid of channel cards
- `ChannelCard` - Channel thumbnail, name, video count
- Clicking a channel filters the main view by that channel

---

#### [NEW] UI Component Library

**shadcn/ui components to install**:
- `button`
- `card`
- `dialog`
- `input`
- `select`
- `badge`
- `dropdown-menu`
- `tooltip`
- `checkbox`
- `textarea`
- `skeleton` (for loading states)
- `toast` (for notifications)

**Custom Design System**:
- Color palette for priority levels
- Consistent spacing and typography
- Dark mode support
- Accessible components (WCAG AA)

---

### Phase 5: iOS Integration

#### [NEW] iOS Shortcut Endpoint (`src/app/api/shortcuts/add-video/route.ts`)

**Summary**: Dedicated endpoint optimized for iOS Shortcuts app integration.

**Endpoint**: `POST /api/shortcuts/add-video`

**Request**:
```typescript
{
  "url": "https://youtube.com/watch?v=...",
  "tag": "music"  // Optional: tag name (will be created if doesn't exist)
}
```

**Response**:
```typescript
{
  "success": true,
  "video": {
    "id": "...",
    "title": "...",
    "channel": "..."
  }
}
```

**Features**:
- Simple request/response format
- Automatic tag creation by name
- Fast response with minimal metadata
- Error messages optimized for iOS notification display

---

#### [NEW] iOS Shortcut Documentation (`docs/ios-shortcut-setup.md`)

**Contents**:
1. Step-by-step guide to create iOS Shortcut
2. Screenshots of Shortcut configuration
3. Example Shortcut file (downloadable .shortcut)
4. Troubleshooting guide

**iOS Shortcut Steps**:
1. Get input from Share Sheet (URL)
2. Set variable: serverURL = `http://your-mac-ip:3000`
3. Get Contents of URL:
   - URL: `{serverURL}/api/shortcuts/add-video`
   - Method: POST
   - Headers: `Content-Type: application/json`
   - Body: `{"url": "{URL from Share Sheet}", "tag": "default"}`
4. Show notification with result

---

### Phase 6: Testing & Documentation

#### Testing Strategy

**Unit Tests** (`*.test.ts` files):
- All service methods (YouTubeMetadataService, VideoService)
- All repository methods
- Utility functions
- Test framework: Jest or Vitest

**Integration Tests** (`*.integration.test.ts`):
- All API endpoints
- Database operations
- End-to-end workflows (add video → update → delete)

**Test Coverage Target**: 80%+ for services and repositories

---

#### [NEW] Documentation Files

**Files to create**:

1. **`README.md`** - Project overview
   - What is 2watcharr
   - Features list
   - Tech stack
   - Quick start guide
   - Screenshots

2. **`docs/setup.md`** - Detailed setup instructions
   - Prerequisites (Docker, Docker Compose)
   - Installation steps
   - Configuration options
   - Running locally
   - Accessing the app

3. **`docs/api.md`** - API documentation
   - All endpoints with request/response examples
   - Error codes and handling
   - Authentication (for future)

4. **`docs/development.md`** - Development guide
   - Project structure explanation
   - How to add new features
   - Testing guidelines
   - Code style guide
   - Contribution workflow

5. **`docs/architecture.md`** - Architecture overview
   - Clean Architecture layers diagram
   - Data flow diagrams
   - Database schema diagram
   - Technology choices rationale

---

### Phase 7: Deployment & Polish

#### [NEW] Production Docker Setup

**Optimizations**:
- Multi-stage Dockerfile for minimal image size
- Health check endpoint (`/api/health`)
- Graceful shutdown handling
- Log rotation configuration
- Volume mounts for data persistence

**`docker-compose.yml` Final Configuration**:
```yaml
version: '3.8'

services:
  app:
    build:
      context: .
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    volumes:
      - ./data:/data
      - ./logs:/app/logs
    environment:
      - NODE_ENV=production
      - DATABASE_PATH=/data/2watcharr.db
      - LOG_LEVEL=info
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3
```

---

#### [NEW] Deployment Scripts

**Files**:
- `scripts/deploy.sh` - One-command deployment
- `scripts/backup.sh` - Database backup script
- `scripts/restore.sh` - Database restore script

**`deploy.sh`**:
```bash
#!/bin/bash
# Build and start the application
docker-compose down
docker-compose build
docker-compose up -d
echo "2watcharr deployed at http://localhost:3000"
```

---

#### UI/UX Polish

**Enhancements**:
- Smooth loading states and skeletons
- Empty states with helpful CTAs
- Error states with actionable messages
- Keyboard shortcuts for power users
- Optimistic UI updates
- Toast notifications for user actions
- Confirmation dialogs for destructive actions

---

## Verification Plan

### Automated Tests

1. **Run all unit tests**:
   ```bash
   npm test
   ```

2. **Run integration tests**:
   ```bash
   npm run test:integration
   ```

3. **Check test coverage**:
   ```bash
   npm run test:coverage
   ```
   - Verify ≥80% coverage for services and repositories

4. **Linting and type checking**:
   ```bash
   npm run lint
   npm run type-check
   ```

### Manual Verification

#### Core Functionality Tests

1. **Add Video Flow**:
   - [ ] Add a YouTube video via web UI
   - [ ] Verify metadata is correctly extracted (title, channel, duration, thumbnail)
   - [ ] Verify channel is created/updated in database
   - [ ] Add tags to the video
   - [ ] Verify video appears in the list

2. **Video Management**:
   - [ ] Mark video as watched → verify visual indicator
   - [ ] Mark video as favorite → verify it moves to top of list
   - [ ] Set video priority → verify sorting order
   - [ ] Edit video tags
   - [ ] Delete video → verify confirmation dialog

3. **Filtering & Sorting**:
   - [ ] Filter by single tag
   - [ ] Filter by multiple tags
   - [ ] Search by title/description/channel
   - [ ] Sort by each option (date, priority, duration, alphabetical)
   - [ ] Verify sorting respects favorite > priority hierarchy

4. **Drag & Drop Reordering**:
   - [ ] Drag video to new position
   - [ ] Verify order persists after page reload
   - [ ] Verify reordering works on touch devices

5. **Channels View**:
   - [ ] View all channels
   - [ ] Verify video counts are accurate
   - [ ] Click channel → verify main view filters correctly

6. **iOS Shortcut Integration**:
   - [ ] Create iOS Shortcut with provided documentation
   - [ ] Share YouTube video from iOS YouTube app
   - [ ] Verify video is added to the list
   - [ ] Verify notification shows success/error

7. **Link Handling**:
   - [ ] Click "Play" on video (on macOS) → verify opens in browser
   - [ ] Click "Play" on video (on iOS) → verify opens YouTube app if installed
   - [ ] Click "Play" on video (on iOS) → verify opens YouTube website if app not installed

#### Performance Tests

8. **Large Dataset**:
   - [ ] Add 100+ videos
   - [ ] Verify list rendering performance
   - [ ] Verify search and filter performance
   - [ ] Verify drag-and-drop is still smooth

#### Deployment Tests

9. **Docker Deployment**:
   - [ ] Run `docker-compose build`
   - [ ] Run `docker-compose up`
   - [ ] Verify app starts successfully
   - [ ] Verify database persistence after container restart
   - [ ] Verify logs are properly written

10. **Cross-Browser Testing**:
    - [ ] Test on Safari (macOS and iOS)
    - [ ] Test on Chrome (macOS and Android)
    - [ ] Test on Firefox (macOS)
    - [ ] Verify responsive design on mobile/tablet/desktop

### Documentation Verification

11. **Setup Guide**:
    - [ ] Follow setup instructions from scratch
    - [ ] Verify all commands work
    - [ ] Verify screenshots/examples are current

12. **iOS Shortcut Guide**:
    - [ ] Follow iOS shortcut setup instructions
    - [ ] Verify Shortcut works as documented

### Success Criteria

✅ All automated tests pass with ≥80% coverage  
✅ All manual verification tests pass  
✅ App is accessible at `http://localhost:3000` after deployment  
✅ Database persists data across container restarts  
✅ iOS Shortcut successfully adds videos  
✅ Videos open in YouTube app on iOS  
✅ UI is responsive on mobile, tablet, and desktop  
✅ Documentation is complete and accurate
