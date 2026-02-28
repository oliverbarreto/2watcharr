# Plan - Shortcut API Simplification and CORS Refinement

The goal is to consolidate the shortcut API endpoints, removing code duplication between [/api/shortcuts/add-episode](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/app/api/shortcuts/add-episode) and [/api/shortcuts/add-video](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/app/api/shortcuts/add-video), and to clarify CORS configurations for production.

## User Review Required

> [!IMPORTANT]
> I am proposing to make [/api/shortcuts/add-video](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/app/api/shortcuts/add-video) a simple alias (re-export) of [/api/shortcuts/add-episode](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/app/api/shortcuts/add-episode). This avoids duplicated logic while maintaining compatibility for any existing iOS Shortcuts.

## Proposed Changes

### [Shortcut API Consolidation]

#### [MODIFY] [add-video/route.ts](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/app/api/shortcuts/add-video/route.ts)
- Replace implementation with re-exports from [add-episode/route.ts](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/app/api/shortcuts/add-episode/route.ts).
- This ensures both endpoints share the exact same logic and CORS handling.

#### [MODIFY] [api.md](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/docs/documentation/api.md)
- Update documentation to favor [/api/shortcuts/add-episode](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/app/api/shortcuts/add-episode) as the primary endpoint.
- Mark [/api/shortcuts/add-video](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/app/api/shortcuts/add-video) as a legacy alias.

### [CORS Refinement]

#### [MODIFY] [cors.ts](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/lib/utils/cors.ts)
- I will keep the `ALLOWLIST` as is for now. 
- > [!NOTE]
  > You do **not** need to add the production URL of the 2watcharr app (`https://2watcharr.oliverbarreto.com`) to the allowlist. CORS origins are based on the *sender* (the browser extension), not the receiver (the API server).

## Verification Plan

### Automated Tests
- Use `curl` to verify both endpoints return identical CORS headers and handle requests correctly.

### Manual Verification
- Verify the browser extension works with [/api/shortcuts/add-episode](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/app/api/shortcuts/add-episode).
- (Optional) Verify an iOS Shortcut still works with [/api/shortcuts/add-video](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/app/api/shortcuts/add-video).
