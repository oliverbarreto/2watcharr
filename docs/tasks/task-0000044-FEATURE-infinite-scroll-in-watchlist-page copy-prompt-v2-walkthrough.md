# Walkthrough - Infinite Scroll in Watch List Page

I have implemented infinite scroll in the Watch List page to improve performance and user experience. The page now loads episodes in batches of 100 and automatically fetches more as you scroll down.

## Changes Made

### Backend (Pagination Support)
- **EpisodeRepository**: Added support for `LIMIT` and `OFFSET` in [findAll](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/lib/repositories/episode.repository.ts#105-244) and implemented a [countAll](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/lib/repositories/episode.repository.ts#245-317) method to get the total number of episodes.
- **MediaService**: Updated [listEpisodes](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/lib/services/media.service.ts#119-131) to return both the list of episodes and the total count.
- **API Route**: Updated `/api/episodes` to parse `limit` and `offset` query parameters and return the total count in the response.

### Frontend (Infinite Scroll & Episode Counts)
- **EpisodeList**: 
  - Implemented infinite scroll using `IntersectionObserver`.
  - Added a "Loading more..." indicator at the bottom of the list.
  - Added an `onCountChange` callback to report the current and total episode counts to the parent component.
- **Watch List Page**:
  - Displays "Showing X of Y episodes" right after the header description.
  - Correctly handles infinite scrolling in both **Grid View** and **List View**.
  - Optimized to prevent infinite update loops during re-renders.

## Verification Results

### Automated Tests
- Created [src/lib/repositories/episode.repository.pagination.test.ts](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/lib/repositories/episode.repository.pagination.test.ts) to verify pagination and counting.
- All repository tests passed.

### Large Scale Manual Verification
To ensure the infinite scroll handles large amounts of data, I generated **200 mock episodes** with a `TEST-SCROLL` tag. 

I then verified the following:
1.  **Batch Loading**: The page initially loads 100 episodes.
2.  **Scroll Trigger**: Scrolling to the bottom correctly triggers the next batch of 100 episodes.
3.  **Count Display**: The "Showing X of Y" text updates correctly as new batches are fetched.
4.  **Stability**: Both **Grid View** and **List View** maintain accurate counts and smooth scrolling transitions.

![Large Dataset Verification](/Users/oliver/.gemini/antigravity/brain/c708e17f-8ead-4615-bd6e-b2d998d3ef54/verify_large_infinite_scroll_v3_1770459616167.webp)

> [!NOTE]
> The mock data can be easily identified and removed using the `TEST-SCROLL` tag when no longer needed.
