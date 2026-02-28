# Implementation Plan - Clear Filters and Search

Add functionality to easily clear search queries and all active filters in both the watchlist and channels pages.

## Proposed Changes

### Episode Filter Bar
#### [MODIFY] [filter-bar.tsx](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/components/features/episodes/filter-bar.tsx)
- Import `XCircle` from `lucide-react`.
- Add a clear button (XCircle icon) inside the search input that appears when there is text in the search field.
- Add a "Clear All" button at the end of the filter buttons row.
- "Clear All" button will only be visible when any filter (search, status, tags, channels, favorites, or notes) is active.
- Implement `clearAllFilters` function to reset all filter states.

### Channel Filter Bar
#### [MODIFY] [channel-filter-bar.tsx](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/components/features/channels/channel-filter-bar.tsx)
- Import `XCircle` from `lucide-react`.
- Add a clear button (XCircle icon) inside the search input that appears when there is text in the search field.
- Add a "Clear All" button at the end of the filter buttons row.
- "Clear All" button will only be visible when any filter (search, type, or tags) is active.
- Implement `clearAllFilters` function to reset all filter states.

## Verification Plan

### Manual Verification
1.  **Watchlist Page**:
    -   Type something in the search box; verify the "X" button appears and clears the search when clicked.
    -   Apply various filters (Watched status, Tags, Channels, etc.).
    -   Verify the "Clear All" button appears at the right of the filters.
    -   Click "Clear All" and verify all filters (including search) are reset to their default states.
2.  **Channels Page**:
    -   Type something in the search box; verify the "X" button appears and clears the search when clicked.
    -   Apply various filters (Type, Tags).
    -   Verify the "Clear All" button appears.
    -   Click "Clear All" and verify all filters are reset.
