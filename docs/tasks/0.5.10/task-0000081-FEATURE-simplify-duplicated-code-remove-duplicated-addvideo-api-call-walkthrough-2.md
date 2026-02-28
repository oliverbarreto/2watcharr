# Walkthrough - CORS Support for Browser Extension

I have implemented CORS support for the shortcut API endpoints to allow the 2watcharr browser extension to add episodes and videos directly from the browser.

## Changes Made

### [Shortcut API]

#### [NEW] [cors.ts](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/lib/utils/cors.ts)
- Created a centralized utility to handle CORS preflight (`OPTIONS`) and generate headers.
- Included an allowlist for `localhost:3000` and common extension origins.

#### [MODIFY] [add-episode/route.ts](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/app/api/shortcuts/add-episode/route.ts)
- Added `OPTIONS` handler using the new utility.
- Updated [POST](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/app/api/shortcuts/add-episode/route.ts#22-123) handler to include CORS headers in all responses (success and error).

#### [DELETE] [add-video/route.ts](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/app/api/shortcuts/add-video/route.ts)
- Removed the redundant endpoint entirely to eliminate code duplication.

#### [MODIFY] [api.md](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/docs/documentation/api.md)
- Updated documentation to remove references to [add-video](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/app/api/shortcuts/add-video) and focus on [add-episode](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/app/api/shortcuts/add-episode) for both iOS Shortcuts and Browser Extensions.

## Verification Results

### Preflight (OPTIONS) Verification
Successfully handled preflight requests with 204 No Content and appropriate CORS headers.

```bash
curl -i -X OPTIONS http://localhost:3000/api/shortcuts/add-episode \
  -H "Origin: http://localhost:3000" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: content-type, x-api-token, authorization"
```

**Output:**
```
HTTP/1.1 204 No Content
access-control-allow-headers: Content-Type, X-API-Token, Authorization
access-control-allow-methods: POST, OPTIONS
access-control-allow-origin: http://localhost:3000
access-control-max-age: 86400
```

### Actual Request (POST) Verification
Confirmed that CORS headers are included in the POST response, even when unauthorized.

```bash
curl -i -X POST http://localhost:3000/api/shortcuts/add-episode \
  -H "Origin: http://localhost:3000" \
  -H "Content-Type: application/json" \
  -H "X-API-Token: invalid-token" \
  -d '{"url":"https://example.com"}'
```

**Output:**
```
HTTP/1.1 401 Unauthorized
access-control-allow-origin: http://localhost:3000
...
{"success":false,"error":"Invalid API Token"}
```

> [!NOTE]
> I used a placeholder extension ID in the allowlist. If the extension origin differs, the `ALLOWLIST` in [cors.ts](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/lib/utils/cors.ts) will need to be updated.
