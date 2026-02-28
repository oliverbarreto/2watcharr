# Add Type Filters to Watchlist

Add filters for Content Type (Video, Shorts, Podcast) to the watchlist page to allow users to completely filter by these criteria.

## Proposed Changes

### Backend Repository

#### [MODIFY] [episode.repository.ts](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/lib/repositories/episode.repository.ts)
- Update [findAll](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/lib/repositories/episode.repository.ts#106-259) to handle `isShort` filter.
- Update [countAll](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/lib/repositories/episode.repository.ts#260-346) to handle `isShort` filter.

### API Layer

#### [MODIFY] [route.ts](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/app/api/episodes/route.ts)
- Extract `isShort` from query parameters (handle "true" and "false" strings).
- Pass `isShort` to `mediaService.listEpisodes`.

### Frontend Components

#### [MODIFY] [page.tsx](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/app/page.tsx)
- Update [Filters](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/app/page.tsx#10-20) interface to include `isShort` and `type`.
- Update [updateFilters](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/app/page.tsx#109-125) to sync these new parameters with the URL.
- Update [HomePageContent](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/app/page.tsx#26-208) to parse `type` and `isShort` from search params.

#### [MODIFY] [filter-bar.tsx](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/components/features/episodes/filter-bar.tsx)
- Update [FilterBarProps](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/components/features/episodes/filter-bar.tsx#32-58) to include `type` and `isShort`.
- Implement state and UI for type filters:
    - Video: Filter by `type: 'video'`, `isShort: false`
    - Shorts: Filter by `isShort: true`
    - Podcast: Filter by `type: 'podcast'`
- Add icons to the right of the tag filter button.
- Ensure horizontal scrolling works on mobile for the new buttons.

## Verification Plan

### Automated Tests
- No existing automated tests for filters found in `src/`. I will verify manually using the browser.

### Manual Verification
1.  **Desktop**: 
    - Open the watchlist page.
    - Click the "Video" icon. Verify only non-short videos are shown.
    - Click the "Shorts" icon. Verify only YouTube Shorts are shown.
    - Click the "Podcast" icon. Verify only podcasts are shown.
    - Verify that clicking an active filter deactivates it.
    - Verify that filters are reflected in the URL.
2.  **Mobile**:
    - Use browser devtools to simulate a mobile device.
    - Verify that the new icons are visible in the horizontal scrolling filter bar.
    - Verify that they are placed to the right of the tag filter button.
