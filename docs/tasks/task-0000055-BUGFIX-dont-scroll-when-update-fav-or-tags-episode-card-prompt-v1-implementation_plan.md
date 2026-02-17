# Implementation Plan - YouTube Shorts Support

Allow users to add YouTube Shorts to their watchlist by leveraging `yt-dlp`'s built-in support for shorts URLs.

## Proposed Changes

### Backend

#### [MODIFY] [youtube-metadata.service.ts](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/lib/services/youtube-metadata.service.ts)
- Update [extractMetadata](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/lib/services/metadata.service.ts#14-28) to use `rawData.webpage_url` as the episode URL instead of the original URL, ensuring better compatibility with playback.
- Detect if the video is a Short by checking the original URL or metadata and potentially adding a "#Shorts" tag or prefixing the title to make it identifiable in the UI.

#### [MODIFY] [metadata.service.ts](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/lib/services/metadata.service.ts)
- Ensure [isYouTubeUrl](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/lib/services/metadata.service.ts#42-48) remains broad enough to catch all YouTube-related domains including shorts. (Already seems broad enough, but will double-check).

### Frontend

#### [MODIFY] [add-episode-dialog.tsx](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/components/features/episodes/add-episode-dialog.tsx)
- Update the placeholder text to explicitly mention YouTube Shorts.

#### [MODIFY] [episode-card.tsx](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/components/features/episodes/episode-card.tsx)
- Detect if an episode is a Short (e.g., by URL pattern or duration) and show a "Short" badge instead of a generic "Video" badge if possible.

## Verification Plan

### Automated Tests
- Run existing tests to ensure no regressions:
  ```bash
  npm test
  ```
- Add a new test case in [src/lib/services/media.service.sync.test.ts](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/lib/services/media.service.sync.test.ts) or similar that specifically tests a YouTube Short URL.

### Manual Verification
1. Open the "Add New Media" dialog.
2. Paste a YouTube Short URL (e.g., `https://www.youtube.com/shorts/BvJ7vqVaq0o`).
3. Verify the episode is added correctly with title, channel, and thumbnail.
4. Verify clicking the episode opens the video correctly.
5. Verify (if implemented) that a "Short" badge or indicator is visible.
