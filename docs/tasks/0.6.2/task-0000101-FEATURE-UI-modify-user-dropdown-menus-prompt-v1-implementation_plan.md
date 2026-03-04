# Remove Settings Gear Icon from Navbar

The goal is to remove the standalone settings button (gear icon) from the navigation bar while maintaining the settings link within the user profile dropdown menu.

## Proposed Changes

### Navbar Component

#### [MODIFY] [navbar.tsx](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/components/layout/navbar.tsx)

- Remove the `<Link href="/settings">` block that contains the standalone gear icon button (lines 176-187).
- Ensure the settings link inside the `<DropdownMenu>` (lines 216-221) remains untouched.

## Verification Plan

### Manual Verification
1. Run the development server if it's not already running: `npm run dev`.
2. Open the application in the browser.
3. Verify that the gear icon is no longer visible in the navigation bar.
4. Click on the user profile icon to open the dropdown menu.
5. Verify that the "Settings" link is still present in the dropdown.
6. Click the "Settings" link in the dropdown and verify it navigates to the `/settings` page.
