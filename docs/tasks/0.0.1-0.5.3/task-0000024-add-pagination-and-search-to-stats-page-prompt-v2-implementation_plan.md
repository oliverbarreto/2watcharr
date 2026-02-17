# Implementation Plan: Add Debounce to Search Input

Add debouncing to the search functionality in the stats table to improve user experience and performance.

## Proposed Changes

### [Component] [StatsPage](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/app/stats/page.tsx)

#### [MODIFY] [page.tsx](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/app/stats/page.tsx)
- Introduce a new state variable `debouncedSearchQuery`.
- Use a `useEffect` hook with a `setTimeout` to update `debouncedSearchQuery` 300ms after the user stops typing in the `searchQuery` field.
- Update the filtering logic to depend on `debouncedSearchQuery` instead of `searchQuery`.
- Ensure the search input field remains responsive by continuing to use `searchQuery` as its value.

## Verification Plan

### Manual Verification
1. Navigate to http://localhost:3000/stats.
2. Type quickly in the search box (e.g., "Podcast").
3. Observe that the table results do not flicker or filter for every single keystroke.
4. Verify that the results update approximately 300ms after you stop typing.
5. Verify that clearing the search box also updates the results after the debounce delay.
6. Verify that pagination still works correctly with the debounced search.
