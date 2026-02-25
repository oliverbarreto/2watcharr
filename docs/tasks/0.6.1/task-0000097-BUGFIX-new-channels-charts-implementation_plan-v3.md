# Implementation Plan - Fix Tags Stats Issues

Improve the "Tags" tab in the statistics page by adding search filtering and a "Top 5" reset button, consistent with the "Channels" tab.

## Proposed Changes

### [Stats Page](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/app/stats/page.tsx)

#### [MODIFY] [page.tsx](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/app/stats/page.tsx)

- **Add Search State**: Introduce `tagSearchQuery` for filtering the tags list.
- **Improve Selection Logic**:
    - Update `fetchStats` to calculate total counts for each tag and select the top 5 most used tags by default.
- **Implement Reset Functionality**:
    - Build a `resetTagsToDefaults` function to restore the selection to the top 5 most used tags.
- **UI Enhancements**:
    - Add a search input with `XCircle` clear button in the "Visible Tags" card header.
    - Add a "Top 5" reset button with `RotateCcw` icon.
    - Implement filtering for the tag checkboxes based on `tagSearchQuery`.

## Verification Plan

### Manual Verification
- **Test Search Filtering**:
    1. Navigate to `/stats` -> "Tags" tab.
    2. Type a tag name and verify filtering.
    3. Click the clear icon.
- **Test Reset Button**:
    1. Deselect some top tags.
    2. Click the "Top 5" button.
    3. Verify that the selection returns to the top 5 most used tags and a toast appears.
