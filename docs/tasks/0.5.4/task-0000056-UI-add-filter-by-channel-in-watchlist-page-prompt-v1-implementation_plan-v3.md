# Plan: Fix Infinite Loop and Add Verification Tests

The application is currently stuck in an infinite loop of API calls on the watchlist page. This is caused by non-memoized filter/sort objects in [page.tsx](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/app/page.tsx) triggering re-renders in [EpisodeList](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/components/features/episodes/episode-list.tsx#49-293), which then updates parent state via `onChannelsChange`, causing another re-render.

## Proposed Changes

### Watchlist Page [src/app/page.tsx](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/app/page.tsx)
- [MODIFY] Memoize `filters` and `sort` objects using `useMemo` to ensure stable references unless `searchParams` actually change.
- [MODIFY] Ensure `handleCountChange` uses functional updates to avoid dependency on its own state.

### Episode List Component [src/components/features/episodes/episode-list.tsx](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/components/features/episodes/episode-list.tsx)
- [MODIFY] Update `fetchEpisodes` `useCallback` dependencies. Use primitive values (like `JSON.stringify(filters)`) or individual properties to avoid re-creating the function on every render.
- [MODIFY] Add a deep comparison check before calling `onChannelsChange` to avoid triggering parent re-renders when the data hasn't changed.
- [MODIFY] Clean up the `useEffect` that triggers `fetchEpisodes` to ensure it only runs when necessary.

## Verification Plan

### Automated Tests
- Create a browser-based test script (using the browser subagent) that:
    1. Loads the watchlist page.
    2. Monitors network requests for 5-10 seconds.
    3. Asserts that the number of `/api/episodes` calls is minimal (ideally 1 on load, plus 1 per filter change).
    4. Navigates to Channels and back to verify no regression.

### Manual Verification
- Verify that filtering by search, tags, and channels still works correctly.
- Verify that infinite scroll still works.
- Verify that the total count and available channels are correctly updated in the UI.
