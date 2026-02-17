# Implementation Plan - Watchlist Section Titles Improvement

The goal is to update the watchlist page section titles to include the day of the week for dates within the current week (Monday-Sunday). "Today" and "Yesterday" labels will also be updated to include the full date in parentheses.

## Proposed Changes

### Core Logic
#### [MODIFY] [date-grouping.ts](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/lib/utils/date-grouping.ts)
- Import `isSameWeek` from `date-fns`.
- Update [formatDateLabel](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/lib/utils/date-grouping.ts#45-63) to:
    - Determine if the date is in the current week (starting Monday).
    - If today: `today (DayOfWeek Month Day, Year)`
    - If yesterday: `yesterday (DayOfWeek Month Day, Year)`
    - If current week: `DayOfWeek Month Day, Year`
    - Otherwise: `Month Day, Year`

### Tests
#### [MODIFY] [date-grouping.test.ts](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/lib/utils/date-grouping.test.ts)
- Update existing tests for [formatDateLabel](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/lib/utils/date-grouping.ts#45-63) to match the new format.
- Add new test cases for different days of the current week.
- Add test cases for dates outside the current week.

## Verification Plan

### Automated Tests
- Run vitest for the date-grouping utility:
  ```bash
  npm test src/lib/utils/date-grouping.test.ts
  ```

### Manual Verification
- I will simulate different dates in the unit tests to ensure the logic handles week boundaries correctly (Monday start).
- Since I cannot easily change the system clock or "see" the UI in real-time with specific data without significant setup, the unit tests will be the primary source of truth.
- I will verify that the episode count (n episodes) is still correctly appended by [GroupedEpisodeList](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/components/features/episodes/grouped-episode-list.tsx#18-78) (it shouldn't be affected as it's rendered separately in [grouped-episode-list.tsx](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/components/features/episodes/grouped-episode-list.tsx)).
