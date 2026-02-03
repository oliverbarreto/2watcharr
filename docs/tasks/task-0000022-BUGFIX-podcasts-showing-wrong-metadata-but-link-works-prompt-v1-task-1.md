# Task: Fix Podcast Episode Metadata Retrieval

## Problem
- [x] Understand the bug: When adding a podcast from an Apple Podcasts URL with an episode ID (e.g., `?i=1000746445714`), the system retrieves metadata for the latest episode instead of the specific episode
- [x] Investigate iTunes API capabilities for episode-specific lookups
- [x] Test the RSS feed matching logic

## Solution
- [x] Discovered the correct approach: Query iTunes API with podcast ID and `entity=podcastEpisode`, then filter by episode `trackId`
- [ ] Update [podcast-metadata.service.ts](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/lib/services/podcast-metadata.service.ts) to use iTunes API for episode lookup when episode ID is present
- [ ] Fall back to RSS feed approach only when no episode ID is provided
- [ ] Test with the provided example URL

## Verification
- [ ] Verify the fix works with the example URL
- [ ] Ensure the correct episode metadata is retrieved
- [ ] Run existing tests if available
