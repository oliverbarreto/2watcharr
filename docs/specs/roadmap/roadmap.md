# Roadmap

## Feature Requests

### To be done:

These are some features we want to add to the app but are not specidifed yet:

- [ ] FEATURE: Download transcript (only youtube videos for now. We need to investigate how to do it for other platforms such as for podcasts. We can always fallback to downloading the audio file and using a service to extract the transcript). (docs/specs/roadmap/todo/FEATURE-download-transcripts.md)
- [ ] FEATURE: 2watcharr browser extension. (docs/specs/roadmap/todo/FEATURE-2watcharr-browser-extension.md)

- [ ] FEATURE: We want to create a way to visualize some channels stats. We want to visualize:
- videos added/watched by channel 
- videos favorited/with priority/liked/disliked by channel 

- [ ] FEATURE: Recommendations
- we want to have a way to detect "forgotten" videos of a certain topic. Videos that were added in the past of a topic that are still not watched, or also, pending confirmation. 


Things & Ideas to investigate:
- [ ] a way to allow the user to not add a video via iOS Share Sheet or copya paste in the app, but instead the app or a browser extension could just intercept the url, see that it is a vido or podcast, and add it to a "watch list". 
- [ ] Add a list of "Watch Next" that could be populated with videos from the watch list, and the user could order them with drag and drop. 
- [ ] How to download current playlist from youtube and youtube history ... also for other platforms
- [ ] Create our own algorithm to:
    1. Analyze topics of added/watched videos to provide insights to the user of what he is interested in (e.g. "You watch a lot of videos about AI", "You watch a lot of videos from this channel", "This week you watched 5 videos about AI", "Three weeks and you have not watched any videos about personal development", ...). Time consumed in each topic is also a factor to consider. Provide a way to group them together (and add/remove topics manually?).
    2. recommend videos based on user preferences (current watchlist videos, what has been watched, liked/dislike, channels, etc.) and history and have new page with this recommendations. 
- [ ] Create a new page to show the recommendations based on the user preferences.
- [ ] Enable adding reminders to watch certain videos, or videos in a tag (in this sense we can consider a tag as a playlist for a certain topic).


#### AI TASKS:

#### FEATURES:
- [ ] `./docs/specs/roadmap/todo/task-0000000xx-BUGFIX-dont-scroll-when-update-fav-or-tags-episode-card-prompt-v1.md`

- [ ] `./docs/specs/roadmap/todo/FEATURE-import-playlist-data.md`
- [ ] `./docs/specs/roadmap/todo/FEATURE-async-request-and-client-ui.md`
- [ ] `./docs/specs/roadmap/todo/FEATURE-return-episode-title-to-ios-shortcut-to-display-name-on-notification.md`

#### UI:
- [ ] `./docs/specs/roadmap/todo/UI-add-channels-list-view.md`

#### CHORE:

#### BUGFIXES Pending - Analysis:
- [ ] `./docs/specs/roadmap/todo/BUGFIX-faviconerror-on-browser-console.md`

### ANALYSIS MADE - Not implemented:
- [ ] `./docs/specs/roadmap/todo/CHORE-add-port-configuration-to-env-to-allow-other-ports-in-deployment-server.md`
    - `./docs/tasks/0.0.1-0.5.3/task-0000023-add-port-variable-to-deployment-config-prompt-v1-implementation_plan.md`

- [ ] `./docs/specs/roadmap/todo/BUGFIX-images-not-showing-in-channels-page.md`: 
    - `./docs/tasks/0.0.1-0.5.3/task-0000041-BUGFIX-images-not-showing-in-channels-page-prompt-v1-implementation_plan.md`

## Working on:

## Implemented Features

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



