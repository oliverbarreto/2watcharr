# Implement "Watch Next" Page and Refactor "Watch List"

The goal is to simplify the purpose of the home page (Watch List) and create a new dedicated page (Watch Next) for prioritized episodes with manual ordering enabled.

## Proposed Changes

### [Component] Navbar
#### [MODIFY] [navbar.tsx](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/components/layout/navbar.tsx)
- Rename "Watch Later" to "Watch List" in [NavLinks](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/components/layout/navbar.tsx#33-70) and [getPageTitle](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/components/layout/navbar.tsx#81-91).
- Add "Watch Next" link to [NavLinks](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/components/layout/navbar.tsx#33-70).
- Update [getPageTitle](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/components/layout/navbar.tsx#81-91) to handle `/watchnext`.

---

### [Component] Episodes Features
#### [MODIFY] [filter-bar.tsx](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/components/features/episodes/filter-bar.tsx)
- Add `showManualSort` prop (boolean).
- Conditionally render the "Manual" option in the sort dropdown based on `showManualSort`.

#### [MODIFY] [episode-list.tsx](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/components/features/episodes/episode-list.tsx)
- Add `showReorderOptions` prop (boolean).
- Pass `showReorderOptions` to [EpisodeCard](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/components/features/episodes/episode-card.tsx#61-906) and [EpisodeListRow](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/components/features/episodes/episode-list-row.tsx#60-826).

#### [MODIFY] [episode-card.tsx](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/components/features/episodes/episode-card.tsx)
- Add `showReorderOptions` prop (boolean).
- Conditionally render "Move to beginning" and "Move to end" dropdown menu items.

#### [MODIFY] [episode-list-row.tsx](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/components/features/episodes/episode-list-row.tsx)
- Add `showReorderOptions` prop (boolean).
- Conditionally render "Move to beginning" and "Move to end" dropdown menu items.

---

### [Component] Pages
#### [MODIFY] [page.tsx](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/app/page.tsx)
- Set default sort to `date_added` (desc).
- Pass `showManualSort={false}` to [FilterBar](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/components/features/episodes/filter-bar.tsx#67-677).
- Pass `showReorderOptions={false}` to [EpisodeList](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/components/features/episodes/episode-list.tsx#56-353).

#### [NEW] [page.tsx](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/app/watchnext/page.tsx)
- Create a new page similar to the home page.
- Set default sort to `custom`.
- Set default filter to `priority: 'high'`.
- Pass `showManualSort={true}` to [FilterBar](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/components/features/episodes/filter-bar.tsx#67-677).
- Pass `showReorderOptions={true}` to [EpisodeList](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/components/features/episodes/episode-list.tsx#56-353).

## Verification Plan

### Automated Tests
- Run `npm run test` to ensure no regressions in existing logic.

### Manual Verification
- **Navbar**: Verify "Watch List" and "Watch Next" links are present and correctly highlighted when active.
- **Watch List (/)**:
    - Verify "Manual" sort option is missing from the filter bar.
    - Verify drag and drop is disabled (cards are not draggable).
    - Verify "Move to beginning/end" is missing from the episode card menu.
- **Watch Next (/watchnext)**:
    - Verify "Manual" sort option is present and is the default.
    - Verify drag and drop works.
    - Verify "Move to beginning/end" is present and functional.
    - Verify only episodes with priority are shown by default.
