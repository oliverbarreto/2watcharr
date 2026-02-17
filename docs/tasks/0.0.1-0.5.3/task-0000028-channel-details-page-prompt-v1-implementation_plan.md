# Implement Channel Details Page

We want to implement a new page to display the details of a youtube channel or podcast channel, including a header with channel information and a list of episodes.

## User Review Required

> [!IMPORTANT]
> I will be adding a new API endpoint `POST /api/channels/[id]/watch-status` to handle "mark all as watched/unwatched" actions. This will affect all episodes belonging to that channel for the current user.

## Proposed Changes

### Domain & Repositories

#### [MODIFY] [models.ts](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/lib/domain/models.ts)
- Add `id` to [ChannelFilters](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/lib/domain/models.ts#156-162) to allow filtering [getChannelsWithEpisodeCount](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/lib/repositories/channel.repository.ts#93-193) by a single channel.

#### [MODIFY] [channel.repository.ts](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/lib/repositories/channel.repository.ts)
- Update [getChannelsWithEpisodeCount](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/lib/repositories/channel.repository.ts#93-193) to handle the `id` filter.

#### [MODIFY] [episode.repository.ts](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/lib/repositories/episode.repository.ts)
- Add `bulkUpdateWatchStatus(channelId: string, userId: string, watched: boolean): Promise<void>` to update all episodes in a channel.
- Ensure [MediaEvent](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/lib/domain/models.ts#9-15) is recorded for each updated episode (or a single bulk event if appropriate, but individual events are better for history).

---

### API Routes

#### [MODIFY] [route.ts](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/app/api/channels/[id]/route.ts)
- Add `GET` method to fetch a single channel's details using [getChannelsWithEpisodeCount](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/lib/repositories/channel.repository.ts#93-193).

#### [NEW] [route.ts](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/app/api/channels/[id]/watch-status/route.ts)
- Implement `POST` method to trigger bulk watch status update.

---

### Components & Pages

#### [MODIFY] [page.tsx](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/app/channels/page.tsx)
- Update [SortableChannelCard](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/app/channels/page.tsx#72-228) to navigate to `/channels/[id]` instead of `/?channelId=[id]`.

#### [NEW] [page.tsx](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/app/channels/[id]/page.tsx)
- Create the Channel Details page.
- Implement a header section with:
    - Banner image (using `thumbnailUrl`).
    - Channel name (linked to external URL).
    - Description.
    - Stats (episode count).
    - Tags.
    - Dropdown menu for actions (Delete, Sync, Mark all as watched/unwatched).
- Embed [EpisodeList](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/components/features/episodes/episode-list.tsx#42-178) with `filters={{ channelId: id }}` and `viewMode="list"`.

## Verification Plan

### Automated Tests
- Run existing tests to ensure no regressions.
```bash
npm test
```

### Manual Verification
1. Navigate to the "Channels" page.
2. Click on a channel card.
3. Verify that it navigates to the new details page.
4. Verify all channel information is displayed correctly (banner, name, description, tags, episode count).
5. Verify that the episodes list shows only episodes from that channel.
6. Test "Mark all as watched" and verify all episodes in the list are updated.
7. Test "Mark all as unwatched" and verify all episodes are updated back.
8. Test "Sync Metadata" and "Delete" actions in the dropdown.
