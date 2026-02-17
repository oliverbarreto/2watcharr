
PLAN MODE: 

We now want to extend the model to add, if not already being saved, important dates of videos (eg: when added to the list, when watched, when favorited, when removed, etc.). 

The idea is to show some of these dates in the video cards, for example, the date when it was added to the list, the date when it was watched, the date when it was favorited, the date when it was removed, etc. And then allow sorting by these dates (e.g. sort by date added, date watched, date favorited, date removed, etc.). 

We should also consider the case where a video is added to the list, then removed, then added again, etc. In this case, we should store all the dates.

Let's analyze the best way to do it. Should we add a new table for this or extend the existing video table? Should we consider events on videos instead of just dates?

