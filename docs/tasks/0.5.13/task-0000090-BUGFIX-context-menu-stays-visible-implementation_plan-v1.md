# Implementation Plan - Fix Context Menu of Episode Cards

Fix the issue where the context menu stays visible after an action is performed and does not close when clicking outside.

## Proposed Changes

### [Component] Episode Cards and List Rows

#### [MODIFY] [episode-card.tsx](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/components/features/episodes/episode-card.tsx)
- Remove `e.preventDefault()` from `onSelect` handlers in `DropdownMenuItem` to allow the menu to close automatically after an action.
- Remove `onClick={(e) => e.stopPropagation()}` from `DropdownMenuTrigger` and `DropdownMenuContent` if they are redundant or interfering with Radix UI's internal logic.
- Ensure that actions like "Add tags" or "Add note" properly transition from the dropdown to the respective dialogs.

#### [MODIFY] [episode-list-row.tsx](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/components/features/episodes/episode-list-row.tsx)
- Apply similar changes as in [episode-card.tsx](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/components/features/episodes/episode-card.tsx): remove `e.preventDefault()` from `onSelect` handlers and refine `stopPropagation` logic.

## Verification Plan

### Manual Verification
- **Grid View (Episode Card)**:
    1. Open the context menu by clicking the more icon.
    2. Click an action (e.g., "Like", "Move to end").
    3. Verify the menu closes immediately.
    4. Open the menu again.
    5. Click outside the menu.
    6. Verify the menu closes.
- **List View (Episode List Row)**:
    1. Switch to list view if not already.
    2. Repeat the same steps as for the Grid View.
    3. Verify the menu behavior is consistent.
