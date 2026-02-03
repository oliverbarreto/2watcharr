# Extend Stats Page Functionality

Extend the statistics page to support multiple time ranges (Day, Week, Month, Year, Total) using a Radio Group for selection and adding a data table for detailed stats.

## Proposed Changes

### Backend

#### [MODIFY] [stats.service.ts](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/lib/services/stats.service.ts)
- Update [getDashboardStats](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/lib/services/stats.service.ts#40-56) to accept 'total' in options.
- Update [getUsage](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/lib/services/stats.service.ts#78-108) to handle 'total' (no threshold) and fix 'year' to be the start of the current calendar year.
- Update [getActivityTimeSeries](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/lib/services/stats.service.ts#142-207) to:
    - Accept `period` parameter.
    - Change SQL query to group data based on the period:
        - `day`: Group by hour (last 24h).
        - `week`: Group by day (last 7 days).
        - `month`: Group by day (last 30 days).
        - `year`: Group by month (current year).
        - `total`: Group by month (all time).
- Add `getDetailedStatsTable(userId, period)` method to return data for the new table.

#### [MODIFY] [route.ts](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/app/api/stats/route.ts)
- Update validation to allow 'total' period.

### Frontend

#### [NEW] [radio-group.tsx](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/components/ui/radio-group.tsx)
- Install/Create the Shadcn Radio Group component.

#### [NEW] [table.tsx](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/components/ui/table.tsx)
- Install/Create the Shadcn Table component.

#### [MODIFY] [page.tsx](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/app/stats/page.tsx)
- Move the `period` selection logic from the global header to the `Activity Trend` chart card header.
- Use the Shadcn [Select](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/components/ui/select.tsx#9-14) component instead of [RadioGroup](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/components/ui/radio-group.tsx#9-21).
- Ensure the dropdown selection updates the global `period` state, which triggers a data refresh for all components on the page.
- Add "Total" option to the [Select](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/components/ui/select.tsx#9-14) component.
- Maintain the visual style of the chart and table.
- Add `sortConfig` state to track the current column and direction for sorting the history table.
- Implement a `sortedDetailedStats` computed value that applies sorting to `stats.detailedStats`.
- Update [TableHead](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/components/ui/table.tsx#65-77) components to include `ArrowUpDown` icons and click handlers to toggle sorting.
- Maintain visual consistency with the rest of the application.

## Verification Plan

### Automated Tests
- No existing tests specifically for stats API found, but I will check `src/__tests__` if it exists.
- I will run `npm run lint` to ensure no regressions.

### Manual Verification
- Navigate to `/stats`.
- Toggle between Day, Week, Month, Year, and Total.
- Verify that the chart data changes correctly for each.
- Verify that the table displays correct data corresponding to the selected period.
- Check visual consistency with the rest of the application.
- Click on table headers (Title, Type, Action, Date) to sort the history list.
- Verify that sorting toggles between Ascending, Descending, and Default.
- Check that sorting works correctly across different time ranges.
