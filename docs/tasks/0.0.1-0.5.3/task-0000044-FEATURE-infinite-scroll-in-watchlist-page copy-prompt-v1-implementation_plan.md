# Implementation Plan - Infinite Scroll in Watch List Page

Implement infinite scroll in the Watch List page to improve performance and provide a better user experience, similar to the YouTube home page.

## Proposed Changes

### Domain Models
#### [MODIFY] [models.ts](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/lib/domain/models.ts)
- Add `PaginationOptions` interface with `limit` and `offset`.
- Update [EpisodeFilters](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/lib/domain/models.ts#137-148) if necessary, though it might be better to keep pagination separate.

### Repository Layer
#### [MODIFY] [episode.repository.ts](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/lib/repositories/episode.repository.ts)
- Update [findAll](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/lib/repositories/episode.repository.ts#104-232) to accept `PaginationOptions`.
- Implement SQL `LIMIT` and `OFFSET`.
- Add a new method `countAll` to return the total number of episodes matching the filters.

### Service Layer
#### [MODIFY] [media.service.ts](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/lib/services/media.service.ts)
- Update [listEpisodes](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/lib/services/media.service.ts#118-127) to accept optional `PaginationOptions`.
- Return an object `{ episodes: MediaEpisode[], total: number }` instead of just an array.

### API Layer
#### [MODIFY] [route.ts](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/app/api/episodes/route.ts)
- Parse `limit` and `offset` from query parameters.
- Call updated `mediaService.listEpisodes`.
- Return the total count in the response.

### Frontend Components
#### [MODIFY] [episode-list.tsx](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/components/features/episodes/episode-list.tsx)
- Add state for `currentPage`, `hasMore`, and `totalCount`.
- Modify `fetchEpisodes` to support appending episodes when `offset > 0`.
- Implement `IntersectionObserver` to trigger loading next page.
- Add a loading spinner at the bottom of the list.
- Handle view mode changes (reset pagination when filters or sort change).

#### [MODIFY] [page.tsx](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/app/page.tsx)
- Pass a callback or use an event/state to get the `totalCount` and `currentCount` from [EpisodeList](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/components/features/episodes/episode-list.tsx#45-220).
- Display "Showing X of Y episodes" below the header.

## Verification Plan

### Automated Tests
- Run updated repository tests to ensure pagination works correctly.
- Add a new test case for pagination in [episode.repository.test.ts](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/lib/repositories/episode.repository.test.ts).
- `npm test src/lib/repositories/episode.repository.test.ts`

### Manual Verification
- Open the Watch List page.
- Scroll to the bottom and verify that more episodes are loaded.
- Verify that the loading indicator is visible while fetching more episodes.
- Verify that the total count and current count are displayed correctly.
- Verify that it works in both Grid and List views.
- Verify that it works on mobile screens.
- Verify that filtering and sorting reset the infinite scroll state.
