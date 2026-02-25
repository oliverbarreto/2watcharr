# Task Breakdown: Implementation of Archive Feature

- [x] Initial Research and Planning
    - [x] Explore codebase to understand current episode management
    - [x] Identify database schema changes needed (if any)
    - [x] Design API endpoints for archiving/unarchiving
    - [x] Create implementation plan

- [x] Backend Implementation
    - [x] Database Schema: Add `is_archived` and `archived_at` columns and indexes
    - [x] Repository: Update [EpisodeRepository](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/lib/repositories/episode.repository.ts#18-769) for archive fields
    - [x] Service: Add archive/unarchive methods to [MediaService](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/lib/services/media.service.ts#16-597)
    - [x] API: Create/Update endpoints for archive actions
- [x] Frontend Implementation
    - [x] Utilities: Update date grouping to support `archived_at`
    - [x] New Page: Create Archived Episodes page
    - [x] UI Components: Update [EpisodeCard](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/components/features/episodes/episode-card.tsx#65-1034) and [EpisodeListRow](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/components/features/episodes/episode-list-row.tsx#72-1041) with archive actions
    - [x] Integration: Add archive button and link to [WatchNextPage](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/app/watchnext/page.tsx#339-354) and Navbar
- [x] Verification and Polish
    - [x] Manual test: Archive and unarchive episodes
    - [x] Manual test: Verify date grouping on archived page
    - [x] Manual test: Bulk archive and unarchive
    - [x] Final UI review

