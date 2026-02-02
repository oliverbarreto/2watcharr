# Walkthrough: Fix Channel Metadata Sync

I have fixed the issue where syncing channel metadata would fail with a generic error message. The fix involved improving both the frontend error handling and the backend robustness.

## Changes Made

### 1. Improved UI Permissions and Error Handling
- The "Sync Metadata" button in [channels/page.tsx](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/app/channels/page.tsx) is now only visible to administrators.
- Added specific handling for `401 Unauthorized` errors in the frontend to give clear feedback.
- The UI now displays the actual error message returned by the API instead of a generic one.

### 2. Enhanced yt-dlp Robustness
- In [youtube-metadata.service.ts](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/lib/services/youtube-metadata.service.ts), I increased the `maxBuffer` for the `yt-dlp` command to 10MB. Large channels with many videos can produce JSON metadata that exceeds the default 200KB buffer, which was a likely cause of some failures.

### 3. Safer Sync Loop
- Updated `MediaService.syncAllChannelsMetadata` in [media.service.ts](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/lib/services/media.service.ts) to validate that a channel has a URL before attempting to sync it.
- Enabled dependency injection for [MetadataService](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/lib/services/metadata.service.ts#5-56) in [MediaService](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/lib/services/media.service.ts#13-303) to allow for better unit testing.

### 4. Better API Error Reporting
- The sync API route in [channels/sync/route.ts](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/app/api/channels/sync/route.ts) now returns the detailed error message in the response body, which is then picked up by the UI.

## Verification Results

### Automated Tests
I created a new test suite [media-sync.test.ts](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/lib/services/media-sync.test.ts) that verifies:
- Metadata is correctly updated for video channels.
- Podcast channels are skipped as intended.
- Missing metadata is handled gracefully without failing the entire sync.
- Errors in individual channels do not stop the synchronization of other channels.

All tests passed successfully:
```bash
vitest run src/lib/services/media-sync.test.ts
```

### Manual Verification
- Verified that the "Sync Metadata" button is only shown if `session.user.isAdmin` is true.
- Verified that API errors are now propagated to the UI toast messages.
