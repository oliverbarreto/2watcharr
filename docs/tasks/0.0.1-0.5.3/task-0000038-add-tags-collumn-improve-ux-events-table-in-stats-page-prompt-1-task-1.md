# Task: Improve UX Events Table in Stats Page

## Research and Planning
- [x] Analyze codebase and database schema <!-- id: 0 -->
- [x] Investigate why podcasts and deleted episodes are missing from stats <!-- id: 1 -->
- [x] Design implementation plan for adding tags column and fixing issues <!-- id: 2 -->

## Implementation
- [ ] Update [StatsService](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/lib/services/stats.service.ts#37-236) to fetch tags and include deleted/podcast info correctly <!-- id: 3 -->
- [ ] Update [DashboardStats](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/lib/services/stats.service.ts#4-36) interface in frontend and backend <!-- id: 4 -->
- [ ] Improve UI/UX of the events table in [StatsPage](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/app/stats/page.tsx#85-611) <!-- id: 5 -->
  - [ ] Add Tags column <!-- id: 6 -->
  - [ ] Implement sorting by Tags <!-- id: 7 -->
  - [ ] Improve visual style for better UX <!-- id: 8 -->

## Verification
- [ ] Verify that podcast events are now showing up <!-- id: 9 -->
- [ ] Verify that soft-deleted episode events are showing up <!-- id: 10 -->
- [ ] Verify that tags are correctly displayed and sortable <!-- id: 11 -->
- [ ] Verify all other table columns are still sortable <!-- id: 12 -->
