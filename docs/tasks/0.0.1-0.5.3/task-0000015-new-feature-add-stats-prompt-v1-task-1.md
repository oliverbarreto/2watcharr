# New Feature: Stats

## Research and Planning
- [x] Explore codebase and data model
- [/] Design database changes for watch status
- [ ] Design API for stats
- [ ] Design Stats page UI
- [ ] Create implementation plan

## Database and Service Layer
- [ ] Add `watch_status` column to `episodes` table
- [ ] Migrate existing `watched` data to `watch_status`
- [ ] Add `pending` and `tagged` event types
- [ ] Update [EpisodeRepository](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/lib/repositories/episode.repository.ts#12-443) to handle new states and events
- [ ] Update [MediaService](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/lib/services/media.service.ts#12-261) to record `tagged` events and handle `pending` state
- [ ] Create `StatsService` for calculating various statistics

## API Layer
- [ ] Update episode APIs to handle `watch_status`
- [ ] Create `/api/stats` endpoint

## UI Implementation - Settings and Watch List
- [ ] Add "Watch Action" setting to General tab
- [ ] Update [EpisodeCard](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/components/features/episodes/episode-card.tsx#53-555) to handle auto-watch/pending actions on click
- [ ] Add "Pending" visual indicator and confirmation button to [EpisodeCard](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/components/features/episodes/episode-card.tsx#53-555)
- [ ] Update [FilterBar](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/components/features/episodes/filter-bar.tsx#34-258) to support "Pending" filter

## UI Implementation - Stats Page
- [ ] Create basic `/stats` page structure
- [ ] Implement total counts cards
- [ ] Implement usage charts (Added/Watched/Favorited/Removed)
- [ ] Implement play time stats and temporal filters
- [ ] Add average play time per video

## Verification
- [ ] Verify database migrations
- [ ] Test auto-watch/pending settings
- [ ] Validate stats calculations against expected values
- [ ] Check responsive design of the Stats page
