# Floating Bubble for Infinite Scroll Counts

Add a floating bubble at the bottom left of the watchlist page that shows the number of episodes currently loaded versus the total number of episodes. This bubble will appear when the user reaches the bottom of the page and disappear after 5 seconds.

## Proposed Changes

### [Component] [episode-list.tsx](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/components/features/episodes/episode-list.tsx)

- Add state `showBubble` (boolean) and `bubbleTimer` (ref).
- Add logic to show the bubble when `loadingMore` becomes true or when the infinite scroll observer triggers.
- Implement a 5-second timeout to hide the bubble after it appears.
- Add the bubble UI at the bottom of the component using fixed positioning.
- Use Tailwind CSS transitions for a subtle fade-in and slide-up animation.

## Verification Plan

### Manual Verification
1. Open the watchlist page.
2. Scroll to the bottom to trigger infinite scroll.
3. Verify that a floating bubble appears at the bottom left showing "Showing X of Y episodes".
4. Verify that the bubble disappears after 5 seconds.
5. Verify that the bubble correctly updates if triggered again.
6. Check the design on mobile to ensure it doesn't overlap with other elements.
