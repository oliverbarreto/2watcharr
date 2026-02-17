# Implementation Plan - Podcast Support

The goal is to extend 2watcharr to support podcasts as well as videos, using a new "Media Episode" abstraction.

## User Review Required

> [!IMPORTANT]
> This feature involves a significant refactor of the "Video" concept to "Media Episode". This will affect almost all parts of the codebase including the database schema, domain models, services, and UI.

> [!WARNING]
> Existing SQLite databases will be migrated. While I will take care to preserve data, a backup is always recommended.

### Questions for Clarification:
1. **Scope of Podcast Links**: For the initial version, should we focus exclusively on Apple Podcasts links, or do you want generic RSS feed support (manually entering an RSS URL)?
2. **Database Table Naming**: I suggest renaming the `videos` table to `episodes` and `video_tags` to `episode_tags` for consistency. Does this sound good, or would you prefer keeping the "video" naming in the database and just adding a `type` column?
3. **UI Indicators**: How would you like to distinguish between videos and podcasts in the list? (e.g., a specific icon like a microphone vs a play button).

## Proposed Changes

### [Database]
New migration `add_podcast_support`:
- Rename `videos` table to `episodes` (or just add `type`).
- Add `type` column to `channels` and `episodes` ('video' | 'podcast').
- Rename `youtube_id` to `external_id` (generic).
- Rename `video_url` to `url` (generic).
- Rename `channel_url` to `url` (generic).
- Update foreign keys and related tables (`episode_tags`, `episode_events`).

### [Domain Models]
#### [MODIFY] [models.ts](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/lib/domain/models.ts)
- Rename [Video](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/lib/domain/models.ts#14-42) interface to `MediaEpisode`.
- Add `MediaType` enum.
- Update [Channel](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/lib/domain/models.ts#43-52) and `Episode` attributes to be generic.

### [Services]
#### [NEW] [podcast-metadata.service.ts](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/lib/services/podcast-metadata.service.ts)
- Integration with iTunes API to get the `feedUrl`.
- RSS parser to extract episode metadata (title, description, duration, artwork, enclosure).

#### [MODIFY] [youtube-metadata.service.ts](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/lib/services/youtube-metadata.service.ts)
- Update return types to match the new generic `MediaMetadata` interface.

#### [NEW] [metadata.service.factory.ts](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/lib/services/metadata.service.factory.ts)
- Detects if a URL is a YouTube link or a Podcast link and provides the appropriate service.

### [Repositories]
#### [MODIFY] [video.repository.ts](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/lib/repositories/video.repository.ts) (rename to `episode.repository.ts`)
- Update SQL queries to use the new table and column names.
- Handle different media types in filters.

### [UI Components]
#### [MODIFY] Components in `src/components/features/videos`
- Rename `VideoCard` to `MediaEpisodeCard`.
- Add media type icon/badge.
- Update labels (e.g., "Add Video" -> "Add Media").
- Add type filters to `FilterBar`.

## Verification Plan

### Automated Tests
- Unit tests for `PodcastMetadataService` with mocked iTunes API and RSS data.
- Integration tests for `EpisodeRepository` with both video and podcast data.
- Mocked URL detection in `MetadataServiceFactory`.

### Manual Verification
- Adding an Apple Podcast link (as provided in the example).
- Adding a regular YouTube link.
- Filtering by "Video" and "Podcast" types.
- Verifying the "Channel" is correctly created and associated for both.
