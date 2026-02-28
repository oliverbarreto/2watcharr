# Batch Channel Import API Endpoint

Create a new API endpoint to allow batch addition of channels/content with a specific tag, secured by an API token.

## Proposed Changes

### API Layer

#### [NEW] [route.ts](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/app/api/batch/add-channels/route.ts)
- Implement `POST /api/batch/add-channels`.
- Secure with `X-API-Token` header.
- Use Zod to validate input: `{ urls: string[], tag: string }`.
- Find or create the tag for the user.
- Loop through URLs and process them using [MediaService](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/lib/services/media.service.ts#15-409).
- Return a summary of successes and failures.

### Service Layer

#### [MODIFY] [youtube-metadata.service.ts](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/lib/services/youtube-metadata.service.ts)
- Update [extractMetadata](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/lib/services/metadata.service.ts#14-28) to handle channel URLs by adding `--playlist-items 1` to the `yt-dlp` command if it's a channel/playlist URL. This ensures we get at least one episode to associate the tag with.

#### [MODIFY] [media.service.ts](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/lib/services/media.service.ts)
- Add `batchAddFromUrls` method (optional, or just do it in the route). I'll keep it in the route for now to keep the service simpler, unless I see a benefit to moving it.

## Verification Plan

### Automated Tests
- Create a new test file `src/app/api/batch/add-channels/route.test.ts` (if possible to test Next.js routes easily here).
- Alternatively, add unit tests in [src/lib/services/media.service.test.ts](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/lib/services/media.service.test.ts) for batch processing logic.
- Run tests using `npm test` or `npx vitest`.

### Manual Verification
- Use `curl` or Postman to send a POST request to `/api/batch/add-channels` with a valid `X-API-Token`.
- Verify that channels and at least one episode for each are created and tagged in the database.
- Check the "Channels" and "Watch Later" tabs in the UI to see the newly added content.
