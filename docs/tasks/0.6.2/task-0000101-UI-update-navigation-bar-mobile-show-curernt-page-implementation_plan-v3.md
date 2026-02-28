# Navigation Bar and Menu Updates Plan

The goal is to improve the mobile navigation by showing the current page title next to the logo and moving the Archive link from an icon button to the main navigation menu.

## Proposed Changes

### UI Components

#### [MODIFY] [navbar.tsx](file:///Users/oliver/local/dev/2watcharr/src/components/layout/navbar.tsx)

- Update [NavLinks](file:///Users/oliver/local/dev/2watcharr/src/components/layout/navbar.tsx#34-83) component:
    - Add "Archive" link (`/archived`) between "Watch Next" and "Stats".
    - Use `Archive` icon from `lucide-react`.
- Update [Navbar](file:///Users/oliver/local/dev/2watcharr/src/components/layout/navbar.tsx#84-276) component's mobile trigger (the hamburger menu):
    - Add `{getPageTitle()}` next to the logo inside the `SheetTrigger` button.
    - Ensure it's only visible on mobile (using Tailwind responsive classes if needed, or adjusting existing `hidden` classes).
- Remove the standalone `Archive` icon button from the desktop/mobile top-right action area (formerly between Search and Settings).
- Refine the display logic for [getPageTitle()](file:///Users/oliver/local/dev/2watcharr/src/components/layout/navbar.tsx#94-107) in the main layout to avoid redundancy or layout issues on mobile.

### Database Initialization

#### [MODIFY] [database.ts](file:///Users/oliver/local/dev/2watcharr/src/lib/db/database.ts)

- Update [getDatabase()](file:///Users/oliver/local/dev/2watcharr/src/lib/db/database.ts#8-46) to ensure the parent directory of the database file exists before opening the connection.
- Use `fs.mkdirSync` with `recursive: true` to create the directory if it doesn't exist.

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
- **Database Initialization:**
    1. Delete the `./data` directory if it exists.
    2. Run `npm run dev`.
    3. Verify that the `./data` directory and `2watcharr.db` file are created automatically.
    4. Verify that the app starts without `SQLITE_CANTOPEN` errors.
