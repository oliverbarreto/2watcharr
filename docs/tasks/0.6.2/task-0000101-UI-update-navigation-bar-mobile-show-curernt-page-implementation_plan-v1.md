# Navigation Bar and Menu Updates Plan

The goal is to improve the mobile navigation by showing the current page title next to the logo and moving the Archive link from an icon button to the main navigation menu.

## Proposed Changes

### UI Components

#### [MODIFY] [navbar.tsx](file:///Users/oliver/local/dev/2watcharr/src/components/layout/navbar.tsx)

- Update [NavLinks](file:///Users/oliver/local/dev/2watcharr/src/components/layout/navbar.tsx#34-77) component:
    - Add "Archive" link (`/archived`) between "Watch Next" and "Stats".
    - Use `Archive` icon from `lucide-react`.
- Update [Navbar](file:///Users/oliver/local/dev/2watcharr/src/components/layout/navbar.tsx#78-278) component's mobile trigger (the hamburger menu):
    - Add `{getPageTitle()}` next to the logo inside the `SheetTrigger` button.
    - Ensure it's only visible on mobile (using Tailwind responsive classes if needed, or adjusting existing `hidden` classes).
- Remove the standalone `Archive` icon button from the desktop/mobile top-right action area (formerly between Search and Settings).
- Refine the display logic for [getPageTitle()](file:///Users/oliver/local/dev/2watcharr/src/components/layout/navbar.tsx#88-101) in the main layout to avoid redundancy or layout issues on mobile.

## Verification Plan

### Automated Tests
- No automated UI tests are currently available in the codebase for this layout. I will manually verify the layout.

### Manual Verification
- **Mobile View:**
    1. Open the app in a mobile-sized browser window.
    2. Verify that the current page title (e.g., "Watch List", "Archive") is displayed to the right of the logo in the top left.
    3. Click the logo/title to open the hamburger menu.
    4. Verify that "Archive" is present in the menu between "Watch Next" and "Stats".
    5. Verify that the Archive icon button is NO LONGER present in the top right action area.
- **Desktop View:**
    1. Open the app in a desktop-sized browser window.
    2. Verify that "Archive" is present in the navigation menu between "Watch Next" and "Stats".
    3. Verify that the Archive icon button is NO LONGER present in the top right action area.
    4. Verify that the page title is still displayed correctly next to the logo (as per current implementation).
