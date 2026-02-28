# Plan - CORS Support for Browser Extension

The goal is to allow the 2watcharr browser extension (Chrome/Firefox) to call the [/api/shortcuts/add-episode](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/app/api/shortcuts/add-episode) and [/api/shortcuts/add-video](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/app/api/shortcuts/add-video) endpoints. Currently, these requests fail because they trigger a CORS preflight (`OPTIONS`) which the server doesn't handle.

## Proposed Changes

### [Shortcut API]

#### [MODIFY] [add-episode/route.ts](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/app/api/shortcuts/add-episode/route.ts)
- Add `OPTIONS` handler to return CORS headers.
- Update [POST](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/app/api/shortcuts/add-video/route.ts#16-114) handler to return CORS headers.
- Implement origin allowlist including local development and extension origins.

#### [MODIFY] [add-video/route.ts](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/app/api/shortcuts/add-video/route.ts)
- Same changes as above.
- > [!NOTE]
  > These two endpoints are currently redundant (both call `mediaService.addEpisodeFromUrl`). I will apply the CORS fixes to both to match existing functionality.

#### [NEW] [cors.ts](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/lib/utils/cors.ts) (Optional but recommended)
- Centralize CORS logic to avoid duplication between [add-episode](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/app/api/shortcuts/add-episode) and [add-video](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/app/api/shortcuts/add-video).

## Verification Plan

### Automated Tests
- Since there are no existing route tests for these endpoints, I will verify using `curl` to simulate preflight and POST requests with CORS headers.

```bash
# Test OPTIONS (Preflight)
curl -i -X OPTIONS http://localhost:3000/api/shortcuts/add-episode \
  -H "Origin: chrome-extension://<EXTENSION_ID>" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: content-type, x-api-token, authorization"

# Test POST (Actual request)
curl -i -X POST http://localhost:3000/api/shortcuts/add-episode \
  -H "Origin: chrome-extension://<EXTENSION_ID>" \
  -H "Content-Type: application/json" \
  -H "X-API-Token: <YOUR_TOKEN>" \
  -d '{"url":"https://example.com/video","tag":"test"}'
```

### Manual Verification
- User to test with the actual browser extension after implementation.
