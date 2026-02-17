# Plan: Only allow grid view on mobile

The goal is to force the grid view for episode lists on mobile devices and disable the list view toggle. This addresses the cramped layout issue in mobile list view.

## Proposed Changes

### [Component] Episodes

#### [MODIFY] [episode-list.tsx](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/components/features/episodes/episode-list.tsx)
-   Add a client-side check for screen width to determine if the device is mobile (e.g., width < 768px).
-   If on mobile, override the `viewMode` prop to always be `'grid'`.

### [Pages] Home and Channel Details

#### [MODIFY] [page.tsx](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/app/page.tsx)
-   Hide the "List View" / "Grid View" toggle button on mobile using Tailwind CSS classes (`hidden md:flex`).
-   This prevents users from even trying to switch to list view on mobile.

#### [MODIFY] [page.tsx](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/app/channels/[id]/page.tsx)
-   Currently hardcoded to `viewMode="list"`. I will change this to `viewMode="grid"` or let the [EpisodeList](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/components/features/episodes/episode-list.tsx#42-178) handle the mobile override.
-   Actually, I'll change it to `viewMode="grid"` by default or allow it to be dynamic if needed, but per user request, it should be grid on mobile.

## Verification Plan

### Manual Verification
-   **Desktop View**:
    1.  Navigate to the Homepage.
    2.  Verify the "Grid View" / "List View" toggle is visible and functional.
    3.  Navigate to a Channel Details page.
    4.  Verify the episode list appears correctly (it will now be grid or list depending on my final choice for desktop).
-   **Mobile View** (using browser dev tools emulator):
    1.  Navigate to the Homepage.
    2.  Verify the toggle button is hidden.
    3.  Verify the episode list is in Grid View.
    4.  Navigate to a Channel Details page.
    5.  Verify the episode list is in Grid View.
