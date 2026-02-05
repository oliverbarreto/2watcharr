# Deleted Episodes Page Implementation Plan

We want to add a "Deleted Episodes" page to the app to show soft-deleted episodes and allow their permanent removal from the database.

## User Review Required

> [!IMPORTANT]
> The "Remove permanently" action is destructive and cannot be undone. We will add a confirmation dialog to prevent accidental deletions.

## Proposed Changes

### Backend

#### [MODIFY] [episode.repository.ts](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/lib/repositories/episode.repository.ts)
- Add `hardDelete(id: string)` method to permanently remove an episode and its associated tags/events from the database.

#### [MODIFY] [media.service.ts](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/lib/services/media.service.ts)
- Add `hardDeleteEpisode(id: string)` method calling the repository's `hardDelete`.

#### [MODIFY] [api/episodes/route.ts](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/app/api/episodes/route.ts)
- Update [GET](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/app/api/episodes/route.ts#60-122) to accept `isDeleted` query parameter.

#### [MODIFY] [api/episodes/[id]/route.ts](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/app/api/episodes/[id]/route.ts)
- Update [DELETE](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/app/api/episodes/%5Bid%5D/route.ts#126-161) to handle `permanent=true` query parameter for hard deletion.

---

### UI Components

#### [MODIFY] [episode-card.tsx](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/components/features/episodes/episode-card.tsx)
- Add "Remove permanently" option to the `DropdownMenu`.
- Add "Restore" action (setting `isDeleted: false`) if the episode is currently soft-deleted.
- Implement `handleHardDelete` with a confirmation dialog.

#### [NEW] [deleted/page.tsx](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/app/deleted/page.tsx)
- Create a new page similar to the home page but filtering for `isDeleted: true`.
- Provide options for grid and list views.

#### [MODIFY] [settings/page.tsx](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/app/settings/page.tsx)
- Add a "Deleted Episodes" section/link in the "General" tab.

---

## Verification Plan

### Automated Tests
- Run existing repository tests: `npm test src/lib/repositories/episode.repository.test.ts`
- Add new test cases for `hardDelete` in [episode.repository.test.ts](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/lib/repositories/episode.repository.test.ts).

### Manual Verification
1. Soft-delete an episode from the home page.
2. Navigate to Settings > General.
3. Click on the "Deleted Episodes" link.
4. Verify the episode appears in the list/grid views on the new page.
5. Restore the episode and verify it returns to the home page.
6. Soft-delete it again, find it in "Deleted Episodes", and "Remove permanently".
7. Verify it is gone from the database (cannot be restored or found).
