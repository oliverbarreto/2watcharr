# New Feature: Stats

## Research and Planning
- [x] Explore codebase and data model
- [x] Design database changes for watch status
- [x] Design API for stats
- [x] Design Stats page UI
- [x] Create implementation plan

## Database and Service Layer
- [x] Add `watch_status` column to `episodes` table
- [x] Migrate existing `watched` data to `watch_status`
- [x] Add `pending` and `tagged` event types
- [x] Update [EpisodeRepository](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/lib/repositories/episode.repository.ts#12-464) to handle new states and events
- [x] Update [MediaService](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/lib/services/media.service.ts#12-302) to record `tagged` events and handle `pending` state
- [x] Create [StatsService](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/lib/services/stats.service.ts#31-151) for calculating various statistics

## API Layer
- [x] Update episode APIs to handle `watch_status`
- [x] Create `/api/stats` endpoint

## UI Implementation - Settings and Watch List
- [x] Add "Watch Action" setting to General tab
- [x] Update [EpisodeCard](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/components/features/episodes/episode-card.tsx#54-600) to handle auto-watch/pending actions on click
- [x] Add "Pending" visual indicator and confirmation button to [EpisodeCard](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/components/features/episodes/episode-card.tsx#54-600)
- [x] Update [FilterBar](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/components/features/episodes/filter-bar.tsx#34-275) to support "Pending" filter

## UI Implementation - Stats Page
- [x] Create basic `/stats` page structure
- [x] Implement total counts cards
- [x] Implement usage charts (Added/Watched/Favorited/Removed)
- [x] Implement play time stats and temporal filters
- [x] Add average play time per video

## Verification
- [ ] Verify database migrations
- [ ] Test auto-watch/pending settings
- [ ] Validate stats calculations against expected values
- [ ] Check responsive design of the Stats page
