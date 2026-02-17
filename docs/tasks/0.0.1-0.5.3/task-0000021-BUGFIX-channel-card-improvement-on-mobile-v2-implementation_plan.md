# Implementation Plan - Mobile Toggle Button for Channel Overlay

Add a mobile-only toggle button to the channel card overlay to allow users to expand and collapse the information panel, matching the design provided in the uploaded image.

## Proposed Changes

### [Component Name] - Channel Card Overlay

#### [MODIFY] [page.tsx](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/app/channels/page.tsx)

- **State Management**: Use the existing `isExpanded` state to control overlay height and icon direction.
- **Remove Old Button**: Remove the previous mobile toggle button from the top-right header area of the overlay.
- **Overlay Height Logic**: Update the overlay container's height classes to properly handle the `isExpanded` state on mobile (where `group-hover` isn't applicable).
- **New Toggle Button**:
    - Add a new `button` inside the overlay container.
    - Position it at the **bottom right** using absolute positioning (`absolute bottom-5 right-5`).
    - ICON: Use `ChevronUp` when collapsed and `ChevronDown` when expanded from `lucide-react`.
    - Visibility: Only visible on mobile (`md:hidden`).
    - Styling: Large, high-contrast chevron matching the image.

## Verification Plan

### Manual Verification
- Deploy changes and test on a mobile device or browser inspector.
- Verify the button appears in the bottom-right corner only on small screens.
- Verify clicking the button toggles the overlay between its summary view and full view.
- Verify the icon changes correctly (Up to expand, Down to collapse).
- Verify the layout remains consistent on desktop (no button visible, hover still works).
