# Task: Add Total Queue Time to Watch Next Page

- [x] Research and Planning [x]
    - [x] Identify UI location for total time
    - [x] Identify data flow from API to UI
    - [x] Create implementation plan [x]
- [x] Backend Implementation [x]
    - [x] Update `MediaService.listEpisodes` to return total duration
    - [x] Update `/api/episodes` route to include total duration in response
- [x] Frontend Implementation [x]
    - [x] Update [EpisodeList](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/components/features/episodes/episode-list.tsx#57-359) component to receive and pass total duration
    - [x] Update [WatchNextPage](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/app/watchnext/page.tsx#263-278) to calculate and display "Queue time"
- [x] Verification [x]
    - [x] Verify total time calculation
    - [x] Verify UI layout and formatting
    - [x] Verify pagination doesn't break calculation
