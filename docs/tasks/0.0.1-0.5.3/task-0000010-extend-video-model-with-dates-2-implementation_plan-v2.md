# Implementation Plan - Extend Video Model with Event Dates (TDD Approach)

Extend the video model to track important dates of videos (added, watched, favorited, removed, etc.) using a dedicated events table. This will support multiple occurrences of the same event and allow sorting/displaying these dates in the UI.

## Phase 1: Test Environment & Unit Tests
Before implementing any changes, we will set up a testing environment and write unit tests to define the expected behavior.

### Test Setup
- **Framework**: Vitest (lightweight and Next.js compatible).
- **In-Memory Database**: Use an in-memory SQLite database for fast, isolated tests.
- **Helper**: Create a `test-db.ts` helper to initialize the schema and manage test data.

### Test Cases
- **Recording Events**: Verify that `addEvent` correctly inserts records into the `video_events` table.
- **Retrieving Video with Dates**: Verify that fetching a video (via [findById](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/lib/repositories/video.repository.ts#52-75) or [findAll](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/lib/repositories/video.repository.ts#87-191)) correctly aggregates the latest event timestamps.
- **Sorting**: Verify that the repository-level sorting by `date_added`, `date_watched`, etc., returns videos in the correct order.
- **Service Integration**: Verify that service methods (e.g., [toggleWatched](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/lib/services/video.service.ts#141-151)) trigger event recording.

---

## Phase 2: Proposed Changes

### Domain Models
#### [MODIFY] [models.ts](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/lib/domain/models.ts)
- Add `VideoEventType` type: `'added' | 'watched' | 'unwatched' | 'favorited' | 'unfavorited' | 'removed' | 'restored'`.
- Add `VideoEvent` interface.
- Extend [Video](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/lib/domain/models.ts#5-28) interface with `lastAddedAt`, `lastWatchedAt`, `lastFavoritedAt`, and `lastRemovedAt` (all optional numbers).
- Update [SortField](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/lib/domain/models.ts#106-107) to include `'date_added'`, `'date_watched'`, `'date_favorited'`, and `'date_removed'`.

---

### Database
#### [MODIFY] [schema.sql](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/lib/db/schema.sql)
- Add the `video_events` table definition.
#### [MODIFY] [migrations.ts](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/lib/db/migrations.ts)
- Add a new migration `add_video_events` to create the table and backfill initial 'added' events from `videos.created_at`.

---

### Repository Layer
#### [MODIFY] [video.repository.ts](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/lib/repositories/video.repository.ts)
- Add `addEvent(videoId: string, eventType: VideoEventType): Promise<void>` method.
- Update [findById](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/lib/repositories/video.repository.ts#52-75) and [findAll](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/lib/repositories/video.repository.ts#87-191) queries to include the latest timestamps for each event type using subqueries.
- Update [mapRowToVideo](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/lib/repositories/video.repository.ts#363-387) to include these timestamps.
- Update [buildOrderBy](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/lib/repositories/video.repository.ts#342-362) to handle new sort fields.

---

### Service Layer
#### [MODIFY] [video.service.ts](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/lib/services/video.service.ts)
- Call `videoRepo.addEvent` in:
    - [addVideoFromUrl](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/lib/services/video.service.ts#25-109): Record 'added' for new videos or 'restored' for soft-deleted ones.
    - [toggleWatched](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/lib/services/video.service.ts#141-151): Record 'watched' or 'unwatched'.
    - [toggleFavorite](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/lib/services/video.service.ts#152-162): Record 'favorited' or 'unfavorited'.
    - [deleteVideo](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/lib/services/video.service.ts#134-140): Record 'removed'.

---

### Frontend Components
#### [MODIFY] [video-card.tsx](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/components/features/videos/video-card.tsx)
- Display relevant event dates (e.g., "Added 2 days ago").
#### [MODIFY] [video-list-row.tsx](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/components/features/videos/video-list-row.tsx)
- Display relevant event dates in the list view.
#### [MODIFY] [filter-bar.tsx](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/components/features/videos/filter-bar.tsx)
- Add new sort options to the dropdown.

---

## Verification Plan

### Automated Tests
- Run `npm run test` (to be added) to verify repo and service logic.
- Ensure all new test cases pass before proceeding to UI changes.

### Manual Verification
1.  **UI Layout**: Verify that the new dates appear correctly on both Grid and List views.
2.  **Sorting**: Test all new sort options in the filter bar.
3.  **Cross-Action Event Visibility**: Watch a video and immediately see "Watched: Just now" (or similar) on the card.
