TASK: FEATURE: Tags UI Experience

We want to improve the UI experience of the tags on the settings page and also on the way we allow the user to add tags and filter episodes with tags modals.

## PREFERENCES PAGE GOALS
- In the tags tab in preferences, we want to alphabetically order the tags in the list of existing tags.

## TAGS FILTER GOALS
- In the modal to add a tag and in the list of tag pills we show on the tag filter, we want to order tags having the most used tags first on the list (to the left).

## ADD TAGS MODAL GOALS
- The modal shows a list of "Recent tags" but I don't fully understand the logic behind it. It seems to be ordered by the last time the tag was used, but I am not sure. 

We must make sure we are ordering all tags by the last time they were used. This should be thoroughly analyzed, it could become a potential performance issue.

## REQUIREMENTS:
- We do not want to change any other existing functionality, just improve the UI experience.
- We must make sure we do not break any other existing functionality.


---

## v2 

I want to keep the ordering on the tag filter. But i am not convinced on the ordering of the add tag pop up menu. I preffer the previous behavior. 

In order to restore the previous commit, should we do anything with the database since we applied a migration ?

---

## v3

We can keep the last_updated date collumn on the tags table.B But i want to rever the ordering. 

However, if we have it, we can also keep the code that updates the last_updated date on the tags table when a tag is used. WE should, not remove it.

Reverting Add Tag Modal Ordering
I've updated the implementation plan to keep the last_used_at infrastructure and the code that updates it, but revert the "Add Tag" modal to alphabetical ordering. I'm now ready to proceed with the frontend change.

Files Edited
Task
Implementation Plan
Progress Updates
1
Updating implementation plan to keep usage tracking but use alphabetical ordering in UI

2
Updating implementation plan and task list for the pivot v3

I've updated the implementation plan to reflect your latest feedback:

Keep last_used_at: The database column and index will remain.
Keep Tracking: The code in MediaService that updates the last_used_at timestamp will also be kept, ensuring we have this data for future use.
Revert UI Ordering: The "Add Tag" modal in EpisodeCard will be updated to use alphabetical sorting instead of "Recent Tags" sorting.
Please review and approve so I can apply the frontend change.

Implementation Plan
Open

Proceed
Implementation plan for improving the Tags UI experience, including alphabetical ordering in Preferences, most-used ordering in Filters, and last-used ordering in the Add Tags modal.
Good
Bad




