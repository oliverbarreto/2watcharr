# Fix Navbar Search Icon State for Status Filters

The search icon in the navbar (magnifying glass) does not update its visual state (color and stroke width) when certain filters like "Unwatched", "Pending Confirmation", or "Watched" are active. This is because the logic that detects active filters in the navbar component is missing some query parameter keys used by the application, specifically `status` and `channelId`.

## Proposed Changes

### [Component: Layout]

#### [MODIFY] [navbar.tsx](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/components/layout/navbar.tsx)
- Update the `hasActiveFilters` constant to include `status` and `channelId` in the list of checked query parameters.

```diff
     // Check if any filters are active
     const hasActiveFilters = Array.from(searchParams.keys()).some(key => 
-        ['search', 'watched', 'watchStatus', 'tags', 'channels', 'favorite', 'hasNotes', 'likeStatus', 'type', 'isShort', 'priority'].includes(key)
+        ['search', 'status', 'watched', 'watchStatus', 'tags', 'channels', 'channelId', 'favorite', 'hasNotes', 'likeStatus', 'type', 'isShort', 'priority'].includes(key)
     );
```

## Verification Plan

### Automated Tests
- I will run existing linting and tests to ensure no regressions.
- Command: `npm run lint` and `npm test` (if applicable).

### Manual Verification
- I will use the browser tool to:
    1. Navigate to the Watch List page (`/`).
    2. Click on the search/filter icon to open the filter panel.
    3. Click on "Unwatched", "Pending", or "Watched" filter buttons.
    4. Verify that the search icon in the navbar changes its visual state (becomes red/active) when these filters are active.
    5. Verify that clicking "All" (which clears the `status` param) or "Clear All" returns the icon to its inactive state.
    6. Repeat for other filters like tags or search text to ensure they still work as expected.
