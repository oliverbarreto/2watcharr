# Bugfix: Priority Filter Not Working

The priority filter in the episode list is not working because the frontend doesn't correctly handle the `priority` filter state. Specifically, the home page doesn't extract it from the URL or update the URL when it changes, and the episode list component doesn't pass it to the backend API.

## Proposed Changes

### Frontend

#### [MODIFY] [page.tsx](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/app/page.tsx)
- Add `priority` to the [Filters](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/app/page.tsx#10-23) interface.
- Extract `priority` from search parameters in the `filters` memo.
- Update [updateFilters](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/app/page.tsx#116-135) to include the `priority` parameter when updating the URL.

#### [MODIFY] [episode-list.tsx](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/components/features/episodes/episode-list.tsx)
- Add `priority` to the `filters` in [EpisodeListProps](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/components/features/episodes/episode-list.tsx#31-54).
- Update `fetchEpisodes` to include the `priority` query parameter in the API request.
- Add `filters?.priority` to the `useEffect` dependency array that triggers data fetching.

## Verification Plan

### Automated Tests
- Run `npm run test` (if available) to ensure no regressions.
- I'll check for existing tests for filters.

### Manual Verification
- Open the application in the browser.
- Click the priority button (Gem icon) in the filter bar.
- Verify that the URL updates to include `?priority=high`.
- Verify that only high-priority episodes are shown.
- Refresh the page and verify that the priority filter remains active.
- Clear the filters and verify that the `priority` parameter is removed from the URL.
