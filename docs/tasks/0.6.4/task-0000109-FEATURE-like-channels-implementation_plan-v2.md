# Implementation Plan - Favorite Channels

This plan outlines the steps to add a "favorite" feature to channels, allowing users to star channels and filter for them in the `/channels` page.

## Proposed Changes

### Database & Domain

#### [MODIFY] [schema.sql](file:///Users/oliver/local/dev/2watcharr/src/lib/db/schema.sql)
- Add `favorite BOOLEAN NOT NULL DEFAULT 0` to the `channels` table.

#### [NEW] [add_channel_favorite.ts](file:///Users/oliver/local/dev/2watcharr/src/lib/db/migrations/add_channel_favorite.ts)
- Create a migration script to add the `favorite` column and an index for it: `CREATE INDEX IF NOT EXISTS idx_channels_favorite ON channels(favorite)`.

#### [MODIFY] [migrations.ts](file:///Users/oliver/local/dev/2watcharr/src/lib/db/migrations.ts)
- Import and register the [addChannelFavorite](file:///Users/oliver/local/dev/2watcharr/src/lib/db/migrations/add_channel_favorite.ts#3-45) migration.

#### [MODIFY] [models.ts](file:///Users/oliver/local/dev/2watcharr/src/lib/domain/models.ts)
- Update [Channel](file:///Users/oliver/local/dev/2watcharr/src/app/channels/%5Bid%5D/page.tsx#45-56) interface to include `favorite: boolean`.
- Update [ChannelFilters](file:///Users/oliver/local/dev/2watcharr/src/lib/domain/models.ts#231-239) interface to include `favorite?: boolean`.

---

### Repository & API

#### [MODIFY] [channel.repository.ts](file:///Users/oliver/local/dev/2watcharr/src/lib/repositories/channel.repository.ts)
- Update [mapRowToChannel](file:///Users/oliver/local/dev/2watcharr/src/lib/repositories/channel.repository.ts#214-228) to include `favorite`.
- Update [getChannelsWithEpisodeCount](file:///Users/oliver/local/dev/2watcharr/src/lib/repositories/channel.repository.ts#97-206) to support `filters.favorite`.
- Ensure [create](file:///Users/oliver/local/dev/2watcharr/src/lib/repositories/channel.repository.ts#7-35) and [update](file:///Users/oliver/local/dev/2watcharr/src/lib/repositories/channel.repository.ts#52-96) handle the `favorite` field.

- Create a new API route to toggle the favorite status of a channel.

#### [MODIFY] [route.ts](file:///Users/oliver/local/dev/2watcharr/src/app/api/channels/route.ts)
- Update GET handler to extract `favorite` from query parameters and pass it to the repository.

---

### Frontend Components

#### [MODIFY] [channel-list-row.tsx](file:///Users/oliver/local/dev/2watcharr/src/components/features/channels/channel-list-row.tsx)
- Add a star icon button to toggle favorite status.
- Show a filled star if favorited, outline if not.

#### [MODIFY] [channel-filter-bar.tsx](file:///Users/oliver/local/dev/2watcharr/src/components/features/channels/channel-filter-bar.tsx)
- Revert media type filters to behave like a radio group (mutually exclusive).
- Options: "All" (default), "YouTube", "Podcast".
- Update variants so only the active filter shows the "default" (filled) style.
- Ensure `onFilterChange` correctly passes the selection to the page.

#### [MODIFY] [page.tsx](file:///Users/oliver/local/dev/2watcharr/src/app/channels/page.tsx)
- Sync with the radio-group behavior of the filter bar.

#### [MODIFY] [page.tsx](file:///Users/oliver/local/dev/2watcharr/src/app/channels/[id]/page.tsx)
- Add a favorite toggle button near the channel title/icon.

## Verification Plan

### Automated Tests
- Run `npm test` to ensure existing tests pass.
- I will create a temporary test script in `/tmp/test-channel-favorite.ts` to verify the repository changes if needed, or update `channel.repository.test.ts` if it exists (need to check).

### Manual Verification
1. **Navigate to `/channels`**: Verify the new star filter button is visible.
2. **Favorite a Channel**: Click the star icon on a channel card. Verify the UI updates immediately (or after refresh) and the star remains filled.
3. **Filter by Favorite**: Click the star filter button. Verify only favorited channels are shown.
4. **Channel Detail Page**: Navigate to a channel detail page. Verify the favorite button works correctly there as well.
5. **Persistence**: Refresh the page and verify favorite status is persisted.
