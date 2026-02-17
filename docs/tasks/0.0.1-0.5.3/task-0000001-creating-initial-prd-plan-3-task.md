# 2watcharr PoC Implementation Plan

## Phase 1: Project Foundation & Setup
- [ ] Initialize Next.js project with TypeScript
- [ ] Configure Tailwind CSS and shadcn/ui
- [ ] Set up Docker and Docker Compose configuration
- [ ] Create initial project structure (Clean Architecture layers)
- [ ] Configure linting and code quality tools
- [ ] Set up changelog and feature tracking structure

## Phase 2: Database Layer
- [ ] Design SQLite database schema
  - [ ] Videos table with all metadata fields
  - [ ] Channels table for channel information
  - [ ] Tags table for categorization
  - [ ] Video-Tag relationship table
- [ ] Create database migration scripts
- [ ] Implement database access layer (repositories)
- [ ] Write unit tests for database operations

## Phase 3: Backend Services & API
- [ ] Implement yt-dlp metadata extraction service
  - [ ] Video metadata extraction
  - [ ] Channel metadata extraction
  - [ ] Error handling and logging
- [ ] Create video management service
  - [ ] Add video with metadata
  - [ ] Update video properties (watched, priority, favorite)
  - [ ] Delete video
  - [ ] Reorder videos
- [ ] Build REST API endpoints
  - [ ] POST /api/videos (add video from URL)
  - [ ] GET /api/videos (list with filtering/sorting)
  - [ ] PATCH /api/videos/:id (update properties)
  - [ ] DELETE /api/videos/:id
  - [ ] GET /api/channels (list all channels)
  - [ ] POST /api/videos/reorder
- [ ] Write integration tests for API endpoints
- [ ] Implement comprehensive logging

## Phase 4: Frontend UI/UX
- [ ] Design and implement layout components
- [ ] Create video list view
  - [ ] Video card component with metadata display
  - [ ] Visual indicators for watched/favorite/priority
  - [ ] Drag-and-drop reordering functionality
- [ ] Build filtering and sorting controls
  - [ ] Tag filter
  - [ ] Search functionality (title/description/channel)
  - [ ] Sort options (date, priority, favorite, duration, alphabetical)
- [ ] Create video management UI
  - [ ] Quick add video form/input
  - [ ] Mark as watched/favorite controls
  - [ ] Priority selection
  - [ ] Tag assignment
  - [ ] Delete confirmation
- [ ] Implement channels list view
- [ ] Add responsive design for mobile/tablet/desktop

## Phase 5: iOS Integration
- [ ] Create iOS shortcut-compatible API endpoint
- [ ] Document iOS shortcut setup instructions
- [ ] Test deep linking to YouTube app vs web

## Phase 6: Testing & Documentation
- [ ] Complete test coverage
  - [ ] Unit tests for all services
  - [ ] Integration tests for API
  - [ ] End-to-end tests for critical flows
- [ ] Create comprehensive documentation
  - [ ] README with setup instructions
  - [ ] API documentation
  - [ ] User guide
  - [ ] Development guide
- [ ] Set up features.json and bugs.json tracking
- [ ] Initialize CHANGELOG.md

## Phase 7: Deployment & Polish
- [ ] Finalize Docker Compose configuration
- [ ] Create deployment scripts
- [ ] Performance optimization
- [ ] UI/UX polish and refinements
- [ ] Final testing on macOS
