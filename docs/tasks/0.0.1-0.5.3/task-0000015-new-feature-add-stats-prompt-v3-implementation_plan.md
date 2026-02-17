# Implementation Plan - Stats Feature

This plan outlines the steps to implement a comprehensive Stats feature, including total counts, usage statistics, and play time tracking, along with a new "pending confirmation" watch state.

## User Review Required

> [!IMPORTANT]
> - We are introducing a new `watch_status` column in the `episodes` table to support the "pending" state.
> - A new setting "Watch Action" will be added to the General settings to control the behavior when clicking a video.

## Proposed Changes

### Database & Models

#### [MODIFY] [schema.sql](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/lib/db/schema.sql)
- Add `watch_status` TEXT column to `episodes` table (default 'unwatched').
- Add index on `watch_status`.

#### [MODIFY] [models.ts](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/lib/domain/models.ts)
- Update [MediaEpisode](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/lib/domain/models.ts#30-61) interface to include `watchStatus: 'unwatched' | 'pending' | 'watched'`.
- Update [MediaEventType](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/lib/domain/models.ts#7-8) to include `'tagged'` and `'pending'`.

### Service Layer

#### [MODIFY] [episode.repository.ts](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/lib/repositories/episode.repository.ts)
- Update CRUD operations to handle `watch_status`.
- Update filters to support `watch_status`.

#### [MODIFY] [media.service.ts](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/lib/services/media.service.ts)
- Update [updateTags](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/lib/services/media.service.ts#250-264) to record `'tagged'` event.
- Add methods for handling `'pending'` status.

#### [NEW] [stats.service.ts](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/lib/services/stats.service.ts)
- Implement methods to calculate:
    - Total counts (videos, podcasts, channels, tags).
    - Usage stats (added, watched, favorited, removed, tagged) by period (day, week, month).
    - Play time stats (total, average, temporal breakdown).

### API Layer

#### [MODIFY] [api/episodes/[id]/route.ts](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/app/api/episodes/%5Bid%5D/route.ts)
- Update to support patching `watchStatus`.

#### [NEW] [api/stats/route.ts](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/app/api/stats/route.ts)
- GET endpoint to retrieve stats for the current user.

### UI Components

#### [MODIFY] [settings/page.tsx](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/app/settings/page.tsx)
- Add "Watch Action" setting: "None", "Mark as Watched", "Mark as Pending".

#### [MODIFY] [episode-card.tsx](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/components/features/episodes/episode-card.tsx)
- Check "Watch Action" setting on click.
- Show "Pending" badge and "Confirm Watch" button if status is pending.

#### [MODIFY] [filter-bar.tsx](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/components/features/episodes/filter-bar.tsx)
- Add "Pending" option to watched filter.

#### [NEW] [stats/page.tsx](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/app/stats/page.tsx)
- Dashboard showing various statistics using charts and cards.

#### Pending Status Flow Refinement

We will improve the interaction for the "Pending Confirmation" state to make it more intuitive and ensure it triggers as expected.

### [Component] Episode Card
- [MODIFY] [episode-card.tsx](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/components/features/episodes/episode-card.tsx)
    - Add a "Confirm" button directly in the thumbnail overlay for "Pending" episodes.
    - Change the main action button variant to `default` (colored) when in "Pending" state to increase prominence.
    - Default the `watchAction` to `pending` if not found in `localStorage`.

### [Component] Settings
- [MODIFY] [page.tsx](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/app/settings/page.tsx)
    - Change the initial state of `watchAction` to `pending`.

## Verification Plan

### Automated Tests
- Run `npm test` to ensure existing functionality remains intact.
- Add unit tests for [StatsService](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/lib/services/stats.service.ts#31-151).

### Manual Verification
- Mark videos as watched/pending and verify they appear correctly in stats.
- Change "Watch Action" setting and verify behavior when clicking video cards.
- Verify stats dashboard correctly reflects usage over different time periods.
- Click on an unwatched video. Verify it opens and immediately changes status to "Pending" (pulsing overlay).
- Click the "Confirm" button on the thumbnail overlay. Verify status changes to "Watched".
- Click the "Confirm Watched" button in the action area. Verify status changes to "Watched".
- Verify that the Stats page updates correctly (Watched count increases, Activity Timeline shows the event).
- Change "Watch Action" setting and verify behavior when clicking video cards.
- Verify stats dashboard correctly reflects usage over different time periods.

## Stats Page UI Enhancements (shadcn/ui Charts)

We will replace the basic CSS bars Chart with a professional Area Chart from shadcn/ui.

### Dependencies
- [NEW] Install `recharts`

### [Component] UI
- [NEW] [chart.tsx](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/components/ui/chart.tsx)
    - Re-implementation of shadcn/ui's chart primitives (Container, Tooltip, Legend).

### [Component] Stats Page
- [MODIFY] [stats/page.tsx](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/app/stats/page.tsx)
    - Replace the custom [ActivityChart](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/app/stats/page.tsx#309-342) with the new `AreaChart` using shadcn components.
    - Implement a rich tooltip showing both "Added" and "Watched" data points.
    - Add smooth animations and gradients.
