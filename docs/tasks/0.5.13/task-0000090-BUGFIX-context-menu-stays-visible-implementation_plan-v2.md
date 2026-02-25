# Implementation Plan - Fix Context Menu of Episode Cards

Fix the issue where the context menu stays visible after an action is performed and does not close when clicking outside.

## Proposed Changes

### [Component] Episode Cards and List Rows

#### [MODIFY] [episode-card.tsx](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/components/features/episodes/episode-card.tsx)
- Remove `e.preventDefault()` from `onSelect` handlers in `DropdownMenuItem` to allow the menu to close automatically after an action.
- Remove `onClick={(e) => e.stopPropagation()}` from `DropdownMenuTrigger` and `DropdownMenuContent` if they are redundant or interfering with Radix UI's internal logic.
- Ensure that actions like "Add tags" or "Add note" properly transition from the dropdown to the respective dialogs.

#### [MODIFY] [episode-list-row.tsx](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/components/features/episodes/episode-list-row.tsx)
- Apply similar changes as in [episode-card.tsx](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/components/features/episodes/episode-card.tsx): remove `e.preventDefault()` from `onSelect` handlers and refine [stopPropagation](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/components/features/episodes/episode-list-row.tsx#613-614) logic.

## Verification Plan

## V2: Hide Reorder Options on Watchlist

### [Component] Episode List Components

#### [MODIFY] [grouped-episode-list.tsx](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/components/features/episodes/grouped-episode-list.tsx)
- Add `showReorderOptions` to [GroupedEpisodeListProps](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/components/features/episodes/grouped-episode-list.tsx#9-17).
- Pass `showReorderOptions` to [EpisodeCard](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/components/features/episodes/episode-card.tsx#62-898) and [EpisodeListRow](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/components/features/episodes/episode-list-row.tsx#61-820).

#### [MODIFY] [episode-list.tsx](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/components/features/episodes/episode-list.tsx)
- Pass `showReorderOptions` to [GroupedEpisodeList](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/components/features/episodes/grouped-episode-list.tsx#18-78) in the [renderEpisodes](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/components/features/episodes/episode-list.tsx#264-328) function.

## Verification Plan

### Manual Verification
- **Watchlist Page**:
    1. Navigate to `/`.
    2. Open context menu on an episode card/row.
    3. Verify "Move to beginning" and "Move to end" are NOT visible.
- **Watch Next Page**:
    1. Navigate to `/watchnext`.
    2. Open context menu on an episode card/row.
    3. Verify "Move to beginning" and "Move to end" ARE visible.
