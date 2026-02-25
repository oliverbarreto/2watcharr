# Implement Like/Dislike/Meh Cycling Button in List View

Add a single button to the episode list row that cycles through three states: Meh (empty), Like, and Dislike.

## Proposed Changes

### [Component Name] Episodes Component

#### [MODIFY] [episode-list-row.tsx](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/components/features/episodes/episode-list-row.tsx)

- Add `ThumbsUp` and `ThumbsDown` to imports from `lucide-react`.
- Add local state `likeStatus` to track the state (synced with `episode.likeStatus`).
- Implement `handleCycleLikeStatus` function to rotate states: `'none'` -> `'like'` -> `'dislike'` -> `'none'`.
- Add the cycling button to the desktop actions area (near favorite/watched buttons).
- Add the cycling button to the mobile actions row.
- Integrate tooltips (using `Tooltip` from UI library if available, or title attribute as a simple fallback).

## Verification Plan

### Manual Verification
- View the "Watch Next" or "Watch List" page in list view.
- Click the new icon multiple times to verify it cycles:
    - Initial (Meh): Gray border thumbs up.
    - Click: Primary filled thumbs up.
    - Click: Destructive filled thumbs down.
    - Click: Back to Meh.
- Verify that tooltips reflect the state correctly.
- Verify that the state is persisted (refresh page or check grid view).
- Verify on mobile view.
