# Task: Add Total Queue Time to Watch Next Page

- [ ] Research and Planning [/]
    - [x] Identify UI location for total time
    - [x] Identify data flow from API to UI
    - [ ] Create implementation plan [/]
- [ ] Backend Implementation [ ]
    - [ ] Update `MediaService.listEpisodes` to return total duration
    - [ ] Update `/api/episodes` route to include total duration in response
- [ ] Frontend Implementation [ ]
    - [ ] Update [EpisodeList](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/components/features/episodes/episode-list.tsx#57-357) component to receive and pass total duration
    - [ ] Update [WatchNextPage](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/app/watchnext/page.tsx#239-254) to calculate and display "Queue time"
- [ ] Verification [ ]
    - [ ] Verify total time calculation
    - [ ] Verify UI layout and formatting
    - [ ] Verify pagination doesn't break calculation
