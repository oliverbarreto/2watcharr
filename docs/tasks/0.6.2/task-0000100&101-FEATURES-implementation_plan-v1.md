# Implementation Plan - Clear Filters Shortcut and Navbar Simplification

Implement a keyboard shortcut to clear filters and simplify the navigation bar by moving less frequent links to the user dropdown menu.

## Proposed Changes

### [Component] Filter Bars

#### [MODIFY] [filter-bar.tsx](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/components/features/episodes/filter-bar.tsx)
- Add a global `keydown` event listener for `CMD + ESC` (or `CTRL + ESC` on non-Mac).
- When triggered, call [clearAllFilters()](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/components/features/channels/channel-filter-bar.tsx#111-122) and dispatch a `close-filters` CustomEvent to close the floating filter bar.

#### [MODIFY] [channel-filter-bar.tsx](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/components/features/channels/channel-filter-bar.tsx)
- Add a global `keydown` event listener for `CMD + ESC` (or `CTRL + ESC` on non-Mac).
- When triggered, call [clearAllFilters()](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/components/features/channels/channel-filter-bar.tsx#111-122) and dispatch a `close-filters` CustomEvent.

---

### [Component] Layout

#### [MODIFY] [navbar.tsx](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/components/layout/navbar.tsx)
- Remove the `Stats` link from the [NavLinks](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/components/layout/navbar.tsx#34-77) component (which affects both desktop navbar and mobile sidebar).
- Remove the [Archive](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/app/archived/page.tsx#242-257) icon button from the desktop navbar.
- Ensure `Stats` and [Archived](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/app/archived/page.tsx#242-257) remain available in the user profile dropdown menu (they are already present).

## Verification Plan

### Automated Tests
- N/A (UI interaction tests are better handled manually or with Playwright, but I'll check if there are existing tests).

### Manual Verification
1.  **Clear Filters Shortcut**:
    *   Go to Watchlist, Channels, Watch Next, and Archived pages.
    *   Apply some filters (e.g., search text, tags).
    *   Press `CMD + ESC`.
    *   Verify that filters are cleared and the filter bar (if open) is closed.
2.  **Navbar Simplification**:
    *   Verify that "Stats" is no longer visible in the main navbar (desktop) and sidebar (mobile).
    *   Verify that the "Archive" icon button is no longer visible in the desktop navbar.
    *   Verify that both "Stats" and "Archived" are accessible via the user avatar dropdown menu.
