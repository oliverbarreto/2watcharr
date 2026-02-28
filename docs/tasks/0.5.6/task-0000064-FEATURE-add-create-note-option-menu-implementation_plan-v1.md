# Add "Create Note" option to episode dropdown menu

The requirement is to add a "Create Note" (or "Edit Note" if it exists) option to the dropdown menu of episode cards and list rows, specifically placing it below the "Add favorite" option.

## Proposed Changes

### Episodes Component

#### [MODIFY] [episode-card.tsx](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/components/features/episodes/episode-card.tsx)
- Move the `DropdownMenuItem` for "Add note" / "Edit note" to be positioned immediately after the "Add favorite" / "Remove favorite" item.

#### [MODIFY] [episode-list-row.tsx](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/components/features/episodes/episode-list-row.tsx)
- Import `StickyNote` from `lucide-react`.
- Import `Dialog`, `DialogContent`, `DialogDescription`, `DialogFooter`, `DialogHeader`, `DialogTitle` from `@/components/ui/dialog`.
- Import `Textarea` from `@/components/ui/textarea`.
- Add states: `isNoteModalOpen`, `noteText`, and `isSavingNote`.
- Implement [handleSaveNote](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/components/features/episodes/episode-card.tsx#246-266) function to save notes via the API.
- Update the dropdown menu to include the "Add note" / "Edit note" option below "Add favorite".
- Add a `StickyNote` icon indicator in the row UI (thumbnail area or near the title) if a note exists.
- Add the note editor `Dialog` at the bottom of the component.

## Verification Plan

### Manual Verification
- **Card View**:
    1. Navigate to the watchlist page in card view.
    2. Open the dropdown menu for an episode.
    3. Verify that "Add note" (or "Edit note") is located below "Add favorite".
    4. Click "Add note", enter some text, and save.
    5. Verify the note icon appears on the card.
    6. Open the menu again and verify it now says "Edit note".

- **List View**:
    1. Toggle to list view on the watchlist page.
    2. Open the dropdown menu for an episode row.
    3. Verify that "Add note" (or "Edit note") is located below "Add favorite".
    4. Click "Add note", enter some text, and save.
    5. Verify a note indicator appears in the row.
    6. Open the menu again and verify it now says "Edit note".
