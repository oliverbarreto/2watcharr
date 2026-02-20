# Add Page Title to Navbar

Add the page title next to the logo for mobile and all other devices.

## Proposed Changes

### Layout Component

#### [MODIFY] [navbar.tsx](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/components/layout/navbar.tsx)

- Remove responsive hiding classes (`hidden xs:block`) from the page title container and the vertical separator.
- Adjust [getPageTitle()](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/components/layout/navbar.tsx#64-74) to ensure it returns the correct titles as requested.
- Ensure the title is visible on mobile next to the logo icon.
- Adjust padding/gap if necessary for a clean look on small screens.

## Verification Plan

### Manual Verification
- View the app on different screen sizes (using browser developer tools: mobile, tablet, desktop).
- Verify that "Watch Later" title is visible on the home page (/).
- Verify that "Channels" title is visible on the /channels page.
- Verify that "Stats" title is visible on the /stats page.
- Verify that "Settings" title is visible on the /settings page.
- Check that the title is correctly placed next to the logo icon on mobile.
