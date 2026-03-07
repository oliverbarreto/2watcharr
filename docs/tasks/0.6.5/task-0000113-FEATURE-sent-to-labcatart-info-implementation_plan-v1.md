# LabcastARR Info Features

Show users when episodes have been sent to LabcastARR: (1) on the episode card itself, and (2) as a metric in the Stats page Activity Summary.

## Proposed Changes

### Episode Card – "Sent to LabcastARR" Indicator

The `notifications` table already stores `EPISODE_SENT_TO_LABCASTARR_COMPLETED` records with `episode_id`. We need to surface this on the episode card.

**Approach:** Fetch the latest successful LabcastARR notification for an episode as part of the episode data returned by the API, then display it in the card metadata row.

---

#### [MODIFY] [models.ts](file:///Users/oliver/local/dev/2watcharr/src/lib/domain/models.ts)

Add optional `sentToLabcastarrAt?: number` field to [MediaEpisode](file:///Users/oliver/local/dev/2watcharr/src/lib/domain/models.ts#62-99) interface. This will hold the Unix timestamp of the latest `EPISODE_SENT_TO_LABCASTARR_COMPLETED` notification for that episode.

---

#### [MODIFY] Episode repositories / API endpoint

The episodes API must return this new field. We need to find where episodes are fetched and add a query or join to pull the latest LabcastARR completion notification for each episode.

> [!NOTE]
> Need to check `src/lib/repositories/` or `src/app/api/episodes/` to find where the episode SELECT queries live and add a LEFT JOIN / subquery on the `notifications` table.

---

#### [MODIFY] [episode-card.tsx](file:///Users/oliver/local/dev/2watcharr/src/components/features/episodes/episode-card.tsx)

In the metadata row (lines ~649-673), after the `formatEventDate()` span, add a check for `episode.sentToLabcastarrAt` and render:

```tsx
{episode.sentToLabcastarrAt && (
    <>
        <span>•</span>
        <span className="text-purple-600 font-medium flex items-center gap-1">
            <Mic className="h-3 w-3" />
            Sent to LabcastARR
        </span>
    </>
)}
```

Use the same `text-purple-600` color used for the podcast Mic icon in the `/channels` filter bar.

---

#### [MODIFY] [episode-list-row.tsx](file:///Users/oliver/local/dev/2watcharr/src/components/features/episodes/episode-list-row.tsx)

Check and add the same metadata display in the list row view (if it shows similar channel/date metadata).

---

### Stats Page – Activity Summary Metric

The `getUsage()` method in `stats.service.ts` currently counts events from the `media_events` table. LabcastARR sends are tracked in the `notifications` table instead.

---

#### [MODIFY] [stats.service.ts](file:///Users/oliver/local/dev/2watcharr/src/lib/services/stats.service.ts)

1. Add `sentToLabcastarr: number` to the `DashboardStats.usage` interface
2. In `getUsage()`, add a query against the `notifications` table:
   ```sql
   SELECT COUNT(*) as count 
   FROM notifications 
   WHERE user_id = ? 
     AND type = 'EPISODE_SENT_TO_LABCASTARR_COMPLETED' 
     AND created_at >= ?
   ```
3. Include the result in the returned usage object.

---

#### [MODIFY] [stats/page.tsx](file:///Users/oliver/local/dev/2watcharr/src/app/stats/page.tsx)

1. Add `sentToLabcastarr: number` to the local `DashboardStats.usage` interface
2. Add import for `Send` icon from lucide-react (or use `Mic` icon for visual consistency)
3. Add a new `UsageItem` in the Activity Summary grid:
   ```tsx
   <UsageItem 
       label="Sent to LabcastARR" 
       value={stats.usage.sentToLabcastarr} 
       icon={<Mic className="h-4 w-4" />} 
       color="text-purple-600"
       bg="bg-purple-600/10"
   />
   ```

## Verification Plan

### Manual Verification

1. Start the dev server with `npm run dev` in `/Users/oliver/local/dev/2watcharr`
2. Navigate to the home page (episode list)
3. For an episode that has been sent to LabcastARR, verify its card shows "• Sent to LabcastARR" text in purple after the date
4. Navigate to `/stats` and verify the Activity Summary shows a new "Sent to LabcastARR" metric with correct count
