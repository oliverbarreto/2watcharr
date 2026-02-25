# Implementation Plan - Channel Statistics Charts

Add a new "Channels" tab to the statistics page to visualize video stats per channel, including trends for added/watched videos, favorites, priority, and likes.

## Proposed Changes

### [Backend] Media Service
#### [MODIFY] [media.service.ts](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/lib/services/media.service.ts)
- Update [toggleLikeStatus](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/lib/services/media.service.ts#309-324) to record `liked`, `disliked`, or `like_reset` events in `media_events`.
- Update [setPriority](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/lib/services/media.service.ts#325-335) to record `priority_high`, `priority_normal`, or `priority_low` events.
- Update `UpdateEpisodeDto` and `MediaEventType` if needed to include these new event types.

### [Backend] Stats Service
#### [MODIFY] [stats.service.ts](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/lib/services/stats.service.ts)
- Update [DashboardStats](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/lib/services/stats.service.ts#4-46) interface to include `channelsTimeSeries`.
- Implement `getChannelsTimeSeries(userId, period)` which returns time series data for multiple metrics:
    - `added`: based on `added` events.
    - `watched`: based on `watched` events.
    - `favorited`: based on `favorited` events.
    - `priority`: based on `priority_high` events (and fallback to `episodes.priority` grouped by `created_at` for historical data).
    - `liked`: based on `liked` events (and fallback to `episodes.like_status` grouped by `created_at`).
    - `disliked`: based on `disliked` events (and fallback to `episodes.like_status` grouped by `created_at`).
- Update [getDashboardStats](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/lib/services/stats.service.ts#50-68) to include the new channel stats.

### [Frontend] Stats Page
#### [MODIFY] [page.tsx](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/app/stats/page.tsx)
- Add a new "Channels" tab to the `Tabs` component.
- Implement state for:
    - `visibleChannels`: Array of channel names to display in the chart.
    - `channelMetric`: Currently selected metric ('added', 'watched', 'favorited', 'priority', 'liked', 'disliked').
- Implement "Videos per Channel" chart using `recharts.LineChart`.
- Add a control panel with:
    - Radio Group for selecting the metric.
    - "Select All" and "Deselect All" buttons for channels.
    - Checkbox list for individual channel selection.

## Verification Plan

### Automated Tests
- No new automated tests planned for UI, but I will verify the API response format via terminal if possible.

### Manual Verification
1.  Navigate to the Stats page.
2.  Switch to the new "Channels" tab.
3.  Verify that channels are listed correctly.
4.  Toggle between different metrics (added, watched, etc.) and verify the chart updates.
5.  Use "Select All" and "Deselect All" to test bulk visibility changes.
6.  Select/Deselect individual channels.
7.  Check different time periods (day, week, month, year, total) and verify data consistency.
8.  Perform actions (like, favorite, change priority) and verify that new events are tracked (if they appear in the trend for the current day).
