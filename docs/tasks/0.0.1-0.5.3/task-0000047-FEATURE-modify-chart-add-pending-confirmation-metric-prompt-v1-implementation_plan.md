# Implementation Plan - Add Pending Confirmation Metric to Stats Page

The goal is to extend the "Activity Summary" section of the stats page to include two new metrics:
1.  **Not Watched**: Episodes marked as 'unwatched' during the selected period.
2.  **Pending Confirmation**: Episodes marked as 'pending' during the selected period.

## Proposed Changes

### [Backend] Stats Service

I will update the [DashboardStats](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/lib/services/stats.service.ts#4-37) interface and the [getUsage](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/lib/services/stats.service.ts#79-109) method in the [StatsService](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/lib/services/stats.service.ts#38-262) to include the new metrics.

#### [MODIFY] [stats.service.ts](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/lib/services/stats.service.ts)
- Update [DashboardStats](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/lib/services/stats.service.ts#4-37) interface to include `unwatched` and `pending` in the `usage` object.
- Update [getUsage](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/lib/services/stats.service.ts#79-109) method to extract these counts from the `media_events` query.

### [Frontend] Stats Page

I will update the stats page to display the new metrics in the "Activity Summary" section.

#### [MODIFY] [page.tsx](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/app/stats/page.tsx)
- Update the local [DashboardStats](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/lib/services/stats.service.ts#4-37) interface.
- Add [UsageItem](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/app/stats/page.tsx#716-729) components for "Not Watched" and "Pending Confirmation" between "Watched" and "Favorited".
- Select appropriate icons (e.g., `CircleDashed` for pending, `Circle` or [Play](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/lib/services/stats.service.ts#110-142) variant for not watched).

## Verification Plan

### Automated Tests
- I'll run the existing stats tests if they exist. (Checking for tests now).
- I'll check if I can add a test case to [src/lib/services/stats.service.ts](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/lib/services/stats.service.ts) or a new test file.

### Manual Verification
- Open the stats page.
- Select different time periods (Day, Week, Month, etc.).
- Verify that "Not Watched" and "Pending Confirmation" show up in the "Activity Summary" section.
- Perform actions (mark as pending, mark as unwatched) and verify the counts update (might need a refresh or re-fetch).
- Check the layout consistency with the existing items.
