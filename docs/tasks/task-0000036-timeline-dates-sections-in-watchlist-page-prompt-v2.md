# Task: Modifications to task-0000036-timeline-dates-sections-in-watchlist-page-prompt-v2.md

## Description

I have tested the app manually with npm run dev locally and I have not found any performance issues with current number of episodes (around 6 episodes in total for development). The app is running smoothly and the watch list page is loading quickly.

I like the feature that episodes that have not been for example watched, are grouped in a section called "Not Watched". Let's keep this feature.

However, I have found some things we need to change in the filters and sorting optinos. 

## Changes

There are a few things to change:
1. for the dates options, the sections should be ordered with the most recent dates on top, right now they are ordered with the oldest dates on top.

2. for the options related to Priority, Favorite, Duration, Title there are a few things to change: 
- we are not using sections with the date as the section title, but we should using the date added
- the option with "Favorite" by default shows the episodes that are favorited at the bottom, it should be the oposite, show the ones favorited at the top.
- the option with "duration" by default shows the episodes that are longer at the bottom, it should be the oposite, show the ones with longer duration at the top.
- the option with "title" by default shows the episodes correctly ordered alphabetically. Nothing to do here.
- Don't do anything with the option with "priority" 

