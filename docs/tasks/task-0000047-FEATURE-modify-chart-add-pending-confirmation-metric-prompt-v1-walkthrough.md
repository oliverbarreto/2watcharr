# Walkthrough - New Metrics in Stats Page

I have added "Not Watched" and "Pending Confirmation" metrics to the "Activity Summary" section of the stats page.

## Changes Made

### Backend
- Updated [DashboardStats](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/app/stats/page.tsx#54-89) interface in [stats.service.ts](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/lib/services/stats.service.ts) to include `unwatched` and `pending` counts.
- Modified [getUsage](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/lib/services/stats.service.ts#81-113) method in [StatsService](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/lib/services/stats.service.ts#40-266) to calculate these metrics from the `media_events` table for the selected period.
- Fixed some pre-existing lint errors in [StatsService](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/lib/services/stats.service.ts#40-266).

### Frontend
- Updated the stats page [page.tsx](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/app/stats/page.tsx) to display the new metrics.
- Added new icons: `RotateCcw` for "Not Watched" and `CircleDashed` for "Pending Confirmation".
- Reordered the "Activity Summary" items to place the new metrics between "Watched" and "Favorited".

## Verification Results

### Backend Logic
I ran a test script [test-stats.ts](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/test-stats.ts) to verify that the [StatsService](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/lib/services/stats.service.ts#40-266) correctly calculates the new metrics.

**Output:**
```json
{
  "added": 208,
  "watched": 8,
  "favorited": 3,
  "removed": 3,
  "tagged": 1,
  "unwatched": 1,
  "pending": 5
}
```

### UI Changes
The "Activity Summary" section now looks like this (order):
1.  **Added** (Plus icon, Blue)
2.  **Watched** (Play icon, Green)
3.  **Not Watched** (RotateCcw icon, Orange)
4.  **Pending Confirmation** (CircleDashed icon, Cyan)
5.  **Favorited** (Star icon, Amber)
6.  **Tagged** (Tag icon, Indigo)
7.  **Removed** (Trash icon, Red)
