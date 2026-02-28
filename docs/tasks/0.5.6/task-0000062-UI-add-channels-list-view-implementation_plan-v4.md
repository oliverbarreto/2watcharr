# Implementation Plan - Add List View to Channels Page

The goal is to provide a list view option for the channels page, similar to the one available on the episodes/watchlist page. This will help users manage their channels more efficiently, especially when they have many.

## Proposed Changes

### [Channels Component]

#### [MODIFY] [channel-list-row.tsx](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/components/features/channels/channel-list-row.tsx)
Further UI refinements:
- [ ] Change thumbnail aspect ratio to `aspect-video` and match [EpisodeListRow](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/components/features/episodes/episode-list-row.tsx#48-674) widths (`w-28 xs:w-32 sm:w-48`).
- [ ] Reduce spacing between thumbnail and metadata (adjust gaps to `gap-2 sm:gap-3`).
- [ ] Maintain split layout for large screens.

#### [MODIFY] [page.tsx](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/app/channels/page.tsx)
Update the channels page to support the new list view.
- Add `viewMode` state ('grid' | 'list'), persisted in `localStorage`.
- Add a toggle button in the header (Grid/List icons).
- Refactor rendering to switch between [SortableChannelCard](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/app/channels/page.tsx#74-230) (grid) and a new `SortableChannelListRow` (list).
- Ensure drag-and-drop works in both views.

## Verification Plan

### Automated Tests
- I will check if there are any existing lint rules and run `npm run lint` to ensure no regressions.
- Since there are no existing channel-specific UI tests, I will focus on manual verification.

### Manual Verification
1.  **View Switching**: Navigate to the Channels page and verify that the Grid/List toggle button is present and works.
2.  **State Persistence**: Toggle to List view, refresh the page, and verify it stays in List view.
3.  **List View Content**: Verify that the channel information (name, count, description, tags) is correctly displayed and looks premium.
4.  **Actions**: Test 'Sync Metadata' and 'Delete' buttons in the list view.
5.  **Navigation**: Click on a channel in the list view and verify it navigates to the channel details page.
6.  **Drag and Drop**: Verify that channels can be reordered in both Grid and List views.
7.  **Responsive Design**: Test the list view on mobile to ensure it adapts well (similar to how episodes list view does).
