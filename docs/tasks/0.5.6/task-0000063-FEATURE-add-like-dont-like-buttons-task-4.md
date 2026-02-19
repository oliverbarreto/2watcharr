# Task: Add Like/Don't Like functionality for episodes

## Planning
- [x] Explore codebase for episode card, row, and filter components
- [x] Explore database schema and Prisma setup (SQLite/SQL actually)
- [x] Explore domain models and repositories
- [x] Explore API routes
- [x] Create implementation plan
- [x] Get user approval for the implementation plan

## Implementation
### Database and API
- [x] Update Prisma schema to include `liked` status for episodes (SQLite schema instead)
- [x] Run migration to add `like_status` column
- [x] Update domain models and DTOs
- [x] Update EpisodeRepository
- [x] Update server actions/API to handle updating `liked` status

### UI Components
- [x] Add thumb-up and thumb-down buttons to [EpisodeCard](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/components/features/episodes/episode-card.tsx#59-860) (grid view)
- [x] Add thumb-up and thumb-down buttons to [EpisodeListRow](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/components/features/episodes/episode-list-row.tsx#60-794) (list view)
- [x] Update dropdown menu in [EpisodeCard](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/components/features/episodes/episode-card.tsx#59-860) and [EpisodeListRow](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/components/features/episodes/episode-list-row.tsx#60-794) with Like/Don't Like options
- [x] Implement toggle logic for like/dislike buttons

### Filtering
- [x] Update [FilterBar](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/components/features/episodes/filter-bar.tsx#65-682) to include "liked" and "not liked" filters
- [x] Ensure filters correctly interact with the backend/API
- [x] Polish: Ensure "Clear All" button resets and accounts for Like/Dislike filters

## Verification
- [x] Verify database updates
- [x] Verify UI buttons and toggles
- [x] Verify dropdown menu options
- [x] Verify filtering functionality
- [x] Verify "Clear All" polish
- [x] Create walkthrough artifact
