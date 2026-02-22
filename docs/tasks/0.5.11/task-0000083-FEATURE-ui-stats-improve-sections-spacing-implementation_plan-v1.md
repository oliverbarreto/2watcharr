# Implementation Plan: Improve Stats Page UI Layout

This plan addresses the issue of overlapping labels/values in the "Activity Summary" section of the stats page by reallocating horizontal space and making the "Viewing Time" section more compact.

## Proposed Changes

### [Component Name: Stats Page]
Summary: Refactor the layout of the top row on the stats page to give more space to Activity Summary.

#### [MODIFY] [page.tsx](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/app/stats/page.tsx)
- Change the top row grid layout from `lg:grid-cols-2` to `lg:grid-cols-3`.
- Update the "Viewing Time" card to take 1 column (`lg:col-span-1`) and use a 2x2 grid internally (`grid-cols-2`).
- Update the "Activity Summary" card to take 2 columns (`lg:col-span-2`).

## Verification Plan

### Automated Tests
- None applicable for this UI layout change.

### Manual Verification
- **Browser Layout Check**:
    1. Open the stats page in the browser.
    2. Verify "Viewing Time" is displayed in a 2x2 grid.
    3. Verify "Activity Summary" has more horizontal space and labels/values do not overlap.
    4. Test responsiveness by resizing the browser to ensure it looks good on mobile (single column stack) and tablet (if applicable).
