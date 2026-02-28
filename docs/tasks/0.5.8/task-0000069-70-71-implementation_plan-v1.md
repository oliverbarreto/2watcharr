# Feature Implementation: Copy URL, Priority Toggle, and Floating Filters

This plan covers the implementation of three parallel features:
1. Adding a "Copy Link" button to episode card options.
2. Adding a "Priority" toggle (Yes/No) to episode card options.
3. Refactoring the search and filter UI into a floating panel.

## Proposed Changes

### [Component] Episode Cards & List Rows

Modify the episode card and list row components to include the new options in their dropdown menus.

#### [MODIFY] [episode-card.tsx](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/components/features/episodes/episode-card.tsx)
- Add "Copy Link" option to `DropdownMenu`.
- Add "Toggle Priority" option to `DropdownMenu`.
- Implement logic for copying to clipboard with toast notification.
- Implement logic for toggling priority between `none` and `high`.
- Update the diamond icon indicator for priority.

#### [MODIFY] [episode-list-row.tsx](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/components/features/episodes/episode-list-row.tsx)
- Add "Copy Link" and "Toggle Priority" to `DropdownMenu` (desktop and mobile).
- Implement the same logic as in [EpisodeCard](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/components/features/episodes/episode-card.tsx#59-860).

---

### [Component] Layout & Navigation

#### [MODIFY] [navbar.tsx](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/components/layout/navbar.tsx)
- Add a search icon button next to the "Add" button.
- Hide the "2watcharr" brand name on mobile devices to save space.
- Emit a custom event or use a state to toggle the floating filter panel.

---

### [Component] Filter UI Refactoring

#### [MODIFY] [page.tsx](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/app/page.tsx)
#### [MODIFY] [channels/page.tsx](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/app/channels/page.tsx)
- Implement state to control the visibility of the floating filter panel.
- Move [FilterBar](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/components/features/episodes/filter-bar.tsx#65-682) (or `ChannelFilterBar`) into a floating container that appears below the navbar.
- Add a close button to the panel.
- Ensure the panel can be toggled by the search icon in the navbar.

## Verification Plan

### Automated Tests
- Run existing tests to ensure no regressions: `npm test`

### Manual Verification
1. **Copy Link**:
   - Open episode card menu.
   - Click "Copy Link".
   - Verify link is in clipboard.
   - Verify toast notification.
2. **Priority Toggle**:
   - Open episode card menu.
   - Click "Priority".
   - Verify diamond icon appears/disappears.
   - Verify state persists after refresh.
3. **Floating Filters**:
   - Click search icon in navbar.
   - Verify filter panel expands below navbar.
   - Test filters (search, type, etc.) still work.
   - Test close button and clicking search icon again to dismiss.
   - Check mobile layout to ensure "2watcharr" is hidden.
