# Implementation Plan - Batch Video Addition Endpoint

Add a new API endpoint `/api/shortcuts/add-videos` that allows adding multiple YouTube video URLs for a specific tag (or no tag) in a single request.

## Proposed Changes

### API Layer

#### [NEW] [route.ts](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/app/api/shortcuts/add-videos/route.ts)
- Implement [POST](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/app/api/shortcuts/add-episode/route.ts#22-123) handler for `/api/shortcuts/add-videos`.
- Implement `OPTIONS` handler for CORS preflight (reusing `handleOptions` from `@/lib/utils/cors`).
- Authentication: Support both session-based and `X-API-Token` based authentication.
- Request Body Validation:
  ```typescript
  const addVideosSchema = z.array(z.object({
      url: z.string().url('Invalid URL'),
      tag: z.string().optional(),
  }));
  ```
- Processing Logic:
  - Iterate through the provided URLs.
  - Validate that each URL is a YouTube video/short URL (reject channels/podcasts as per requirements).
  - Use `MediaService.addEpisodeFromUrl` for each valid URL.
  - Collect success/failure status and reason for each URL.
- Response:
  - Detailed report for each URL: `{ url, status: 'OK' | 'NOK', reason?: string }`.

## Verification Plan

### Automated Tests
- Create a new test file `src/app/api/shortcuts/add-videos/route.test.ts` (if possible, or a standalone test script) to verify:
    - Successful addition of multiple URLs.
    - Handling of invalid URLs (e.g., non-YouTube, channel URLs).
    - Handling of missing/invalid API Token.
    - Correct tag association.

### Manual Verification
- Test with a set of 3 YouTube URLs (mix of valid videos and one invalid/channel URL) using `curl`.
- Verify in the UI that the episodes are added and tagged correctly.
