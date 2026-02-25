# TASK: FEATURE - UI: create archived episodes page and move episodes to archived episodes list
- IDE: Antigravity - Agent Mode
- Date: 2026-02-25
- Model: Gemini 3 Flash

## Overview

We need to create a way to archive episodes from the "Watch Next" list to make it more organized 
and less cluttered with episodes that were already watched or are not going to be watched. 

- The first step is to create a new page to show the archived episodes.
- The second step is to create a way to move episodes from the "Watch Next" list to the archived episodes list. This includes a button in the episode cards both the list and the grid view to move a episode to the archived episodes list. This button should only be visible in the "Watch Next" page. It should show a confirmation modal to confirm the action.
- We also need to add a button to archive watched episodes from the watch next page. This button should be visible in both the list and the grid view to the left of the toggle for list/grid view. It should show a confirmation modal to confirm the action.
- In the archived episodes list page, we also need to add a button to unarchive episodes from the archived episodes list. This button should be visible in both the list and the grid view to the left of the toggle for list/grid view. It should show a confirmation modal to confirm the action. We can also add a button option in episode cards to move individual episodes back to the "Watch Next" list.

More requirements:
- we should add archived dates. We want to group the archives episodes in sections by date archived in a similar manner than what we do in the watchlist page where we group episodes by date they were added to the list.
- the archive page should be accessible only from the "Watch Next" list with a button to the left of the list/grid view toggle.
- we should also have the option to use the search and filters panel in the archived page.
