# Roadmap

## Feature Requests

## Working on:

### To be done:

These are some features we want to add to the app but are not specidifed yet:

- [ ] BUGFIX: In the watch next page there is a weird bug when we use "Move to beginning" and "Move to end" options in the context menu of episode cards and list rows. In some random cases, i move a video to the end/beginning and it doesn't move it to the end/beginning, but instead:
- if i want to place it at the beginning it is placed after the first epiosde in the queue, 
- if i want to place it at the end of the queue it is placed before the last epiosde in the queue.

- [ ] FEATURE: we need to include a similar way to add in the list view the like/dislike buttons (we already have them in the cards in the grid view). 

Add the like/dislike buttons to the list view cards to be able to set like/dislike (and the empty status as well, remember that is a valid status, the user does not like nor dislike the episode, it's kind of `meh`) of a episode.

I would like to only have one button with the empty status being represented by a thumbs up icon, but not filled, just the border and colored in gray. When the user clicks on it, it should rotate over the three states: like (thumbs up filled), dislike (thumbs down filled), and empty (thumbs up border, gray). 

- [ ] FEATURE: we need to create a way to archive episodes from the "Watch Next" list to make it more organized and less cluttered with episodes that were already watched or are not going to be watched. 
    - The first step is to create a new page to show the archived episodes.
    - The second step is to create a way to move episodes from the "Watch Next" list to the archived episodes list. This includes a button in the episode cards both the list and the grid view to move a episode to the archived episodes list. This button should only be visible in the "Watch Next" page. It should show a confirmation modal to confirm the action.
    - We also need to add a button to archive watched episodes from the watch next page. This button should be visible in both the list and the grid view to the left of the toggle for list/grid view. It should show a confirmation modal to confirm the action.
    - In the archived episodes list page, we also need to add a button to unarchive episodes from the archived episodes list. This button should be visible in both the list and the grid view to the left of the toggle for list/grid view. It should show a confirmation modal to confirm the action. We can also add a button option in episode cards to move individual episodes back to the "Watch Next" list.

- [ ] FEATURE: if not already done, we need to include infinite scrolling in the "Watch Next" page following the same pattern we got in the watchlist.


- [ ] FEATURE: 2watcharr BROWSER EXTENSION (CODEX): (docs/specs/roadmap/todo/FEATURE-2watcharr-browser-extension.md)
    - we need to create a way to allow the user to not add a episode via iOS Share Sheet or copya paste in the app, but instead the app or a browser extension could just intercept the url, see that it is a vido or podcast, and add it to a "watch list". 
    - we need to create a way to allow the user to download/import current playlist from youtube and youtube history ... also for other platforms
    - we need to publish the browser extension for Chrome, Firefox and Safari

- [ ] FEATURE: Download transcript 
    - Only download transcript for Youtube videos for now. 
    - We want to store the transcript in the database and have a way to show it in the episode page. We should only download the transcript with timestamps. We should have a method to convert the text with timestamps to a clean text without the timestamps and save it also in the database.
    - We should have a way to allow the user to specify the language the user wants to download the transcript for. There should be a settings option to tell the system "Donwnload the transcript in spanish if available". If not available, download the transcript in the default language of the video. 
    - In the future, we will investigate how to do it for other platforms such as for podcasts. We can always fallback to downloading the audio file and using a service to extract the transcript. (docs/specs/roadmap/todo/FEATURE-download-transcripts.md)

- [ ] FEATURE: We want to create a way to visualize some channels stats. We want to visualize:
    - videos added/watched by channel 
    - videos favorited/with priority/liked/disliked by channel 

- [ ] FEATURE: Recommendations 
    - Create a new page to show the recommendations based on the user preferences.
    - We want to have a way to detect "forgotten" videos of a certain topic. Videos that were added in the past of a topic that are still not watched, or also, pending confirmation. 
    - Enable adding reminders to watch certain videos, or videos in a tag (in this sense we can consider a tag as a playlist for a certain topic).
    - We want to link 2watcharr with a calendar to create reminders for the user to watch the videos. For example, it could pick (following the defined order of priority) the first 5 videos in the watchlist and recommend to watch them in the next 3 days.
    - we can implement some sort of recommendation of time slots to consume episodes to try to fit the max number of episodes according to their duration into a time slot of x hours. For example we got videos of 15, 20, 25, 30, 35, 40, 45, 50, 55, 60 minutes. We can try to fit the max number of episodes into a time slot of 60 minutes following the play list order. We can propose various episodes of 15, 20, but not various of 45 or larger.

- [ ] `./docs/specs/roadmap/todo/FEATURE-async-request-and-client-ui.md`
- [ ] `./docs/specs/roadmap/todo/FEATURE-return-episode-title-to-ios-shortcut-to-display-name-on-notification.md`

Things & Ideas to investigate:
- [ ] Create our own algorithm to:
    1. Analyze topics of added/watched videos to provide insights to the user of what he is interested in (e.g. "You watch a lot of videos about AI", "You watch a lot of videos from this channel", "This week you watched 5 videos about AI", "Three weeks and you have not watched any videos about personal development", ...). Time consumed in each topic is also a factor to consider. Provide a way to group them together (and add/remove topics manually?).
    2. recommend videos based on user preferences (current watchlist videos, what has been watched, liked/dislike, channels, etc.) and history and have new page with this recommendations. 


### ANALYSIS MADE - Not implemented:
- [ ] `./docs/specs/roadmap/todo/CHORE-add-port-configuration-to-env-to-allow-other-ports-in-deployment-server.md`
    - `./docs/tasks/0.0.1-0.5.3/task-0000023-add-port-variable-to-deployment-config-prompt-v1-implementation_plan.md`

- [ ] `./docs/specs/roadmap/todo/BUGFIX-images-not-showing-in-channels-page.md`: 
    - `./docs/tasks/0.0.1-0.5.3/task-0000041-BUGFIX-images-not-showing-in-channels-page-prompt-v1-implementation_plan.md`


## Implemented Features

20260222 - Release 0.5.11:
- [x] New "Watch Next" page with drag-and-drop manual ordering.
- [x] New `/api/shortcuts/add-videos` endpoint for batch video addition.
- [x] Optimized Stats page layout for charts and activity summary.
- [x] Implementation of extensive keyboard shortcuts for navigation and search.
- [x] Restructured watchlist to focus on date-based organization.

20260222 - Release 0.5.10:
- [x] Centralized CORS logic for shortcut endpoints.
- [x] Console logging in API endpoints.
- [x] Improved "Add Episode" modal layout.
- [x] Concurrency fix in episode reordering logic.

20260221 - Release 0.5.9:
- [x] Silent refresh mechanism for episode updates.
- [x] Case-insensitive and emoji-neutral alphabetical tag sorting.
- [x] Resolved type safety issues in tests.
- [x] Fully clean linting and type checking.

20260220 - Release 0.5.8:
- [x] Floating blurred search panel at the top of the page.
- [x] Page titles in the navbar for better navigation context.
- [x] Copy link button for quick access to video URLs in cards and lists.
- [x] Priority status toggle (Favorite/Priority) in cards and lists.
- [x] Priority filter for quick content filtering.
- [x] Context-aware tag sorting (Alphabetical, Frequency, Last used).
- [x] Hidden search button on Statistics page.
- [x] Subtle active menu item highlighting in navbar.
- [x] Resolved all remaining linting errors.

20260219 - Release 0.5.7:
- [x] Restructured Stats page with tabs (Activity, Tags, Events History).
- [x] Added "Videos by Tags" interactive line chart.
 [x] Added "Viewing Time (Today)" and "Watched Today/This Week" metrics.
- [x] Added Select/Deselect All for tags in stats.
 [x] Optimized stats layout for better visibility.

20260219 - Release 0.5.6:
- [x] Added content type filters (Video, Shorts, Podcast).
- [x] Added "Create Note" option to episode cards and list rows.
- [x] Implemented "Like" and "Don't Like" voting for episodes.
- [x] Added floating episode count bubble for infinite scroll.
- [x] Refined channel list UI for better consistency.
- [x] Fixed Like/Don't Like filter logic.

20260218:
- [x] `./docs/tasks/0.5.6/task-0000061-UI-show-floating-bubble-with-number-of-episodes-infinite-scroll-prompt-v1.md


Analysis done:
- [x]`docs/specs/roadmap/todo/FEATURE-extend-scope-to-add-articles-webblogs-and-socialmedia.md`
- [x] `./docs/specs/roadmap/todo/FEATURE-extend-scope-to-add-articles-webblogs-and-socialmedia-implementation_plan.md`

20260218 - Release 0.5.5:
- [x] Improved release workflow and task automation.
- [x] `./docs/tasks/0.5.5/task-0000059-FEATURE-differentiate-shorts-vs-videos-prompt-v1.md`
- [x] `./docs/tasks/0.5.5/task-0000058-FEATURE-add-notes-to-episodes-prompt-v1.md`
- [x] `./docs/tasks/0.5.5/task-0000059-FEATURE-add-clear-option-to-filter-textfield-and-buttons-prompt-v1.md`


20260218 - Release 0.5.4:
- [x] `./docs/tasks/0.5.4/task-0000050-BUGFIX-navbar-localhost-link-prompt-v1.md`
- [x] `./docs/tasks/0.5.4/task-0000051-UI-use-space-channel-details-page-prompt-v1.md`
- [x] `./docs/tasks/0.5.4/task-0000052-BUGFIX-navigate-to-channel-page-from-video-cards-prompt-v1.md`
- [x] `./docs/tasks/0.5.4/task-0000053-UI-watchlist-page-week-days-dates-prompt-v1.md`
- [x] `./docs/tasks/0.5.4/task-0000054-UI-use-new-facicon-image-prompt-v1.md`
- [x] `./docs/tasks/0.5.4/task-0000056-FEATURE-allow-adding-youtube-shorts-episodes-prompt-v1.md`
- [x] `./docs/tasks/0.5.4/task-0000056-UI-add-filter-by-channel-in-watchlist-page-prompt-v1.md`
- [x] `./docs/tasks/0.5.4/task-0000057-CHORE-fix-linting-test-docs-bump-verion-tag-release-task.md`

20260215 - Release 0.5.3:
- [x] `./docs/specs/roadmap/completed/0.5.3/FEATURE-soft-remove-episodes-by-tag.md`
- [x] `./docs/specs/roadmap/completed/0.5.3/FEATURE-modify-chart-add-pending-confirmation-metric.md`
- [x] `./docs/specs/roadmap/completed/0.5.3/FEATURE-modify-chart-legend.md`

20260207 - Release 0.5.2:
- [x] `./docs/specs/roadmap/completed/0.5.2/FEATURE-infinite-scroll-in-watchlist-page.md`

20260206:
- [x] `./docs/specs/roadmap/completed/0.5.2/FEATURE-add-settings-option-for-default-filter.md`
- [x] `./docs/specs/roadmap/completed/0.5.2/BUGFIX-tags-lowercase-error-on-browser.md`

20260206 - Release 0.5.1:
- [x] updated documentation
- [x] Analysis done: `./docs/tasks/0.0.1-0.5.3/task-0000041-BUGFIX-images-not-showing-in-channels-page-prompt-v1-implementation_plan.md`

20260206 - Release 0.5.0:
- [x] updated documentation

20260206 - Release 0.4.0:
- [x] `./docs/specs/roadmap/completed/0.4.0/BUGFIX-add-legend-to-chart.md`
- [x] `./docs/specs/roadmap/completed/0.4.0/BUGFIX-improve-draganddrop-ui-remove-handle-in-date-filtering.md`
- [x] `./docs/specs/roadmap/completed/0.4.0/FEATURE-timeline-dates-sections-in-watchlist-page.md`
- [x] `./docs/specs/roadmap/completed/0.4.0/FEATURE-improve-ux-events-table-in-stats-page.md`

20260205 - Release 0.3.1:
- [x] `./docs/specs/roadmap/completed/0.3.1/BUGFIX-fix-broken-ios-workflow.md`
- [x] BUGFIX: Safari compatibility (custom dialogs, autofill fixes)
- [x] FEATURE: "Paste from clipboard" in add episode modal
- [x] FEATURE: Tags toggle in add episode modal for mobile

20260205 - Release 0.3.0:
- [x] Modify settings to make the "General" tab the default tab in Settings
- [x] `./docs/specs/roadmap/completed/0.3.0/FEATURE-deleted-episodes-page.md`
- [x] `./docs/specs/roadmap/completed/0.3.0/UI-only-allow-grid-view-in-mobile-prompt-v1.md`
- [x] `./docs/specs/roadmap/completed/0.3.0/UI-improve-ui-overlay-button-in-mobile-prompt-v1.md`

20260204 - Release 0.2.0:
- [x] `./docs/specs/roadmap/completed/0.2.0/FEATURE-channel-details-page.md`

20260203 - Release 0.2.0:
- [x] Tag and release 0.2.0
- [x] Analysis done: `./docs/specs/roadmap/CHORE-add-port-configuration-to-env-to-allow-other-ports-in-deployment-server.md` 
- [x] `./docs/specs/roadmap/completed/UI-improve-stats-cards.md`
- [x] add debounce to search in stats table
- [x] `./docs/specs/roadmap/completed/FEATURE-add-pagination-to-stats-table.md`
- [x] `./docs/specs/roadmap/completed/BUGFIX-podcasts-showing-wrong-metadata-but-link-works.md`
- [x] `./docs/specs/roadmap/completed/BUGFIX-channel-card-improvement-on-mobile.md`
- [x] `./docs/specs/roadmap/completed/UI-modify-confirm-watched-special-buttons.md`           
- [x] `./docs/specs/roadmap/completed/FEATURE-day-week-month-year-chart-and-stats-table.md`

20260131 - Release 0.1.0:
- [x] `./docs/specs/roadmap/completed/0.1.0/feature-stats.md`                                       
- [x] `./docs/specs/roadmap/completed/0.1.0/feature-users.md`                                       

20260130:
- [x] `./docs/specs/roadmap/completed/0.1.0/feature-podcasts.md`                                    
- [x] `.agent/workflows/test.md`                                                    

20260128:
- [x] `./docs/specs/roadmap/completed/feature-uxui.md`                              
- [x] `./docs/specs/roadmap/completed/core-tests.md`                                
- [x] `./docs/specs/roadmap/completed/core-tracking-changelog-features-and-bugs.md` 

20260127:
- [x] `./docs/specs/roadmap/completed/feature-video-management.md`                  
- [x] `./docs/specs/roadmap/completed/feature-integrations.md`                      



