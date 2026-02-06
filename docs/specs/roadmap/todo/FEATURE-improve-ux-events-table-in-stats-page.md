# Task: Improve UX Events Table in Stats Page

## Description

We want to improve the events table in the stats page to make it more user-friendly and provide a better user experience.

The events table now has a search filter and the following collumns, and it's possible to sort the table by any of these columns:
- title
- type (video/podcast)
- event action (watched/tagged/added/fafvorited/pending/restored...)

We want to add a new collumn to the table to show the tags of the episodes and allow sorting as well.

We also want to make sure the table works 100% correctly. There are some issues i want you to invesetigate and, if necessary, fix:
- I currently don't see any rows with podcasts. Are we storing events of podcasts? why are we not showing any?
- I currently don't see any rows with soft deleted episodes nor hard deleted episodes. Are we storing events of deleted episodes? why are we not showing any?


## Acceptance Criteria

- [ ] The events table should be improved to make it more user-friendly and provide a better user experience.
- [ ] The events table should be fixed to show all the events correctly.