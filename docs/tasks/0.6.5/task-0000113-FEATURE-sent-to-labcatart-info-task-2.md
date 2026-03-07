# Task: LabcastARR Info Features

## Feature 1: Episode Card "Sent to LabcastARR" indicator

- [ ] Add `sentToLabcastarrAt` optional field to [MediaEpisode](file:///Users/oliver/local/dev/2watcharr/src/lib/domain/models.ts#62-100) interface in [models.ts](file:///Users/oliver/local/dev/2watcharr/src/lib/domain/models.ts)
- [ ] Update episode repository/DB query to include the sent-to-labcastarr data from notifications table
- [ ] Update [episode-card.tsx](file:///Users/oliver/local/dev/2watcharr/src/components/features/episodes/episode-card.tsx) to show "Sent to LabcastARR" text with purple color after the event date
- [ ] Update [episode-list-row.tsx](file:///Users/oliver/local/dev/2watcharr/src/components/features/episodes/episode-list-row.tsx) same display (if it shows the same metadata)

## Feature 2: Stats page Activity Summary metric

- [x] Add `sentToLabcastarr` field to `usage` in [DashboardStats](file:///Users/oliver/local/dev/2watcharr/src/app/stats/page.tsx#63-114) interface in [stats.service.ts](file:///Users/oliver/local/dev/2watcharr/src/lib/services/stats.service.ts)
- [x] Update [getUsage()](file:///Users/oliver/local/dev/2watcharr/src/lib/services/stats.service.ts#101-142) in [stats.service.ts](file:///Users/oliver/local/dev/2watcharr/src/lib/services/stats.service.ts) to query `notifications` table for count of `EPISODE_SENT_TO_LABCASTARR_COMPLETED`
- [x] Update [DashboardStats](file:///Users/oliver/local/dev/2watcharr/src/app/stats/page.tsx#63-114) interface in [stats/page.tsx](file:///Users/oliver/local/dev/2watcharr/src/app/stats/page.tsx) to include `sentToLabcastarr`
- [x] Add [UsageItem](file:///Users/oliver/local/dev/2watcharr/src/app/stats/page.tsx#1270-1283) for "Sent to LabcastARR" in Activity Summary section of [stats/page.tsx](file:///Users/oliver/local/dev/2watcharr/src/app/stats/page.tsx)
