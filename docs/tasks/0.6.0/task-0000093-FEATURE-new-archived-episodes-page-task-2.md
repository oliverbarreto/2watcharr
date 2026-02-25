# Task Breakdown: Implementation of Archive Feature

- [x] Initial Research and Planning
    - [x] Explore codebase to understand current episode management
    - [x] Identify database schema changes needed (if any)
    - [x] Design API endpoints for archiving/unarchiving
    - [x] Create implementation plan

- [ ] Backend Implementation [ ]
    - [ ] Update Database Schema (add `is_archived` and `archived_at`)
    - [ ] Implement API endpoints for archiving/unarchiving single and multiple episodes
    - [ ] Update [MediaService](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/lib/services/media.service.ts#16-534) to handle archiving logic with timestamps
- [ ] Frontend Implementation - New Page [ ]
    - [ ] Create `/archived` page with date grouping
    - [ ] Implement search and filter panel for archived page
    - [ ] Implement archiving/unarchiving UI in the new page
- [ ] Frontend Implementation - Watch Next Page [ ]
    - [ ] Add Archive button to `EpisodeCard` and `EpisodeListRow`
    - [ ] Add link to Archived page and "Archive Watched" button to [WatchNext](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/app/watchnext/page.tsx#263-278) header
    - [ ] Implement confirmation modals for archive actions

- [ ] Verification and Testing [ ]
    - [ ] Verify archiving from Watch Next page
    - [ ] Verify unarchiving from Archived page
    - [ ] Verify "Archive Watched" functionality
    - [ ] Regression testing for Watch Next page
