# Bug Fixes: Build & Runtime Issues

## Overview
Tracking and resolving critical bugs that prevent the application from building or running correctly.

## Status: Ongoing

## Resolved Bugs
- [x] **"Failed to fetch videos" Runtime Error**
    - **Description:** Error in `video-list.tsx` when fetching data, causing the watch list to be empty or crash.
    - **Fix:** Fixed the API endpoint response handling and ensured data exists before mapping.
- [x] **Build Failures (Next.js/TS)**
    - **Description:** `npm run build` failing due to type mismatches or server-side hydration issues.
    - **Fix:** Corrected types and ensured client-side data fetching happens after hydration.
- [x] **Metadata Extraction Issues**
    - **Description:** Some YouTube videos failing to extract metadata correctly.
    - **Fix:** Updated `yt-dlp` calls and added better error handling for private/unavailable videos.

## Known Issues
- [ ] **Large Database Performance**
    - **Description:** Slow filtering when the database contains thousands of videos.
    - **Status:** Investigating indexing strategies.
