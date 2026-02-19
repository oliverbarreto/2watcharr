# Implementation Plan - Add Like/Don't Like functionality for episodes

We want to add a new "Like/Don't Like" status to episodes, allowing users to express their opinion on videos and podcasts. This is separate from the "Favorite" status.

## User Review Required

> [!IMPORTANT]
> - The new `like_status` will have three states: `none` (default), `like`, and `dislike`.
> - Toggling `like` will deselect `dislike`, and vice versa.

## Proposed Changes

### Database & Domain Models

#### [MODIFY] [schema.sql](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/lib/db/schema.sql)
- Add `like_status TEXT CHECK(like_status IN ('none', 'like', 'dislike')) DEFAULT 'none'` to `episodes` table.
- Add index `idx_episodes_like_status` for performance.

#### [MODIFY] [models.ts](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/lib/domain/models.ts)
- Add `LikeStatus` type: `'none' | 'like' | 'dislike'`.
- Update [MediaEpisode](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/lib/domain/models.ts#31-64) to include `likeStatus: LikeStatus`.
- Update [UpdateEpisodeDto](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/lib/domain/models.ts#109-123) to include `likeStatus?: LikeStatus`.
- Update [EpisodeFilters](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/lib/domain/models.ts#142-156) to include `likeStatus?: LikeStatus`.

#### [NEW] [add_like_status.ts](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/lib/db/migrations/add_like_status.ts)
- Create a new migration file to add the `like_status` column to the `episodes` table in existing databases.

#### [MODIFY] [migrations.ts](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/lib/db/migrations.ts)
- Register the new `add_like_status` migration.

---

### Backend Logic

#### [MODIFY] [episode.repository.ts](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/lib/repositories/episode.repository.ts)
- Update [create](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/lib/repositories/episode.repository.ts#20-60), [findById](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/lib/repositories/episode.repository.ts#61-94), [findAll](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/lib/repositories/episode.repository.ts#106-264), [update](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/lib/repositories/episode.repository.ts#357-441), and [countAll](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/lib/repositories/episode.repository.ts#265-356) to handle `like_status`.
- Update [mapRowToEpisode](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/lib/repositories/episode.repository.ts#671-704) to map `like_status` to `likeStatus`.

#### [MODIFY] [media.service.ts](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/lib/services/media.service.ts)
- Add `toggleLikeStatus(id: string, status: LikeStatus)` method.

#### [MODIFY] [route.ts](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/app/api/episodes/route.ts)
- Update [GET](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/app/api/episodes/route.ts#60-139) handler to support filtering by `likeStatus`.

#### [MODIFY] [route.ts](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/app/api/episodes/%5Bid%5D/route.ts)
- Update `updateEpisodeSchema` to include `likeStatus`.
- Update [PATCH](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/app/api/episodes/%5Bid%5D/route.ts#64-126) handler to process `likeStatus`.

---

### UI Components

#### [MODIFY] [episode-card.tsx](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/components/features/episodes/episode-card.tsx)
- Add thumb-up and thumb-down buttons below the channel/info area.
- Add icons: `ThumbsUp`, `ThumbsDown` from `lucide-react`.
- Add "Like" and "Don't Like" options to the dropdown menu.
- Implement toggle logic for clicking buttons or selecting menu items.

#### [MODIFY] [episode-list-row.tsx](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/components/features/episodes/episode-list-row.tsx)
- Add thumb-up and thumb-down buttons in the actions area.
- Add "Like" and "Don't Like" options to the dropdown menu.

#### [MODIFY] [filter-bar.tsx](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/components/features/episodes/filter-bar.tsx)
- Add two new filter buttons for "Liked" and "Not Liked" episodes to the right of the favorite filter.
- Update `onFilterChange` to include the new filters.

## Verification Plan

### Automated Tests
- Run existing tests to ensure no regressions:
  ```bash
  npm test src/lib/repositories/episode.repository.test.ts
  npm test src/lib/services/media.service.test.ts
  ```
- Create a new test file `src/lib/repositories/episode.repository.like.test.ts` to verify:
  - Creating episodes with `like_status`.
  - Updating `like_status`.
  - Filtering by `like_status`.

### Manual Verification
1.  **Database Migration**:
    *   Restart the app and verify the migration runs successfully.
2.  **UI Interaction**:
    *   Open the watchlist page.
    *   Click thumb-up on an episode card. Verify it highlights and the other (thumb-down) is deselected.
    *   Click thumb-down. Verify it highlights and thumb-up is deselected.
    *   Verify the same behavior in the list view (row cell).
    *   Verify the dropdown menu options "Like" and "Don't Like" work as expected.
3.  **Filtering**:
    *   Select "Liked" filter. Verify only episodes with thumb-up are shown.
    *   Select "Not Liked" filter. Verify only episodes with thumb-down are shown.
    *   Select both? (The user said "Add two buttons... the user can be listing 'unwatched' episodes and select 'liked' or 'not liked' to filter the list"). I'll treat them as independent toggles in the filter bar, but they can be combined if the user wants (though it might be rare).
    *   Verify clearing filters works.
