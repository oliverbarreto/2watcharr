# Move Activity Page to User Profile Navigation

The goal is to reorder navigation items by moving the "/activity" page from the main navigation (top/side menu) to the user profile dropdown menu, specifically between the "Settings" and "Stats" options.

## Proposed Changes

### [UI Components]

#### [MODIFY] [navbar.tsx](file:///Users/oliver/local/dev/2watcharr/src/components/layout/navbar.tsx)
- Remove the `/activity` link from the [NavLinks](file:///Users/oliver/local/dev/2watcharr/src/components/layout/navbar.tsx#37-81) component.
- Add the `/activity` link to the `DropdownMenuContent` within the [Navbar](file:///Users/oliver/local/dev/2watcharr/src/components/layout/navbar.tsx#82-261) component.
- Position the new `/activity` item between `Settings` and `Stats` items.
- Ensure the `Bell` icon is used for the activity item, consistent with its current usage.

## Verification Plan

### Automated Tests
- Run `npm run lint` to ensure no linting errors were introduced.
- Run `npm run typecheck` to ensure no type errors were introduced.

### Manual Verification
- Open the application in the browser.
- Verify that "Activity" is no longer visible in the main navigation (both desktop and mobile view).
- Open the user profile dropdown menu by clicking on the user emoji/icon.
- Verify that "Activity" appears as a menu option between "Settings" and "Stats".
- Click on "Activity" and verify it navigates to the `/activity` page.
