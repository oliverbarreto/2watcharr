# Implementation Plan - Extend Video Model with Event Dates

Extend the video model to track important dates of videos (added, watched, favorited, removed, etc.) using a dedicated events table. This will support multiple occurrences of the same event and allow sorting/displaying these dates in the UI.

## Proposed Changes

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

## Verification Plan

### Automated Tests
- No existing test suite. I will perform manual verification.

### Manual Verification
1.  **Database Migration**: Restart the app and verify `video_events` table is created and populated with initial data.
2.  **Event Recording**:
    - Add a new video and check if 'added' event is recorded.
    - Toggle watched/favorite and check if events are recorded.
    - Remove a video and check if 'removed' event is recorded.
    - Add the same video again and check if 'restored' event is recorded.
3.  **UI Display**: Verify that video cards and list rows show the correct dates.
4.  **Sorting**: Verify that sorting by "Date Added", "Date Watched", etc., works correctly.
