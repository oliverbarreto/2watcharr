TASK: FEATURE: Add new page: "Watch Next"

I want to simplify the purpose and the logic of some pages. 

We started having in the watchlist page a way to manually order the episodes. The objective of that list has changed to be the history of episodes added chronologically. The user has filters and sorting options to order all videos. Therefore, we do not need manual ordering on the current watchlist (`/` route, "WatchLater" menu option)and we should rename the menu option to "History".

More over, we want to create a new page with a new importan list: "Watch Next". This new "Watch Next" page should be the way a user can create his list and have the option to manualy reorder episodes. 

The way the user will be able to include episodes in the Watch Next list will be by adding priority to a video. We already have this option to add and remove it.

Videos that have been added priority will continue apperaing in the Watch List, and will be addeed to the Watch Next list. When a video is removed the priority atribute, it is removed from the Watch Next list.

## Requirements for the new "Watch Next" page:
- It should use "/watchnext" as route
- It should have manual reordering utilizing the drag and drop that we already have implemented in current watchlist.
- It should have the same approach for the search and filter floating panel.
- It should include the manual ordering, as default option and the rest of filets and ordering options.
- It should have both list and grid views, and the cards should be draggable as current implementation.
- Make available the option to move to beginning/end of the list from the dropdown menu option for episode cards in list and grid view


## Requirements for the watchilist page, currently "/" route:
- It should remain in "/" route. Rename its Menu option to "Watch List"
- Remove the option to drag and drop episodes both in list and grid views
- Remove the option for manual ordering in the search and filters panel.
- Remove the option to move to beginning/end of the list from the dropdown menu option for episode cards in list and grid view
