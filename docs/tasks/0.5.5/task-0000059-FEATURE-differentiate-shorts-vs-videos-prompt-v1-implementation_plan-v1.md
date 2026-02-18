# Differentiate YouTube Videos and Shorts

This plan outlines the changes needed to identify, store, and display YouTube Shorts differently from regular videos.

## Proposed Changes

### Database & Models

#### [MODIFY] [schema.sql](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/lib/db/schema.sql)
- Add `is_short BOOLEAN NOT NULL DEFAULT 0` to the `episodes` table.
- Add an index for `idx_episodes_is_short`.

#### [MODIFY] [migrations.ts](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/lib/db/migrations.ts)
- Add a new migration `add_is_short` to ALter the `episodes` table and add the column.

#### [MODIFY] [models.ts](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/lib/domain/models.ts)
- Update [MediaEpisode](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/lib/domain/models.ts#31-62) and [CreateEpisodeDto](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/lib/domain/models.ts#91-105) to include the `isShort` property.

---

### Backend Logic

#### [MODIFY] [episode.repository.ts](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/lib/repositories/episode.repository.ts)
- Update [create](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/lib/repositories/episode.repository.ts#20-59), [update](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/lib/repositories/episode.repository.ts#330-406), and [mapRowToEpisode](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/lib/repositories/episode.repository.ts#636-667) to handle the `is_short` database column.

#### [MODIFY] [youtube-metadata.service.ts](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/lib/services/youtube-metadata.service.ts)
- Update [extractMetadata](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/lib/services/youtube-metadata.service.ts#13-55) to detect Shorts.
- Detection logic will check if the URL contains `/shorts/` or if the video duration is less than 60 seconds (as a fallback/hint, though the URL is more reliable).

#### [MODIFY] [media.service.ts](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/lib/services/media.service.ts)
- Pass `isShort` from metadata to the repository when creating or updating episodes.
- Add a utility function/script to update existing episodes:
  - Iterate through all videos and mark those with `/shorts/` in their URL as `isShort = true`.

---

### UI Components

#### [MODIFY] [episode-card.tsx](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/components/features/episodes/episode-card.tsx)
- Update the badge logic to show "Shorts" instead of "Video" when `episode.isShort` is true.
- Use a distinct color or icon for Shorts if desired (e.g., maintain red-600 but change text/icon).

#### [MODIFY] [episode-list-row.tsx](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/components/features/episodes/episode-list-row.tsx)
- Similar update to display labels for Shorts in the list view.

## Verification Plan

### Automated Tests
- Run existing repository tests to ensure no regressions:
  ```bash
  npm test src/lib/repositories/episode.repository.test.ts
  ```
- Run metadata service tests (if I add/update them):
  ```bash
  npm test src/lib/services/media.service.test.ts
  ```

### Manual Verification
- Add a YouTube Short URL and verify it shows the "Shorts" badge.
- Add a regular YouTube video and verify it still shows "Video".
- Run the data migration and verify existing Shorts in the database are updated.
