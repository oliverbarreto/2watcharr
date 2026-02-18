# Implementation Plan - Add Channel Filter & App-wide URL-based Filtering

This plan describes how to add a multi-channel filter to the watchlist page and refactor the filtering system to use URL search parameters as the source of truth across the entire application (Watchlist, Channels, and Channel Details pages).

## User Review Required

> [!IMPORTANT]
> This refactor will make all filters (search, status, tags, channels) visible in the URL throughout the app. This enables browser back/forward buttons for filtering and allows sharing specific filtered views.

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

### UI Components (Watchlist Page)

#### [MODIFY] [episode-list.tsx](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/components/features/episodes/episode-list.tsx)
- Add `onChannelsChange` prop to pass unique channels from currently loaded episodes back to the page.

#### [MODIFY] [filter-bar.tsx](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/components/features/episodes/filter-bar.tsx)
- Refactor to accept current filter values as props (controlled component).
- Add a channel filter button that opens a `CommandDialog` (Spotlight-style):
    - Searchable list of available channels.
    - Checkboxes for multiple selection.
- Call `onFilterChange` when any filter changes.

#### [MODIFY] [page.tsx](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/app/page.tsx)
- Use `searchParams` to derive filters and sort state.
- Implement `updateFilters` to update the URL when filters change.
- Pass available channels from [EpisodeList](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/components/features/episodes/episode-list.tsx#49-293) to [FilterBar](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/components/features/episodes/filter-bar.tsx#46-351).

### UI Components (Channels Page)

#### [MODIFY] [channel-filter-bar.tsx](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/components/features/channels/channel-filter-bar.tsx)
- Refactor to accept current filter values as props (controlled component).

#### [MODIFY] [page.tsx](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/app/channels/page.tsx)
- Refactor to use `searchParams` as the source of truth for filters (`search`, `type`, `tagIds`).
- Sync filter changes to the URL using Next.js router.

### UI Components (Channel Details Page)

#### [MODIFY] [page.tsx](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/app/channels/[id]/page.tsx)
- Refactor to use `searchParams` as the source of truth for episode filters (specifically `tagIds` which is currently used on this page).
- Sync filter changes to the URL.

## Verification Plan

### Automated Tests
- Run existing tests: `npm test`

### Manual Verification
1.  **Watchlist URL Sync**:
    - Select channels, tags, and status. Verify URL updates and refresh persists state.
2.  **Channels Page URL Sync**:
    - Filter by type and search. Verify URL updates and refresh persists state.
3.  **Channel Details URL Sync**:
    - Filter episodes by tag within a channel. Verify URL updates.
4.  **Browser Navigation**:
    - Verify Back/Forward buttons work correctly for filtering across all three pages.
