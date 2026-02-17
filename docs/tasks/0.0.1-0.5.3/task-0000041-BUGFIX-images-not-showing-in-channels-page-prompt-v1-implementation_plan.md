# Local Thumbnail Storage Implementation

## Problem

Channel thumbnails are currently stored as external URLs (from YouTube and Apple Podcasts). These URLs can fail intermittently due to:
- Network connectivity issues
- Rate limiting from external services
- CORS restrictions
- Temporary service outages
- URL expiration

This causes thumbnails to disappear randomly and then reappear later, creating a poor user experience.

## Proposed Solution

Implement a local thumbnail storage system that:
1. Downloads thumbnails when channels are created or synced
2. Stores them in the `public/thumbnails/` directory
3. Updates the database to reference local paths instead of external URLs
4. Provides fallback to external URLs if download fails
5. Migrates existing channels to use local thumbnails

## User Review Required

> [!IMPORTANT]
> **Storage Location**: Thumbnails will be stored in `public/thumbnails/channels/` directory. This will increase disk usage but provide reliable thumbnail display.

> [!IMPORTANT]
> **Migration Strategy**: Existing channels will have their thumbnails downloaded during the next sync operation or via a one-time migration script. There may be a brief period where old channels still use external URLs until migrated.

## Proposed Changes

### Core Services

#### [NEW] [thumbnail.service.ts](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/lib/services/thumbnail.service.ts)

Create a new service to handle thumbnail downloads:
- `downloadThumbnail(url: string, channelId: string, type: 'channel' | 'episode'): Promise<string | null>` - Downloads thumbnail and returns local path
- `getThumbnailPath(channelId: string, type: 'channel' | 'episode'): string` - Generates local path for thumbnail
- `deleteThumbnail(path: string): Promise<void>` - Removes local thumbnail file
- Uses `fetch` to download images
- Handles errors gracefully with fallback to original URL
- Creates directory structure if it doesn't exist
- Supports common image formats (jpg, png, webp)

---

### Metadata Services

#### [MODIFY] [youtube-metadata.service.ts](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/lib/services/youtube-metadata.service.ts)

Update [extractChannelMetadata](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/lib/services/metadata.service.ts#29-41) method:
- Accept optional `ThumbnailService` instance
- After extracting thumbnail URL, download it locally
- Return local path in `thumbnailUrl` field if download succeeds
- Keep external URL as fallback if download fails

#### [MODIFY] [podcast-metadata.service.ts](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/lib/services/podcast-metadata.service.ts)

Update [extractMetadata](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/lib/services/podcast-metadata.service.ts#16-90) method:
- Accept optional `ThumbnailService` instance
- After extracting thumbnail URL from iTunes, download it locally
- Return local path in `thumbnailUrl` field if download succeeds
- Keep external URL as fallback if download fails

#### [MODIFY] [metadata.service.ts](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/lib/services/metadata.service.ts)

Update constructor and methods:
- Inject `ThumbnailService` instance
- Pass it to YouTube and Podcast metadata services
- Coordinate thumbnail downloads during metadata extraction

---

### Media Service

#### [MODIFY] [media.service.ts](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/lib/services/media.service.ts)

Update [syncChannelMetadata](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/lib/services/media.service.ts#310-326) method:
- Ensure thumbnail is downloaded when syncing
- Handle cases where thumbnail download fails

Update [addEpisodeFromUrl](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/lib/services/media.service.ts#26-117) method:
- Ensure channel thumbnail is downloaded when creating new channels

---

### Database & Repository

#### [MODIFY] [channel.repository.ts](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/lib/repositories/channel.repository.ts)

No changes needed - the repository already handles `thumbnailUrl` as a string, which can be either a local path or external URL.

---

### API Endpoints

#### [NEW] [migrate-thumbnails/route.ts](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/app/api/channels/migrate-thumbnails/route.ts)

Create a new endpoint to migrate existing channels:
- `POST /api/channels/migrate-thumbnails`
- Fetches all channels with external thumbnail URLs
- Downloads thumbnails locally
- Updates database with local paths
- Returns migration statistics (success/failure counts)
- Requires authentication

---

### Directory Structure

Create the following directory structure:
```
public/
  thumbnails/
    channels/
      {channelId}.{ext}
```

## Verification Plan

### Automated Tests

#### Unit Tests for Thumbnail Service

Create `src/lib/services/thumbnail.service.test.ts`:
```bash
npm run test src/lib/services/thumbnail.service.test.ts
```

Test cases:
- Successfully downloads and saves thumbnail
- Handles network errors gracefully
- Creates directory structure if missing
- Returns null on failure
- Generates correct file paths

#### Integration Tests for Metadata Services

Update existing test files:
- [src/lib/services/media.service.sync.test.ts](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/lib/services/media.service.sync.test.ts) - verify thumbnails are downloaded during sync
- [src/lib/services/media.service.test.ts](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/lib/services/media.service.test.ts) - verify thumbnails are downloaded when adding episodes

```bash
npm run test src/lib/services/media.service.sync.test.ts
npm run test src/lib/services/media.service.test.ts
```

### Manual Verification

1. **Test New Channel Creation**:
   - Start the dev server: `npm run dev`
   - Navigate to `http://localhost:3000`
   - Add a new YouTube channel
   - Verify thumbnail appears immediately
   - Check `public/thumbnails/channels/` directory for downloaded file
   - Verify database contains local path (e.g., `/thumbnails/channels/{id}.jpg`)

2. **Test Sync Metadata**:
   - Use the "Sync Metadata" button on an existing channel
   - Verify thumbnail is downloaded and updated
   - Check that the image displays correctly

3. **Test Migration Endpoint**:
   - Call `POST /api/channels/migrate-thumbnails`
   - Verify all existing channels have local thumbnails
   - Check response for migration statistics

4. **Test Fallback Behavior**:
   - Temporarily disable network or use invalid URL
   - Verify system falls back to external URL
   - Verify no errors are thrown
