# Implementation Plan - Episode Card Navigation Fix

The goal is to update the channel links in episode cards (both grid and list views) to navigate directly to the channel details page instead of the general channels list.

## Proposed Changes

### Episode Components

#### [MODIFY] [episode-card.tsx](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/components/features/episodes/episode-card.tsx)
- Change the channel name click handler to navigate to `/channels/${episode.channelId}`.

#### [MODIFY] [episode-list-row.tsx](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/components/features/episodes/episode-list-row.tsx)
- Change the channel name click handler to navigate to `/channels/${episode.channelId}`.

## Verification Plan

### Automated Tests
- None available for this specific UI interaction.

### Manual Verification
- I will use the browser tool to:
    1.  Navigate to the Watchlist page.
    2.  Click on a channel name in an episode card.
    3.  Verify that the URL is `/channels/[channelId]` and the channel details page is displayed.
    4.  Repeat for the list view if possible.
