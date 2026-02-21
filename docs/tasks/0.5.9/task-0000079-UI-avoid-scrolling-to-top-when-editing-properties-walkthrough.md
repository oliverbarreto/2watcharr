# Walkthrough: Prevent scroll-to-top when saving episode properties

I have implemented a fix to prevent the watchlist page from scrolling to the top after an episode's properties (like "Like", "Priority", or tags) are updated.

## Changes Made

### [Episodes Component]

#### [episode-list.tsx](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/components/features/episodes/episode-list.tsx)
- Introduced a `silent` mode in the `fetchEpisodes` function.
- Updated [handleUpdate](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/components/features/episodes/episode-list.tsx#231-232) to use this silent mode.
- This ensures that updating an episode status no longer triggers the full-page skeleton loader, which was causing the DOM to be replaced and the scroll position to be lost.

## Verification Results

### Manual Verification
1. **Initial Load**: Verified that the skeleton loader still appears on the first page load to provide visual feedback.
2. **Scroll Persistence**:
    - Scrolled down to the middle of the watchlist.
    - Toggled "Like" status on an episode.
    - Verified that the status updated and the page stayed exactly where it was.
    - Toggled "Priority" and "Tags".
    - Verified that in all cases, the scroll position remained stable.
3. **View Modes**: Confirmed the fix works correctly in both Grid and List view modes.
