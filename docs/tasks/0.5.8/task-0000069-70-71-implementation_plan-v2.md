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
- Implement the same logic as in [EpisodeCard](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/components/features/episodes/episode-card.tsx#61-908).

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

### [V2 Refinements]

#### [MODIFY] [filter-bar.tsx](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/components/features/episodes/filter-bar.tsx)
- Adjust responsive layout for 1024px-1280px range to use vertical stack (Issue 1).
- Add "Clear All" button to the tag filter button, visible only when tags are selected (Issue 2).
- Ensure "Clear All" resets tags (Issue 2).
- Change `Diamond` to `Gem` for priority consistency (Issue 4).

#### [MODIFY] [navbar.tsx](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/components/layout/navbar.tsx)
- Implement dynamic label support (Issue 5).
- Add logic to change Search icon color when filters are active (Issue 3).
- Hide "2watcharr" brand name on mobile, show icon only (Already done, but refine if needed).

#### [MODIFY] [episode-card.tsx](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/components/features/episodes/episode-card.tsx)
#### [MODIFY] [episode-list-row.tsx](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/components/features/episodes/episode-list-row.tsx)
- Change `Diamond` icon to `Gem` for priority (Issue 4).
- Replace textual "High" priority badge with the icon (Issue 4).

#### [MODIFY] [route.ts](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/app/api/episodes/route.ts)
- Implement `priority` filtering logic in the backend (Issue 4.1).

#### [Title Cleanup]
Remove titles from:
- [page.tsx](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/app/page.tsx)
- [channels/page.tsx](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/app/channels/page.tsx)
- [stats/page.tsx](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/app/stats/page.tsx)
- [settings/page.tsx](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/app/settings/page.tsx) (Need to find this file)

## Verification Plan
... (same as before plus new V2 items)
