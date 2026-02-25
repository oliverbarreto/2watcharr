# Task: Archive Feature Fixes

- [x] Modify "Archive Watched Episodes" criteria <!-- id: 0 -->
    - [x] Analyze current implementation in [src/app/watchnext/page.tsx](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/app/watchnext/page.tsx) and [MediaService](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/lib/services/media.service.ts#16-622) <!-- id: 1 -->
    - [ ] Update frontend to pass correct criteria or update backend logic <!-- id: 2 -->
    - [ ] Update backend to filter by watched AND priority <!-- id: 3 -->
- [/ ] Fix unarchive error on "Archived" page <!-- id: 4 -->
    - [x] Investigate why unarchiving fails in [episode-card.tsx](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/components/features/episodes/episode-card.tsx) and [episode-list-row.tsx](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/components/features/episodes/episode-list-row.tsx) <!-- id: 5 -->
    - [x] Check API endpoint for single episode unarchiving <!-- id: 6 -->
    - [ ] Implement fix for unarchive functionality <!-- id: 7 -->
- [ ] Verification <!-- id: 8 -->
    - [ ] Verify "Archive Watched" only archives priority episodes <!-- id: 9 -->
    - [ ] Verify single episode unarchive works in list and grid view <!-- id: 10 -->
