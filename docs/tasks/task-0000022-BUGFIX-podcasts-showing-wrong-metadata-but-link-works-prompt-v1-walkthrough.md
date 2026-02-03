# Podcast Episode Metadata Fix - Walkthrough

## Problem Summary

When adding a podcast from an Apple Podcasts URL with an episode ID parameter (e.g., `?i=1000746445714`), the system was retrieving metadata for the **latest episode** in the channel instead of the **specific episode** referenced in the URL.

## Root Cause

The original implementation in [podcast-metadata.service.ts](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/lib/services/podcast-metadata.service.ts) attempted to match the episode ID from the URL against the RSS feed's `guid`, `link`, or `enclosure.url` fields. This matching logic failed because the iTunes episode ID doesn't directly correspond to these RSS fields, causing the code to fall back to using the latest episode.

## Solution Implemented

### 1. Updated Podcast Metadata Service

Modified [podcast-metadata.service.ts](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/lib/services/podcast-metadata.service.ts#L16-L149) to use the iTunes API for episode-specific lookups:

**Key Changes**:
- Added new method [fetchEpisodeFromItunes()](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/lib/services/podcast-metadata.service.ts#91-142) that queries the iTunes API with `entity=podcastEpisode` and filters results by `trackId`
- Updated [extractMetadata()](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/lib/services/podcast-metadata.service.ts#16-90) to call this method when an episode ID is present in the URL
- Maintained RSS feed parsing as a fallback for when no episode ID is provided

**How it works**:
1. When an episode ID is present (the `?i=` parameter), the service queries: `https://itunes.apple.com/lookup?id={podcastId}&entity=podcastEpisode&limit=200`
2. Filters the results to find the episode where `trackId` matches the episode ID from the URL
3. Maps the iTunes episode data to the application's episode DTO format
4. Falls back to RSS feed (latest episode) if the iTunes lookup fails or no episode ID is provided

### 2. Fixed Local Development Database Configuration

**Issue**: The [.env](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/.env) file was configured with `DATABASE_PATH=/app/data/2watcharr.db` (Docker container path), which doesn't exist when running `npm run dev` locally, causing `SQLITE_CANTOPEN` errors.

**Fix**: Updated [.env](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/.env#L11-L12) to use `DATABASE_PATH=./data/2watcharr.db` for local development.

## Verification

### Test Case

**URL**: `https://podcasts.apple.com/es/podcast/tom-bilyeus-impact-theory/id1191775648?i=1000746445714`

**Expected Metadata**:
- Title: "How Japan's Broken Bond Market Is Threatening Your Wealth—What You Must Know"
- Publish Date: January 24, 2026
- Channel: "Tom Bilyeu's Impact Theory"

### Results

✅ **Success** - The application correctly retrieved the specific episode metadata:

![Podcast Metadata Verification](file:///Users/oliver/.gemini/antigravity/brain/0dc19a34-81f0-4376-8f8f-e53ce44f86f8/podcast_metadata_verification_1770122116066.png)

The screenshot shows the podcast episode was added to the Watch Later list with:
- ✅ Correct title: "How Japan's Broken Bond Market Is Threatening Your Wealth—What You Must..."
- ✅ Correct channel: "Tom Bilyeu's Impact Theory"
- ✅ Correct date: "10 days ago" (January 24, 2026)

### Browser Testing Recording

The complete testing process was recorded:

![Testing Process](file:///Users/oliver/.gemini/antigravity/brain/0dc19a34-81f0-4376-8f8f-e53ce44f86f8/podcast_fix_verification_1770122077738.webp)

## Files Changed

- [src/lib/services/podcast-metadata.service.ts](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/lib/services/podcast-metadata.service.ts) - Implemented iTunes API-based episode lookup
- [.env](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/.env) - Updated database path for local development

## Impact

- ✅ Users can now add specific podcast episodes using Apple Podcasts URLs with episode IDs
- ✅ The correct episode metadata (title, date, description) is retrieved instead of the latest episode
- ✅ Local development with `npm run dev` now works without database errors
- ✅ Maintains backward compatibility - RSS feed fallback still works when no episode ID is provided
