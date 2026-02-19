# Task: Add Stats Chart by Tags and Restructure Stats Page

## Restructuring
- [x] Reorder stats sections: Move "Activity Summary" below "Viewing Time"
- [x] Add "Today" stat to "Viewing Time" section
- [x] Add videos watched today/week to "Activity Summary"
- [x] Implement Tabs in Stats Page: Activity, Tags, Events History
- [x] Reorganize "Activity Summary" into 3 columns

## Backend
- [x] Update [StatsService](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/lib/services/stats.service.ts#47-351) with new metrics and `tagsTimeSeries`

## Charts
- [x] Implement "Videos by Tags" chart
    - [x] Create data fetching for tags distribution over time
    - [x] Add tag selection/deselection functionality
- [x] Move "Activity Trend" chart to Activity Tab

## Events History
- [x] Move Events History table to its own tab
- [x] Ensure pagination works in the new tab layout

## Layout Adjustments
- [x] Swap Tags chart and selection sider (Selection to the right on desktop, bottom on mobile)

## Verification
- [x] Run linting and fix errors
- [x] Verify layout responsiveness
- [x] Test chart filtering
- [x] Validate "Today" and "This Week" metrics

## Documentation
- [x] Create walkthrough documentation
