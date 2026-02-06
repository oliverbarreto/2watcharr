# Task: BUGFIX - Manual reordering of episodes with drag and drop is not working in manual sorting mode in watchlist page

## Description

We need to fix manual reordering of episodes with drag and drop in watchlist page. Right now is not working. 
First, in the manual sorting mode, and only in this mode, do not use sections with the date as title. Use the old behavior of not using sections at all. In manual mode we have to remember the order of the episodes. However, the episodes should be first displayed ordered with the most recent episodes first, and the oldest episodes last, unless we have modified the order of the episodes with drag and drop. In this case, the order of the episodes should be the one we have defined with drag and drop for that episode and the rest of the episodes should be ordered with the most recent episodes first, and the oldest episodes last.