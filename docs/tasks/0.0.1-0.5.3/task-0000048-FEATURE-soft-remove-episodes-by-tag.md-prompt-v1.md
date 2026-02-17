# Task: Soft Remove episodes by tag

Two main changes:

## Tags Management Tab in Settings

In the "tags management" tab in settings, we want to add a new button to allow the user to soft remove episodes by tag. This means that we will remove the tag from the episode and also mark the episodes as soft deleted.

Place the button to remove episodes by tag to the very right of every tag row in the "tags management" tab in settings. Use a different trash icon. Add tooltips to all the buttons.

## Deleted Episodes Page

Then in the "/deleted" page, we can restore and complete remove episodes one by one. We now want to add a new button to allow the user to restore all episodes, and another button to allow the user to complete remove all episodes. 

Episodes will be restored with the tag they still have on the list of (soft) deleted episodes, if any. If no tag is present, then the episode will be restored without any tag.

Place the two buttons at the top of the page, to the left of the button to select grid view vs list view.
