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
- [x] Update [EpisodeCard](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/components/features/episodes/episode-card.tsx#54-612) to handle auto-watch/pending actions on click
- [x] Add "Pending" visual indicator and confirmation button to [EpisodeCard](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/components/features/episodes/episode-card.tsx#54-612)
- [x] Update [FilterBar](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/components/features/episodes/filter-bar.tsx#34-275) to support "Pending" filter

## UI Implementation - Stats Page
- [x] Create basic `/stats` page structure
- [x] Implement total counts cards
- [x] Implement usage charts (Added/Watched/Favorited/Removed)
- [x] Implement play time stats and temporal filters
- [x] Add average play time per video

## Pending Status Flow Refinement
- [x] Add confirmation button to thumbnail overlay in [EpisodeCard](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/components/features/episodes/episode-card.tsx#54-612)
- [x] Increase prominence of "Confirm Watched" action button
- [x] Set default `watchAction` to `pending` in [EpisodeCard](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/components/features/episodes/episode-card.tsx#54-612) and Settings

## Verification
- [ ] Verify database migrations
- [ ] Test auto-watch/pending settings
- [ ] Validate stats calculations against expected values
- [x] Verify "Confirm" button on thumbnail works
- [x] Verify auto-pending on click works by default

## Stats Page UI Enhancements (shadcn/ui Charts)
- [x] Install `recharts` dependency
- [x] Create [src/components/ui/chart.tsx](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/components/ui/chart.tsx) (shadcn implementation)
- [x] Refactor Activity Timeline to use `AreaChart`
- [x] Add more detailed tooltips and responsive behavior
- [x] Verify charts rendering correctly
