# Implementation Plan - Fix Channels Stats Issues V2

Improve the "Channels Stats" page with UI refinements and a reset functionality.

## Proposed Changes

### [Stats Page](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/app/stats/page.tsx)

#### [MODIFY] [page.tsx](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/app/stats/page.tsx)

- **UI Refinement**: Replace the `Trash2` icon with `XCircle` in the channel search textfield for consistency with the search panel.
- **Reset Functionality**:
    - Build a `resetToDefaults` function that recalculates the top 5 channels for the current metric and period.
    - Add a "Reset to Defaults" button in the "Visible Channels" header next to "Select All" / "Deselect All".
    - Use the `RotateCcw` icon for this button.

## Verification Plan

### Manual Verification
- **Verify Icon**: Ensure the clear icon in the channel search is now `XCircle`.
- **Test Reset Button**:
    1. Select/Deselect various channels in the list.
    2. Click the "Reset to Defaults" button.
    3. Verify that the selection returns to the top 5 channels for the current metric.
    4. Change the metric and verify that "Reset to Defaults" again selects the top 5 for the *new* metric.
