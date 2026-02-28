# Walkthrough: Add "Create Note" option to episode dropdown menu

I have added the "Create Note" option to the episode dropdown menus in both card and list views.

## Changes Made

### Episode Card View
- Repositioned the "Add note" / "Edit note" option in [episode-card.tsx](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/components/features/episodes/episode-card.tsx) to be immediately below the "Add favorite" option.

### Episode List View
- Implemented full note-taking functionality in [episode-list-row.tsx](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/components/features/episodes/episode-list-row.tsx), which was previously missing it.
- Added a `StickyNote` icon indicator in the row UI when a note is present.
- Added the "Add note" / "Edit note" option in the dropdown menu, positioned below "Add favorite".
- Integrated the note editor `Dialog`.

## Verification Results

### Automated Tests
- I verified the code compiles without lint errors in the modified files.

### Manual Verification Required
- Please check the watchlist page:
    1. Verify that the "Add note" / "Edit note" option appears correctly in both card and list views.
    2. Confirm that the option is positioned below "Add favorite".
    3. Test creating and editing a note to ensure it saves correctly and the indicators appear as expected.
