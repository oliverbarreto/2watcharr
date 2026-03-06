# TASK: FEATURE - LabcastARR Integration - Events

## Overview

great it works like a charm now i want to try to improve the UI/UX. When we use the add episode modal and provide a youtube/podcast url the modal keeps showing the "sending..." to api ui while (i think) it sends off the required api calls to get the metadata of the url and then it getes added. 

In terms of usability we should not keep the user blocked waiting for the api with the model disabled on screen. We should accept the request of the user, create the event "Episode Requested", sow a toast message as we do now, but dismiss the modal form, and inform the user asynchronously via notifications and on-screen toast messages.

I wanto to define this feature with details with you before implementing it. Maybe with a bell icon with events of these events in the background that navigates to the /acctivity page

---

## v2

It now works and i love4 the red dot to the verey left denoting the ones not read. However, we need to improve one thing. Right now i have to manually refresh the page in order to update the badge in the notification bell to update the count of unread notifications. I would like to see the badge update automatically when the event is created. 

For example i am on the home page, i add a youtube video and i get the toast and one notification right away when the modal is dismissed. I refresh the page and the badge count is updated to three with all the events already done: "Episode Requested" (Shown when the modal is dismissed) -> "Episode Initiated" -> "Episode Creation Finalized" The last two are shown on the bell icon after i refresh the app.

Also, when we click the bell icon, we navigate to the page /activity. I would like the badge to clear the count of unread notifications when we click the bell icon and navigate to /activity page.
