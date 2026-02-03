# Fix Podcast Episode Metadata Retrieval

## Problem

When adding a podcast from an Apple Podcasts URL with an episode ID parameter (e.g., `https://podcasts.apple.com/es/podcast/tom-bilyeus-impact-theory/id1191775648?i=1000746445714`), the system retrieves metadata for the **latest episode** in the channel instead of the **specific episode** referenced in the URL.

**Root Cause**: The current implementation in [podcast-metadata.service.ts](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/lib/services/podcast-metadata.service.ts) attempts to match the episode ID from the URL (`?i=` parameter) against the RSS feed's `guid`, `link`, or `enclosure.url` fields. This matching logic fails because the iTunes episode ID doesn't directly correspond to these RSS fields. When no match is found, the code falls back to using the latest episode (first item in the RSS feed).

## Proposed Changes

### [MODIFY] [podcast-metadata.service.ts](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/lib/services/podcast-metadata.service.ts)

Update the [extractMetadata](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/lib/services/metadata.service.ts#14-28) method to use the iTunes API for episode-specific lookups when an episode ID is present:

1. **When episode ID is present**: Query the iTunes API with `entity=podcastEpisode` to get all episodes for the podcast, then filter by the episode's `trackId` (which matches the `?i=` parameter)
2. **When episode ID is absent**: Fall back to the current RSS feed approach (use the latest episode)
3. **Preserve channel metadata**: Continue using the iTunes API lookup for channel information as currently implemented

**Key changes**:
- Add a new method `fetchEpisodeFromItunes(podcastId: string, episodeId: string)` to query iTunes API with `entity=podcastEpisode` and filter results
- Update [extractMetadata](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/lib/services/metadata.service.ts#14-28) to call this new method when `episodeId` is present
- Keep the RSS feed parsing as a fallback for when no episode ID is provided or when the iTunes lookup fails

## Verification Plan

### Automated Tests

No existing tests were found for [podcast-metadata.service.ts](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/lib/services/podcast-metadata.service.ts). The existing test files in the codebase are:
- [lib/repositories/episode.repository.test.ts](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/lib/repositories/episode.repository.test.ts)
- [lib/services/media-sync.test.ts](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/lib/services/media-sync.test.ts)
- [lib/services/media.service.filter.test.ts](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/lib/services/media.service.filter.test.ts)
- [lib/services/media.service.sync.test.ts](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/lib/services/media.service.sync.test.ts)
- [lib/services/media.service.test.ts](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/lib/services/media.service.test.ts)

### Manual Verification

1. **Start the development server**:
   ```bash
   npm run dev
   ```

2. **Test with the specific URL from the bug report**:
   - Navigate to the "Add Podcast" feature in the application
   - Enter the URL: `https://podcasts.apple.com/es/podcast/tom-bilyeus-impact-theory/id1191775648?i=1000746445714`
   - Verify the retrieved metadata matches:
     - **Title**: "How Japan's Broken Bond Market Is Threatening Your Wealth—What You Must Know"
     - **Publish Date**: January 24, 2026 (24 ENE)
     - **Channel**: "Tom Bilyeu's Impact Theory"
     - **URL stored**: `https://podcasts.apple.com/es/podcast/tom-bilyeus-impact-theory/id1191775648?i=1000746445714`

3. **Test without episode ID** (to ensure fallback works):
   - Enter a podcast channel URL without the `?i=` parameter
   - Verify it retrieves the latest episode from the RSS feed

4. **Test with another podcast URL** (to ensure general functionality):
   - Enter: `https://podcasts.apple.com/es/podcast/moonshots-with-peter-diamandis/id1648228034?i=1000747203082`
   - Verify correct episode metadata is retrieved
