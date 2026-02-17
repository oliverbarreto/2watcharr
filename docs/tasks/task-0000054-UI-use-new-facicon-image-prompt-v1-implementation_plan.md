# Implementation Plan - Update Icons and Mobile Navigation

Replace the current favicon and navbar logo with a new image, and consolidate the mobile navigation trigger into the logo icon.

## User Review Required

> [!IMPORTANT]
> **Missing Asset**: The file `public/2watcharr-icon-v1.png` mentioned in the task description is not present in the workspace. I need this file to proceed with the replacement.

> [!NOTE]
> **Mobile UI Change**: The hamburger menu button will be removed. The logo icon itself will now act as the trigger to open the side menu on mobile devices.

## Proposed Changes

### Assets
Move `2watcharr-icon-v1.png` (once provided) to `public/` and potentially [src/app/icon.png](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/app/icon.png) (to let Next.js handle favicons automatically).

### Layout
#### [MODIFY] [layout.tsx](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/app/layout.tsx)
- Update metadata `icons` to point to `/2watcharr-icon-v1.png` or simply use the automated `icon.png` feature of Next.js.

### Components
#### [MODIFY] [navbar.tsx](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/components/layout/navbar.tsx)
- Replace all occurrences of `/icon.png` with `/2watcharr-icon-v1.png`.
- In mobile view (inside the `SheetTrigger`):
    - Remove the `Button` containing the `Menu` icon.
    - Wrap the logo `Image` in a `SheetTrigger` if necessary, or use a `Button` with the logo `Image` inside as the trigger.
- Ensure the logo still links to `/` on desktop but opens the menu on mobile.

## Verification Plan

### Automated Tests
- N/A (UI visual changes)

### Manual Verification
1. **Favicon**: Open the app in a browser and verify the tab icon is updated.
2. **Navbar (Desktop)**: Verify the logo is updated and still links to the home page.
3. **Navbar (Mobile)**: 
    - Resize to mobile width.
    - Confirm the hamburger icon is gone.
    - Confirm the logo icon is present.
    - Click the logo icon and verify it opens the side navigation drawer.
