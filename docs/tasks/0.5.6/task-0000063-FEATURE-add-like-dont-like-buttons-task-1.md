# Task: Add Like/Don't Like functionality for episodes

## Planning
- [x] Explore codebase for episode card, row, and filter components
- [x] Explore database schema and Prisma setup (SQLite/SQL actually)
- [x] Explore domain models and repositories
- [x] Explore API routes
- [x] Create implementation plan
- [ ] Get user approval for the implementation plan [/]

## Implementation
### Database and API
- [ ] Update Prisma schema to include `liked` status for episodes [ ]
- [ ] Run Prisma migration [ ]
- [ ] Update server actions/API to handle updating `liked` status [ ]

### UI Components
- [ ] Add thumb-up and thumb-down buttons to [EpisodeCard](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/components/features/episodes/episode-card.tsx#57-783) (grid view) [ ]
- [ ] Add thumb-up and thumb-down buttons to [EpisodeListRow](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/components/features/episodes/episode-list-row.tsx#58-763) (list view) [ ]
- [ ] Update dropdown menu in [EpisodeCard](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/components/features/episodes/episode-card.tsx#57-783) and [EpisodeListRow](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/components/features/episodes/episode-list-row.tsx#58-763) with Like/Don't Like options [ ]
- [ ] Implement toggle logic for like/dislike buttons [ ]

### Filtering
- [ ] Update [FilterBar](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/components/features/episodes/filter-bar.tsx#63-629) to include "liked" and "not liked" filters [ ]
- [ ] Ensure filters correctly interact with the backend/API [ ]

## Verification
- [ ] Verify database updates [ ]
- [ ] Verify UI buttons and toggles [ ]
- [ ] Verify dropdown menu options [ ]
- [ ] Verify filtering functionality [ ]
- [ ] Create walkthrough artifact [ ]
