# Implementation Plan - Improve UX Events Table in Stats Page

Improve the events table by adding a Tags column, fixing missing data (podcasts and deleted episodes), and enhancing the overall UX.

## User Review Required

> [!IMPORTANT]
> I am proposing a database migration to add `title` and `type` columns to the `media_events` table. This is necessary to preserve the history of hard-deleted episodes.
> I will also change the foreign key from `episodes(id)` to `ON DELETE SET NULL` to prevent events from being deleted when an episode is removed.

## Proposed Changes

### Database

#### [MODIFY] [schema.sql](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/lib/db/schema.sql)
- Update `media_events` table definition to include `title` and `type` columns.
- Change `episode_id` foreign key to `ON DELETE SET NULL`.

#### [MODIFY] [migrations.ts](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/lib/db/migrations.ts)
- Add a new migration `add_event_metadata` to:
    - Add `title` and `type` columns to `media_events`.
    - Backfill these columns from the `episodes` table.
    - Change foreign key to `ON DELETE SET NULL`. Since SQLite doesn't support `ALTER TABLE ... DROP CONSTRAINT`, this requires recreating the table.

### Backend

#### [MODIFY] [stats.service.ts](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/lib/services/stats.service.ts)
- Update [DashboardStats](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/app/stats/page.tsx#52-84) interface to include `tags` in `detailedStats`.
- Update [getDetailedStats](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/lib/services/stats.service.ts#208-235) to:
    - Join with `episode_tags` and `tags` to fetch tag names.
    - Use `me.title` and `me.type` instead of joining `episodes` ONLY for those (to handle deleted episodes).
    - Ensure it returns all events regardless of `is_deleted` status.

#### [MODIFY] [episode.repository.ts](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/lib/repositories/episode.repository.ts)
- Update [addEvent](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/lib/repositories/episode.repository.ts#385-397) to accept `title` and `type` and store them in `media_events`.

#### [MODIFY] [media.service.ts](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/lib/services/media.service.ts)
- Pass `title` and `type` to [addEvent](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/lib/repositories/episode.repository.ts#385-397) calls.

### Frontend

#### [MODIFY] [page.tsx](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/app/stats/page.tsx)
- Update [DashboardStats](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/app/stats/page.tsx#52-84) interface.
- Add "Tags" column to the `Table`.
- Update [handleSort](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/app/stats/page.tsx#146-154) and sorting logic to support tags.
- Improve visual styling of the table (better padding, colors, etc.).

---

## Verification Plan

### Automated Tests
- Run `npm run test` to ensure no regressions in existing repository tests.
- Create a new test case in [episode.repository.test.ts](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/lib/repositories/episode.repository.test.ts) to verify that events are preserved after hard-deleting an episode.

### Manual Verification
1.  **Add a Podcast**: Add a podcast episode and verify it appears in the Detailed History table with the correct icon and type.
2.  **Tag an Episode**: Add tags to an episode and verify they appear in the new Tags column.
3.  **Soft-delete an Episode**: Delete an episode (soft delete) and verify its events (e.g., 'added', 'removed') still appear in the history.
4.  **Hard-delete an Episode**: Permanently delete an episode and verify its events still appear in the history (with the title preserved).
5.  **Sorting**: Click on all column headers (Title, Type, Action, Date, Tags) to verify sorting works correctly.
6.  **Search**: Use the search bar to filter events by title and verify it works.
