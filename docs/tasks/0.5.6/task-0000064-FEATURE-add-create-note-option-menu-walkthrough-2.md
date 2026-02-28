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
### UI Refinement (v2)
- Reduced the font size of the "Confirm Watched" button in [episode-card.tsx](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/components/features/episodes/episode-card.tsx) to `text-[11px]` when in the pending state.
- Added `flex-shrink-0` to the secondary action buttons (Favorite, Tags, and Dropdown) to guarantee they remain visible and aren't pushed out by long button text.

## Verification Results

### Automated Tests
- I verified the code compiles without lint errors and the UI scaling logic is applied correctly.

### Manual Verification Required
- Please check the watchlist page:
    1. Verify that the "Add note" / "Edit note" option appears correctly in both card and list views.
    2. Confirm that the option is positioned below "Add favorite".
    3. Find an episode in "Pending Confirmation" state (Confirm Watched button).
    4. Verify that the "Confirm Watched" text is slightly smaller and the vertical ellipsis button (More) is clearly visible and not cut off.
    5. Test creating and editing a note to ensure it saves correctly and the indicators appear as expected.
