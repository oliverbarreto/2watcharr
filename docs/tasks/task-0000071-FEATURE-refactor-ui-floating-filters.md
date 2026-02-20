# TASK: FEATURE: Refactor Watchlist and Channel page UI to use a floating panel for search and filters  

We want to refacto the UI of the Watchlist and Channel page to use a floating panel for search and filters instead of the current implementation. 

The filters are a very important aspect of the app, but they take too much space at the top of the page. We want to place the filters in a floating bar that can be expanded and collapsed.

The UI I have in mind is something like this:
- We use a search icon in the top bar to the right of the "+" (add new episode) button. 
- When the user clicks on the search icon, a floating pannel appears at the top of the page, right bellow the navigation bar, with the current search textfield and all the filters. It should have a way to dismiss the floating pannel (e.g. a close icon in the top right corner of the pannel). We do not want to dismiss it if we click outside the pannel. We also want to dismiss it if we click on the search icon again.

## REQUIREMENTS:
- We do not want to change any existing functionality, just move the search and filters to a new floating pannel.
- We must make sure we do not break any existing functionality.
- We must have the same approach in both, Watchlist and Channel page.
- In mobile devices remove the "2watcharr" title from the top bar to allow having more space in the top navigation bar. In bigger screens it already does not show "2watcharr" in the top bar.
