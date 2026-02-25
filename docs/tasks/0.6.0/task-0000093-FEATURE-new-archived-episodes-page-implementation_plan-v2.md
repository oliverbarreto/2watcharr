# Archive Feature Implementation Plan

We need to implement an "Archive" functionality for episodes in the "Watch Next" list to help users declutter their queue.

## Proposed Changes

### Database & Models

#### [MODIFY] [schema.sql](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/lib/db/schema.sql)
- Add `is_archived` BOOLEAN NOT NULL DEFAULT 0 to the `episodes` table.
- Add `archived_at` INTEGER (Unix timestamp, nullable) to the `episodes` table.
- Add index `idx_episodes_is_archived` on `episodes(is_archived)`.
- Add index `idx_episodes_archived_at` on `episodes(archived_at)`.

#### [NEW] [add_archive_fields.ts](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/lib/db/migrations/add_archive_fields.ts)
- Create migration to add `is_archived` and `archived_at` columns and indexes to the `episodes` table.


#### [MODIFY] [migrations.ts](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/lib/db/migrations.ts)
- Register the new `add_is_archived` migration.

#### [MODIFY] [models.ts](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/lib/domain/models.ts)
- Update [MediaEpisode](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/lib/domain/models.ts#32-66) to include `isArchived: boolean` and `archivedAt?: number`.
- Update [UpdateEpisodeDto](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/lib/domain/models.ts#112-127) to include `isArchived?: boolean`.
- Update [EpisodeFilters](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/lib/domain/models.ts#146-162) to include `isArchived?: boolean`.


---

### Backend Components

#### [MODIFY] [episode.repository.ts](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/lib/repositories/episode.repository.ts)
- Update [create](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/lib/repositories/episode.repository.ts#44-84), [findById](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/lib/repositories/episode.repository.ts#85-118), [findAll](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/lib/repositories/episode.repository.ts#130-297), [getFilterStats](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/lib/repositories/episode.repository.ts#298-401), [update](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/lib/repositories/episode.repository.ts#410-498), and [mapRowToEpisode](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/lib/repositories/episode.repository.ts#701-735) to handle the `isArchived` and `archivedAt` fields.
- Default `is_archived = 0` in all queries unless specified via filters.
- Update [buildOrderBy](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/lib/repositories/episode.repository.ts#672-700) to support sorting by `archived_at`.


#### [MODIFY] [media.service.ts](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/lib/services/media.service.ts)
- Add `archiveEpisode(id: string)` and `unarchiveEpisode(id: string)` methods (sets `is_archived` and `archived_at`).
- Add `archiveAllWatched(userId: string)` and `unarchiveAll(userId: string)` methods.


---

### API Layer

#### [MODIFY] [route.ts](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/app/api/episodes/%5Bid%5D/route.ts)
- Update `updateEpisodeSchema` to allow `isArchived`.
- Ensure archiving is handled via PATCH on the episode ID.

#### [NEW] [archive-all-watched](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/app/api/episodes/archive-all-watched/route.ts)
- Implementation of POST `/api/episodes/archive-all-watched`.

#### [NEW] [unarchive-all](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/app/api/episodes/unarchive-all/route.ts)
- Implementation of POST `/api/episodes/unarchive-all`.

---

### Frontend UI

#### [NEW] [archived/page.tsx](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/app/archived/page.tsx)
- Create the "Archived Episodes" page.
- Use `GroupedEpisodeList` (if appropriate) to group by `archivedAt`.
- Support search and filter panel (like [WatchNextPage](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/app/watchnext/page.tsx#263-278)).
- Include "Unarchive All" button.

#### [MODIFY] [grouped-episode-list.tsx](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/components/features/episodes/grouped-episode-list.tsx)
- Ensure it can group by `archivedAt`.


#### [MODIFY] [episode-card.tsx](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/components/features/episodes/episode-card.tsx)
- Add Archive/Unarchive button with confirmation modal.
- Only show Archive button when in "Watch Next" or "Watch List" context.
- Show Unarchive button when in "Archived" context.

#### [MODIFY] [episode-list-row.tsx](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/components/features/episodes/episode-list-row.tsx)
- Add similar buttons and confirmation logic for the list view.

#### [MODIFY] [watchnext/page.tsx](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/app/watchnext/page.tsx)
- Add "Archive Watched" button with confirmation modal next to the view toggle.
- Add link to "Archived" page next to the view toggle.

#### [MODIFY] [navbar.tsx](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/components/layout/navbar.tsx)
- Ensure "Archived" page title is handled correctly.


## Verification Plan

### Automated Tests
- Create unit tests for `MediaService.archiveEpisode` and `MediaService.archiveAllWatched`.
- Verify database migration by running the app and checking the schema.

### Manual Verification
1.  **Archive Single Episode**:
    *   Navigate to "Watch Next".
    *   Click "Archive" on an episode card.
    *   Confirm in modal.
    *   Verify episode is removed from "Watch Next" and appears in "Archived".
2.  **Archive All Watched**:
    *   Navigate to "Watch Next".
    *   Click "Archive Watched" button.
    *   Confirm in modal.
    *   Verify all watched episodes are archived.
3.  **Unarchive Single Episode**:
    *   Navigate to "Archived".
    *   Click "Unarchive" on an episode card.
    *   Confirm in modal.
    *   Verify episode is removed from "Archived" and appears back in "Watch Next" (if prioritized) or "Watch List".
4.  **Unarchive All**:
    *   Navigate to "Archived".
    *   Click "Unarchive All".
    *   Confirm in modal.
    *   Verify all episodes are moved back.
