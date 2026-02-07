# Implementation Plan - Move Chart Legend

The goal is to move the activity trend chart legend from the top-left (under the subtitle) to the top-right (under the time range dropdown menu).

## Proposed Changes

### Stats Page

#### [MODIFY] [page.tsx](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/app/stats/page.tsx)

- Relocate the legend container from the left-side `div` in the `CardHeader` of the Activity Trend chart.
- Create a new flex container on the right side of the `CardHeader` to house both the `Select` component (dropdown) and the relocated legend.
- Align the legend to the right to match the dropdown's position.

## Verification Plan

### Manual Verification
- Run the application locally and navigate to the Stats page.
- Verify that the "Activity Trend" chart legend is now positioned directly below the time range selection dropdown.
- Ensure the layout remains responsive and looks good on different screen sizes.
