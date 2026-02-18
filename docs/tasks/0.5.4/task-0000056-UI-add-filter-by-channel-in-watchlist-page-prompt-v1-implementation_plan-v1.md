# Implementation Plan - Add Channel Filter & URL-based Filtering

This plan describes how to add a multi-channel filter to the watchlist page and refactor the filtering system to use URL search parameters as the source of truth, enabling reusable and shareable links.

## User Review Required

> [!IMPORTANT]
> This refactor will make all filters (search, status, tags, channels) visible in the URL. This enables browser back/forward buttons for filtering and allows sharing specific filtered views.

## Proposed Changes

### Domain Models

#### [MODIFY] [models.ts](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/lib/domain/models.ts)
- Update [EpisodeFilters](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/lib/domain/models.ts#137-148) interface to include `channelIds?: string[]`.

### Repository Layer

#### [MODIFY] [episode.repository.ts](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/lib/repositories/episode.repository.ts)
- Update [findAll](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/lib/repositories/episode.repository.ts#105-244) and [countAll](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/lib/repositories/episode.repository.ts#245-317) methods to support filtering by multiple `channelIds` (using SQL `IN` operator).

### API Layer

#### [MODIFY] [route.ts](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/app/api/episodes/route.ts)
- Update `GET /api/episodes` to parse `channels` query parameter (comma-separated string) and map it to `channelIds` in the filters object.

### UI Components

#### [MODIFY] [episode-list.tsx](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/components/features/episodes/episode-list.tsx)
- Add `onChannelsChange` prop to pass unique channels from currently loaded episodes back to the page.

#### [MODIFY] [filter-bar.tsx](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/components/features/episodes/filter-bar.tsx)
- Refactor to accept current filter values as props (making it more "controlled").
- Add a channel filter button that opens a `CommandDialog` (Spotlight-style):
    - Searchable list of available channels.
    - Checkboxes for multiple selection.
- When any filter changes, call `onFilterChange` which will eventually update the URL.

#### [MODIFY] [page.tsx](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/app/page.tsx)
- Use `searchParams` to derive the entire `filters` and `sort` state.
- Implement a `updateFilters` helper that uses `router.push` or `router.replace` to update the URL when filters change.
- Pass the derived filters to [FilterBar](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/components/features/episodes/filter-bar.tsx#46-351) and [EpisodeList](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/components/features/episodes/episode-list.tsx#49-293).
- Store and pass available channels (from [EpisodeList](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/components/features/episodes/episode-list.tsx#49-293)) to [FilterBar](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/components/features/episodes/filter-bar.tsx#46-351).

## Verification Plan

### Automated Tests
- Run existing tests: `npm test`

### Manual Verification
1.  **URL Sync**:
    - Change search, status, or select a tag/channel.
    - Verify the URL updates accordingly (e.g., `/?search=react&status=watched&tags=id1`).
    - Refresh the page and verify filters are restored.
    - Use the browser's Back button and verify the list updates.
2.  **Channel Filter**:
    - Test selecting multiple channels in the new Spotlight-style menu.
    - Verify the filtered results correctly display episodes from all selected channels.
3.  **Persistence**:
    - Copy the URL and open it in a new tab; it should show the same filtered list.
