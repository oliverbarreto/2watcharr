# TASK: FEATURE - UI: Allow the user to favorite channels

## Overview

We want to add a new feature. We want to allow the user to favorite channels. This will be a new button in the channels card in the `/channels` page and in the channel detail page `/channels/channelId`. We must include the star icon in the channel card and the channel detail page for favorited channels.

We must also update the search options in the `/channel` page to allow the user to filter for favorited channels with a "star" icon, just like we have for episodes. This will use a start icon button to filter for favorited channels. This button will be placed between the podcast filter and the tags filter buttons.

---

## v2

Fix lint and typecheck errors if any

---

## v3

I can favorite a video in the /channels page using the button in the channels cards, and in the channel detail page. The favorite persists.  

However, as you can see in the image, there is no favorite button in the filters bar. We need to have the option to filter favorite channels. Fix it 

---

## v4

We now have the favorite button in the filters bar, but it is not working. As you can see in both images, in either state of the favorite button we are showing the same results, that is all the channels. Fix it. We should only see favorite channels when the filter is on.

Take into account that we can enable videos and podcasts independently, and both types, separately of being set as favorite or note

--

## v5

We now got a weird behavior. When the i click the search button in the navbar and the search anbd filters panel is shown, we now have all the following buttons selected: "All", "videos" and "Podcasts", while "favorite" and tags are not selected. More over, the problem is even more confusing. Now if i click videos, it gets deselected, and selects only podcasts (http://localhost:3001/channels?types=podcast). On the contrary, if if i click on podcasts, it gets deselected and we show only videos (http://localhost:3001/channels?types=video). This is not the expected behavior.  

Fix it. When the search and filters panel opens, the default state should be show "all" types (videos and podcast). If i click videos, we show only videos. I we click podcast, videos gets deselected and podcast selected, and we only show podcast channels. Then Favorite button and tags add up, eg: if i am only showing videos and select favorite button, we should only see videos that are marked favorite
