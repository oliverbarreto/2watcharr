# Implementation Plan - Add Total Queue Time to Watch Next Page

Add the total duration of unwatched episodes to the "Watch Next" page header, formatted as "Queue time: Xh Ym".

## Proposed Changes

### Backend

#### [MODIFY] [episode.repository.ts](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/lib/repositories/episode.repository.ts)
- Add or modify a method to calculate the total duration of unwatched episodes matching the current filters.
- I will modify [countAll](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/lib/repositories/episode.repository.ts#298-398) to return both count and total duration, or add a new method `getFilterStats`. Choosing to add `getFilterStats` to keep [countAll](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/lib/repositories/episode.repository.ts#298-398) simple.

#### [MODIFY] [media.service.ts](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/lib/services/media.service.ts)
- Update [listEpisodes](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/lib/services/media.service.ts#141-153) to call `getFilterStats` and include `totalDuration` in the return object.

#### [MODIFY] [route.ts](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/app/api/episodes/route.ts)
- Update the GET handler to include `totalDuration` in the JSON response.

---

### Frontend

#### [MODIFY] [episode-list.tsx](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/components/features/episodes/episode-list.tsx)
- Update `onCountChange` callback to include `totalDuration`: `onCountChange(current: number, total: number, totalDuration: number)`.
- Update state and fetch logic to handle `totalDuration` from the API response.

#### [MODIFY] [page.tsx](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/app/watchnext/page.tsx)
- Update `handleCountChange` to store `totalDuration`.
- Implement a utility function `formatQueueTime(seconds: number)` to format seconds into "Xh Ym" or "Ym".
- Update the header UI to display "Queue time: ..." next to the episode count.

---

## Verification Plan

### Automated Tests
- Run `npm test src/lib/services/media.service.filter.test.ts` after adding a test case that checks for `totalDuration` in the [listEpisodes](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/lib/services/media.service.ts#141-153) response.

### Manual Verification
1. Open the "Watch Next" page.
2. Verify that "Queue time" is displayed next to "Showing X of Y prioritized episodes".
3. Add a new episode with a known duration and verify the queue time increases correctly.
4. Mark an episode as watched and verify the queue time decreases correctly.
5. Apply various filters (tags, channels) and verify the queue time updates to match only the unwatched episodes in the filtered list.
6. Verify the formatting:
    - 65 seconds -> "1m"
    - 3600 seconds -> "1h"
    - 3660 seconds -> "1h 1m"
