# Fix Icon Overlap on Episode Card Thumbnails

The Priority, Favorite, and Note indicators on the episode card thumbnails are currently overlapping because they are all absolutely positioned at `top-2 left-2`. This plan will group them into a single flex container to place them side-by-side.

## Proposed Changes

### [Component] episodes

#### [MODIFY] [episode-card.tsx](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/components/features/episodes/episode-card.tsx)
- Wrap the existing Note and Priority indicators in a single `div` with `absolute top-2 left-2 z-10 flex items-center gap-1.5`.
- Add a Favorite indicator (Star icon) to this group.
- Ensure the order is: Priority (if exists), then Favorite (if exists), then Notes (if exists).
- Apply a `drop-shadow-md` to the entire container for better visibility on various thumbnails.

### [Component] layout/pages

#### [MODIFY] [page.tsx](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/app/page.tsx)
#### [MODIFY] [channels/page.tsx](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/app/channels/page.tsx)
- Update the floating panel's container class in both files:
    - Change `bg-background` to `bg-background/60 backdrop-blur-md`.
    - Reduce bottom padding: change `p-4` to `pt-10 px-4 pb-2`.

## Verification Plan

### Automated Tests
- Use the browser subagent to:
    1. Navigate to the Watch Later page.
    2. Open the filter panel and verify it has a blurred, transparent background and compact bottom padding.
    3. Find an episode with multiple indicators (e.g., Priority and Notes).
    4. Verify that the icons are displayed side-by-side and not overlapping.
    5. Verify the order: Priority first, then Favorite, then Notes.
 Vinc
### Manual Verification
- Resize the browser to check if the icons remain side-by-side on smaller screen sizes.
