# Implementation Plan - Improve Channel Card on Mobile

Increase the height of the channel card overlay to ensure information is not cut off, and add a toggle button for mobile devices to show/hide the overlay since they lack hover capabilities.

## Proposed Changes

### Channels Page

#### [MODIFY] [page.tsx](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/app/channels/page.tsx)

- Add `isExpanded` state to [SortableChannelCard](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/app/channels/page.tsx#72-208) to track overlay visibility on mobile.
- Update the base height of the overlay from `h-1/3` to `h-[40%]` (approximately 128px for a 320px card) to prevent content cutoff.
- Add a chevron button (using `ChevronUp` and `ChevronDown` from `lucide-react`) that is only visible on mobile (`md:hidden`).
- Toggle `isExpanded` when the chevron button is clicked.
- Apply the same styles as `group-hover` when `isExpanded` is true.

## Verification Plan

### Manual Verification
- **Desktop**:
    - Verify that the overlay height on hover is still `h-full`.
    - Verify that the base overlay height (idly) is slightly taller and fits the "X episodes" text clearly.
    - Confirm the chevron button is NOT visible.
- **Mobile** (using browser DevTools responsive mode):
    - Verify that the chevron button is visible.
    - Verify that clicking the chevron button expands the overlay to `h-full` and changes the icon to `ChevronDown`.
    - Verify that clicking it again collapses the overlay back to `h-[40%]`.
    - Ensure the animations are smooth.
