# Plan: Improve UI overlay button in mobile

The goal is to resize the chevron button on the mobile channel card overlay to be smaller and match the height of the tag pills (`h-6`).

## Proposed Changes

### [Pages] Channels

#### [MODIFY] [page.tsx](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/app/channels/page.tsx)
-   Update the mobile toggle button (lines 204-216):
    -   Change `p-2` to `w-6 h-6 flex items-center justify-center`.
    -   Change icon size from `h-8 w-8` to `h-4 w-4`.
    -   Adjust positioning if needed (currently `bottom-5 right-5`). I'll keep it there for now or slightly adjust `bottom` and `right` if it feels off.

## Verification Plan

### Manual Verification
-   **Mobile View**:
    1.  Navigate to the Channels page.
    2.  Verify the chevron button on the channel card is smaller.
    3.  Verify it matches the height of the tag pills.
    4.  Verify it still functions correctly to expand/collapse the overlay.
