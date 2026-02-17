# Task: FEATURE: Stats

We want to start planning and discussing a new epic feature. Here are my notes. Feel free to ask questions to understand the scope and requirements.

The scope of this feature is to add a stats page to show total videos, total podcasts, total channels, total tags, etc. and also stats about usage of the entries in the watch list: videos added/watched/favorited/removed/tagged by day/week/month, etc. The idea is allow the user to have a better understanding of how they use the app and what they watch.

Here is the description of how we envision the feature: 

- [ ] Add a stats page to show total videos, total podcasts, total channels, total tags, etc.
- [ ] Add a stats about usage of the entries in the watch list: videos added/watched/favorited/removed/tagged by day/week/month, etc.
- [ ] Add a stats about play time. Videos marked as watched are added to the play time. We should have total play time and average play time per video. Also by dates, today, this week, this month, this year, other custom date ranges, etc.
- [ ] When we click a video card and it opens the youtube video in a new tab, we could either 
    a) mark the video as watched and add the play time 
    b) mark the video with a state something like "pending confirmation of watched". These videos should be easily filtered in the watch list. Once the user marks the video as watched, we should add the play time to the total play time.
