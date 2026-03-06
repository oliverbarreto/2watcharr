# Walkthrough - Move Activity Page to User Profile Navigation

I have moved the "/activity" page link from the main navigation to the user profile dropdown menu to declutter the navbar and group user-specific actions together.

## Changes Made

### [UI Components]

#### [navbar.tsx](file:///Users/oliver/local/dev/2watcharr/src/components/layout/navbar.tsx)
- Removed "Activity" link from the [NavLinks](file:///Users/oliver/local/dev/2watcharr/src/components/layout/navbar.tsx#37-76) component (main navigation).
- Added "Activity" link to the user profile `DropdownMenuContent`.
- Positioned "Activity" between "Settings" and "Stats".
- Maintained consistency by using the `Bell` icon for the "Activity" menu item.

## Verification Results

### Automated Tests
- Ran `npm run lint` - **Passed**
- Ran `npm run typecheck` - **Passed**

### Manual Verification
- Verified that the "Activity" link is no longer present in the main navbar (desktop/mobile).
- Verified that "Activity" appears in the user profile dropdown menu between "Settings" and "Stats".
- Verified that clicking the "Activity" menu item correctly navigates to the `/activity` page.
