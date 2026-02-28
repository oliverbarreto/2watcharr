# Implementation Plan - Stats Page Enhancements

We will restructure the stats page to include tabs, a new "Videos by Tags" chart, and additional metrics for "Today" and "This Week".

## User Review Required

> [!IMPORTANT]
> The "Activity Summary" section will be reorganized from a vertical list into a 3-column grid to accommodate new "Today" and "This Week" metrics while maintaining existing usage stats.

## Proposed Changes

### Backend: Stats Service

#### [MODIFY] [stats.service.ts](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/lib/services/stats.service.ts)
- Update [DashboardStats](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/lib/services/stats.service.ts#4-39) interface to include `todaySeconds` in `playTime`, and `watchedToday`, `watchedThisWeek` in `usage`.
- Add `tagsTimeSeries` to [DashboardStats](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/lib/services/stats.service.ts#4-39) and implement `getTagsTimeSeries(userId, period)` to fetch watched video counts grouped by tag and date.
- Update [getPlayTimeStats](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/lib/services/stats.service.ts#114-146) to calculate viewing time for "Today".
- Update [getUsage](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/lib/services/stats.service.ts#81-113) to calculate watched counts for "Today" and "This Week".

---

### Frontend: Stats Page

#### [MODIFY] [page.tsx](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/app/stats/page.tsx)
- Update [DashboardStats](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/lib/services/stats.service.ts#4-39) interface.
- Implement `Tabs` from `@/components/ui/tabs`.
- **Restructure Sections:**
    - Add "Today" card to "Viewing Time" section.
    - Move "Activity Summary" below "Viewing Time".
    - Change "Activity Summary" to a 3-column grid.
    - Add "Watched Today" and "Watched This Week" cards to "Activity Summary".
- **Tabs Content:**
    - **Activity Tab:** Contains the existing "Activity Trend" chart.
    - **Tags Tab:** Contains the new "Videos by Tags" chart.
        - Implement a multi-line linear chart.
        - Add a tag selection UI to filter which tags are displayed.
    - **Events History Tab:** Contains the "Detailed History" table with search and pagination.

---

### UI Components

- Use `AreaChart` or `LineChart` from `recharts` for the Tags chart.
- Ensure the tabs container takes the full horizontal space as requested.

## Verification Plan

### Automated Tests
- I will check if there are existing tests for [StatsService](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/lib/services/stats.service.ts#40-266) and add a new test case if possible to verify the new metrics calculations.
- Run `npm run lint` to ensure no regressions.

### Manual Verification
- **Stats Page:**
    - Verify that "Today" viewing time is displayed correctly.
    - Verify the 3-column layout of "Activity Summary".
    - Toggle between tabs (Activity, Tags, Events History) and ensure content is displayed correctly.
    - In the "Tags" tab:
        - Verify the chart displays data for selected tags.
        - Test selecting/deselecting tags to see the chart update.
    - Verify pagination in the "Events History" tab still works as expected.
