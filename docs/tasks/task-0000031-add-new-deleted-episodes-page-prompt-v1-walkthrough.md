# Deleted Episodes Page - Implementation Walkthrough

## Overview

Successfully implemented a comprehensive "Deleted Episodes" feature that allows users to view soft-deleted episodes and permanently remove them from the database.

## Changes Made

### Backend Changes

#### [episode.repository.ts](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/lib/repositories/episode.repository.ts)
- Added [hardDelete(id: string)](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/lib/repositories/episode.repository.ts#360-383) method to permanently remove episodes and their associated data (tags and events) from the database
- Uses transactions to ensure data integrity

#### [media.service.ts](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/lib/services/media.service.ts)
- Added [hardDeleteEpisode(id: string)](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/lib/services/media.service.ts#168-174) method to expose hard deletion through the service layer

---

### API Changes

#### [api/episodes/route.ts](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/app/api/episodes/route.ts)
- Updated [GET](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/app/api/episodes/%5Bid%5D/route.ts#20-62) endpoint to accept `isDeleted` query parameter for filtering deleted episodes

#### [api/episodes/[id]/route.ts](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/app/api/episodes/[id]/route.ts)
- Updated [DELETE](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/app/api/episodes/%5Bid%5D/route.ts#126-171) endpoint to support permanent deletion via `permanent=true` query parameter
- Soft delete remains the default behavior

---

### UI Components

#### [deleted/page.tsx](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/app/deleted/page.tsx) (NEW)
- Created new page for viewing deleted episodes
- Supports both grid and list views
- Includes filtering and sorting capabilities
- Maintains separate view mode preference in localStorage (`deletedEpisodeViewMode`)

#### [episode-card.tsx](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/components/features/episodes/episode-card.tsx)
- Added [handleHardDelete()](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/components/features/episodes/episode-card.tsx#126-141) function with confirmation dialog
- Added [handleRestore()](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/components/features/episodes/episode-card.tsx#142-159) function to restore deleted episodes
- Updated dropdown menu to show different options based on `episode.isDeleted`:
  - **Deleted episodes**: "Restore to watch list" and "Remove permanently"
  - **Active episodes**: "Remove from list"
- Updated soft delete dialog text to mention restoration capability

#### [episode-list-row.tsx](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/components/features/episodes/episode-list-row.tsx)
- Added same hard delete and restore functionality as episode card
- Ensures consistent behavior between grid and list views

#### [episode-list.tsx](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/components/features/episodes/episode-list.tsx)
- Updated [EpisodeListProps](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/components/features/episodes/episode-list.tsx#26-42) interface to include `isDeleted` filter
- Updated `fetchEpisodes()` to pass `isDeleted` parameter to API

#### [settings/page.tsx](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/app/settings/page.tsx)
- Added "Deleted Episodes" section in General tab
- Includes button to navigate to `/deleted` page

---

## Key Features

### Soft Delete (Existing)
- Episodes are marked as `is_deleted = 1` in the database
- Hidden from main watch list
- Can be restored

### Hard Delete (New)
- Permanently removes episode from database
- Deletes associated tags and events
- Cannot be undone
- Requires explicit confirmation

### Restore (New)
- Sets `isDeleted: false` on soft-deleted episodes
- Returns episode to main watch list
- Dispatches `episode-restored` event for UI updates

## User Flow

1. User soft-deletes an episode from the watch list
2. Episode is hidden from main list but remains in database
3. User navigates to Settings > General > "View Deleted Episodes"
4. Deleted episodes page shows all soft-deleted episodes
5. User can either:
   - **Restore** the episode back to the watch list
   - **Remove permanently** to delete from database (with confirmation)

## Safety Measures

- Permanent deletion requires explicit confirmation dialog
- Soft delete dialog now mentions restoration capability
- Transactions ensure data integrity during hard delete
- Separate confirmation dialogs for soft vs hard delete
