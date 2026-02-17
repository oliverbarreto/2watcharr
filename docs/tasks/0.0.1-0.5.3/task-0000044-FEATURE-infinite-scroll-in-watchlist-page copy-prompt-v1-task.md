# Task: Infinite Scroll in Watch List Page

- [/] Planning Infinite Scroll Implementation [issue: planning]
    - [x] Research current EpisodeList implementation
    - [x] Research API/Database capabilities for pagination
    - [/] Create implementation plan
- [ ] Implement Pagination in API [issue: api]
    - [ ] Update [src/app/api/episodes/route.ts](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/app/api/episodes/route.ts) to support `limit` and `offset`
- [ ] Implement Infinite Scroll in UI [issue: ui]
    - [ ] Update [EpisodeList](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/components/features/episodes/episode-list.tsx#45-220) to handle paginated data
    - [ ] Add intersection observer for infinite scroll
    - [ ] Add loading indicator
    - [ ] Display episode counts in [HomePageContent](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/app/page.tsx#23-130)
- [ ] Verification [issue: verification]
    - [ ] Verify infinite scroll on desktop (grid and list)
    - [ ] Verify infinite scroll on mobile
    - [ ] Verify counts are accurate
