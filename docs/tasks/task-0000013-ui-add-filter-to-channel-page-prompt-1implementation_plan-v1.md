# Channels Page Filtering

Added filtering capabilities (search, tags, and media type) to the Channels page to improve navigation and accessibility of content sources.

## Proposed Changes

### [Domain Model]
#### [MODIFY] [models.ts](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/lib/domain/models.ts)
- Add `ChannelFilters` interface with `search`, `tagIds`, and `type` fields.

### [Repositories]
#### [MODIFY] [channel.repository.ts](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/lib/repositories/channel.repository.ts)
- Update [getChannelsWithEpisodeCount](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/lib/repositories/channel.repository.ts#93-148) to accept optional `filters`.
- Implement SQL logic to filter by name, media type, and tags (channels that have episodes with specific tags).

### [API]
#### [MODIFY] [route.ts](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/app/api/channels/route.ts)
- Update GET handler to parse query parameters (`search`, `tagIds`, `type`) and pass them to the repository.

### [UI Components]
#### [NEW] [channel-filter-bar.tsx](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/components/features/channels/channel-filter-bar.tsx)
- Create a dedicated filter bar for channels, mimicking the design of the Watchlist FilterBar.
- Include Search input, Type filter (Video/Podcast), and Tag selection.

### [Pages]
#### [MODIFY] [page.tsx](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/app/channels/page.tsx)
- Integrate `ChannelFilterBar`.
- Update state to reflect filtered channels.
- Implement data refetching on filter changes.

## Verification Plan

### Automated Tests
- Run `npm run test` to verify repository logic isn't broken.

### Manual Verification
- Verify search by channel name works.
- Verify filtering by "Video" or "Podcast" works.
- Verify filtering by Tags works (shows channels that have episodes with those tags).
- Ensure UI responsiveness and "no results" state.
