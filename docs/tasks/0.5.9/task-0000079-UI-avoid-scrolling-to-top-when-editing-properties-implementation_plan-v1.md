# Implementation Plan: Prevent scroll-to-top when saving episode properties

The page currently scrolls to the top because the [EpisodeList](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/components/features/episodes/episode-list.tsx#56-351) component enters a full loading state (showing skeletons) whenever an episode is updated. This causes the entire list to be removed and re-added to the DOM, losing the scroll position.

I will implement a "silent refresh" mechanism that updates the data without triggering the full-page loading skeleton.

## Proposed Changes

### [Episodes Component]

#### [MODIFY] [episode-list.tsx](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/components/features/episodes/episode-list.tsx)

- Update `fetchEpisodes` to accept an optional `silent` parameter.
- When `silent` is true, avoid setting `loading(true)` or `loadingMore(true)`.
- Update [handleUpdate](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/components/features/episodes/episode-list.tsx#229-230) to call `fetchEpisodes` with `silent: true`.
- Keep `onDelete` as a full update for now, or consider making it silent as well if it feels better. The user specifically complained about "editing properties" (liked, priority), so I'll focus on these.

## Verification Plan

### Automated Tests
- No existing automated UI tests found that cover scrolling behavior. Manual verification is more appropriate for this UX issue.

### Manual Verification
1. Open the watchlist page.
2. Scroll down to an episode in the middle or bottom of the page.
3. Edit a property (e.g., toggle "Like" or "Priority").
4. Observe that the property updates and a toast appears, but the page does NOT scroll to the top.
5. The episode should remain in view.
6. Verify this behavior both in Grid and List views.
7. Verify that the initial page load still shows the skeleton loader as expected.
