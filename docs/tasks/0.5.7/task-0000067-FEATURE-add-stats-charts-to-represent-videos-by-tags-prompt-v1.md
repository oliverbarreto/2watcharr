# FEATURE: Add chart to stats page to represent videos by tags
- IDE: Antigravity
- Date: 20260218
- Model: Gemini Flash 3.0

## Overview

We want to add a new chart to the stats page to represent videos by tags.

First of all, we need to restructure the page to be able to organize all the information we want to show. We want to add tabs to the section that currently has the charts. 

The options for the tabs are:
- Activity: which will show current stats chart
- Tags: which will show the new chart. This will allow us to represent when certain topics (tags) are trending.
- Events History: which will show a history of all events that have happened in the table with pagination at the bottom of the page.

## Requirements

- The default chart tab will be the current one: activity trend chart.
- The new chart should be a linear chart like the activity chart, but this time we need to represent the number of videos per tag by date to analyze what tags are more popular and when.
- Since we can have several tags, I want you to analyze a good way to represent this information. At the same time there should be options to select which tags are shown on the chart. The user might want to deselect some tags to declutter the view, or select the ones he is interested in.  
- The frame for the tabs content should take all horizontal space available in the container. 
- Since we are moving the table with events history to a tab, we should reorder the sections with the stats. I suggest that we move the "Activity Summary" section below the "Viewwing time" section, and reorganize its contents to take the full row. The "Activity Summary" section should be split in three columns to show the current stats. 
- Add one more stat to the "Viewing Time" section: "Today" representing the viewing time for the current date. We place the stat card to the left of the current stat for viewing time "this week".
- Add stat cards for the number of videos watched today and for this week to the "Activity Summary" section. 

---

## v2

Goo job !!! One final touch: we want a little change in the "tags" tab in the stats page. 

We want to:
- In desktop devices: place the "Visible Tags" section to the right of the chart, instead of the left side of the chart. 
- In mobile devices: place the "Visible Tags" section below the chart, instead of on top of the chart.  

---

## v3

Great but lets make some changes to the "tags" tab in the stats page. 

1. We want to add an option to select all tags at once, and deselect all tags at once in the "Visible Tags" section.
2. Move the "Visible Tags" section bellow the chart, instead of on right side of the chart. Use all the available horizontal space for this section to spread the tags along the horizontal space. In case there are too many tags, we can use multiple rows. You can see in the image that it looks odd in mobile with all tags aligned to the left.

---