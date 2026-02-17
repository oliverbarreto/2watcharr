# Fix Manual Reordering in Watchlist

## Goal
Restore manual drag-and-drop reordering in the watchlist page, ensuring that "Manual" (custom) sorting mode uses a flat list without date sections, while date-based sorts continue to use grouped sections.

## Proposed Changes

### [Component] [EpisodeList](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/components/features/episodes/episode-list.tsx)
- Conditionally render [GroupedEpisodeList](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/components/features/episodes/grouped-episode-list.tsx#18-76) only for date-based sorts.
- For "Manual" (custom) sort, render a flat list wrapped in `DndContext` and `SortableContext`.
- Restore the `rectSortingStrategy` or `verticalListSortingStrategy` based on view mode.

### [Utility] [date-grouping.ts](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/lib/utils/date-grouping.ts)
- (Optional) Export a helper to identify manual sort if needed, or just check `sortField === 'custom'`.

## Verification Plan

### Automated Tests
- N/A (UI focused)

### Manual Verification
1. Switch to "Manual" sort mode in the Watchlist.
2. Verify that date sections (Today, Yesterday, etc.) disappear and a flat list is shown.
3. Drag and drop an episode to a new position.
4. Refresh the page and verify the new order is preserved.
5. Switch to "Date Added" sort mode and verify that date sections reappear.
6. Verify that drag and drop is disabled or doesn't persist in date-grouped mode (as it's strictly chronological).
