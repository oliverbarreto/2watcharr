# Task: Archive Feature Fixes

- [x] Modify "Archive Watched Episodes" criteria <!-- id: 0 -->
    - [x] Analyze current implementation in [src/app/watchnext/page.tsx](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/app/watchnext/page.tsx) and [MediaService](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/lib/services/media.service.ts#16-625) <!-- id: 1 -->
    - [x] Update frontend to pass correct criteria or update backend logic <!-- id: 2 -->
    - [x] Update backend to filter by watched AND priority <!-- id: 3 -->
- [x] Fix unarchive error on "Archived" page <!-- id: 4 -->
    - [x] Investigate why unarchiving fails in [episode-card.tsx](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/components/features/episodes/episode-card.tsx) and [episode-list-row.tsx](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/components/features/episodes/episode-list-row.tsx) <!-- id: 5 -->
    - [x] Check API endpoint for single episode unarchiving <!-- id: 6 -->
    - [x] Implement fix for unarchive functionality <!-- id: 7 -->
- [x] Verification <!-- id: 8 -->
    - [x] Verify "Archive Watched" only archives priority episodes <!-- id: 9 -->
    - [x] Verify single episode unarchive works in list and grid view <!-- id: 10 -->
