# Implementation Plan - Fix Channels Stats Issues

Improve the "Channels Stats" page by fixing the default channel selection logic and adding a search filter for the channels list.

## Proposed Changes

### [Stats Page](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/app/stats/page.tsx)

#### [MODIFY] [page.tsx](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/app/stats/page.tsx)

- **Improve Selection Logic**: Update `fetchStats` to calculate the total count for each channel within the selected period and select the top 5 channels based on the current metric (`added`, `watched`, etc.).
- **Add Search State**: Introduce `channelSearchQuery` for filtering the channels list.
- **Implement Filtering**: Filter the list of channels shown in the "Visible Channels" section based on `channelSearchQuery`.
- **UI Enhancements**:
    - Add a search input with a "Clear" button in the "Visible Channels" card header.

## Verification Plan

### Manual Verification
- **Test Search Filtering**:
    1. Navigate to `/stats`.
    2. Go to the "Channels" tab.
    3. Type a channel name in the new search box.
    4. Verify that only matching channels are shown in the checkbox list.
    5. Click the "Clear" button and verify the search is reset.
- **Verify Top 5 Selection**:
    1. Change between metrics (Added, Watched, etc.).
    2. Verify that the chart automatically updates to show the 5 channels with the highest counts for that specific metric in the period.
