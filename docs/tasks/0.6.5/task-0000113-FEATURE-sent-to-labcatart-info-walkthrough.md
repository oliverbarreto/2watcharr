# LabcastARR Info Features Walkthrough

The following features have been successfully implemented to provide users with visibility into which episodes have been sent to LabcastARR.

## 1. Episode Card & List Row Indicaor

Episodes that have been successfully sent to LabcastARR now display a visual indicator directly on their cards and list rows.

*   **Models Update**: Modified the [MediaEpisode](file:///Users/oliver/local/dev/2watcharr/src/lib/domain/models.ts#62-100) interface to include an optional `sentToLabcastarrAt` timestamp field.
*   **Database Queries**: Updated [findAll](file:///Users/oliver/local/dev/2watcharr/src/lib/repositories/episode.repository.ts#132-309) and [findById](file:///Users/oliver/local/dev/2watcharr/src/lib/repositories/episode.repository.ts#85-119) in [EpisodeRepository](file:///Users/oliver/local/dev/2watcharr/src/lib/repositories/episode.repository.ts#18-772) to fetch the latest `EPISODE_SENT_TO_LABCASTARR_COMPLETED` event timestamp from the `notifications` table for each episode via a subquery.
*   **UI Components**: Updated [episode-card.tsx](file:///Users/oliver/local/dev/2watcharr/src/components/features/episodes/episode-card.tsx) and [episode-list-row.tsx](file:///Users/oliver/local/dev/2watcharr/src/components/features/episodes/episode-list-row.tsx) to conditionally render:
    *   A bullet separator `•`
    *   The `Mic` icon and text "Sent to LabcastARR"
    *   Styled in `text-purple-600` consistent with the podcast icon styling on the channels page.

## 2. Stats Page Activity Summary Metric

The "Activity Summary" section on the stats page now includes a dedicated metric for LabcastARR sends.

*   **Service Update**: Modified [getUsage()](file:///Users/oliver/local/dev/2watcharr/src/lib/services/stats.service.ts#100-134) in [StatsService](file:///Users/oliver/local/dev/2watcharr/src/lib/services/stats.service.ts#56-484) to execute a query against the `notifications` table counting all `EPISODE_SENT_TO_LABCASTARR_COMPLETED` events for the user within the selected time period.
*   **Interface Update**: Added the `sentToLabcastarr` field to the `DashboardStats['usage']` interface.
*   **UI Component**: Added a new [UsageItem](file:///Users/oliver/local/dev/2watcharr/src/app/stats/page.tsx#1277-1290) to the [stats/page.tsx](file:///Users/oliver/local/dev/2watcharr/src/app/stats/page.tsx) Activity Summary grid:
    *   **Label**: "Sent to LabcastARR"
    *   **Icon**: `Mic` icon
    *   **Color**: Purple (`text-purple-600` and `bg-purple-600/10`)

## Validation
Linting (`npm run lint`) and TypeScript compilation (`npm run type-check` equivalents) pass successfully. The Dev server (`npm run dev`) starts up cleanly. The user is encouraged to manually verify the UI by visiting the Home and Stats pages as the automated browser verification hit a service quota limit.
