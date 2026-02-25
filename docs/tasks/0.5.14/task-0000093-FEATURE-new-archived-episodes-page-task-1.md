# Task Breakdown: Implementation of Archive Feature

- [x] Initial Research and Planning
    - [x] Explore codebase to understand current episode management
    - [x] Identify database schema changes needed (if any)
    - [x] Design API endpoints for archiving/unarchiving
    - [x] Create implementation plan

- [ ] Backend Implementation [ ]
    - [ ] Update Database Schema (add `isArchived` or similar flag)
    - [ ] Implement API endpoints for archiving/unarchiving single and multiple episodes
    - [ ] Update [MediaService](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/lib/services/media.service.ts#16-534) to handle archiving logic
- [ ] Frontend Implementation - New Page [ ]
    - [ ] Create `/archived` page to list archived episodes
    - [ ] Implement archiving/unarchiving UI in the new page
- [ ] Frontend Implementation - Watch Next Page [ ]
    - [ ] Add Archive button to `EpisodeCard` and `EpisodeListRow`
    - [ ] Add "Archive Watched" button to `FilterBar`
    - [ ] Implement confirmation modals for archive actions
- [ ] Verification and Testing [ ]
    - [ ] Verify archiving from Watch Next page
    - [ ] Verify unarchiving from Archived page
    - [ ] Verify "Archive Watched" functionality
    - [ ] Regression testing for Watch Next page
