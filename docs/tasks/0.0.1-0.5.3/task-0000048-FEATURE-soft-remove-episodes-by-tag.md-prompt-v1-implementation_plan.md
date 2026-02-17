# Enhancement to Tags Management and Deleted Episodes

This plan outlines the addition of "soft remove episodes by tag" in settings, and "restore all / permanently delete all" functionality in the deleted episodes page.

## Proposed Changes

### Backend: Domain and Persistence
#### [MODIFY] [episode.repository.ts](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/lib/repositories/episode.repository.ts)
- Add `bulkRestore(userId: string)` to restore all soft-deleted episodes for a user.
- Add `bulkHardDelete(userId: string)` to permanently delete all soft-deleted episodes for a user.

### Backend: Services and API
#### [MODIFY] [media.service.ts](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/lib/services/media.service.ts)
- Add `softDeleteEpisodesByTag(tagId: string, userId: string)`:
  - Remove tag from episodes.
  - Set `is_deleted = true`.
  - Add `removed` events.
- Add `restoreAllEpisodes(userId: string)`:
  - Call repository `bulkRestore`.
  - Add `restored` events for all affected episodes.
- Add `hardDeleteAllEpisodes(userId: string)`:
  - Call repository `bulkHardDelete`.

#### [NEW] [route.ts (tags/[id]/remove-episodes)](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/app/api/tags/%5Bid%5D/remove-episodes/route.ts)
- POST endpoint to trigger soft removal of episodes by tag.

#### [NEW] [restore-all/route.ts](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/app/api/episodes/restore-all/route.ts)
- POST endpoint to restore all soft-deleted episodes.

#### [NEW] [permanent-delete-all/route.ts](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/app/api/episodes/permanent-delete-all/route.ts)
- DELETE endpoint to permanently delete all soft-deleted episodes.

---

### Frontend: UI Components
#### [MODIFY] [settings/page.tsx](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/app/settings/page.tsx)
- Add a new "Trash" icon button to the right of each tag row for "Soft remove episodes by tag".
- Implement tooltips for "Edit", "Delete Tag", and "Soft Remove Episodes" buttons using the `Tooltip` component.
- Add a confirmation dialog for the soft removal action.

#### [MODIFY] [deleted/page.tsx](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/app/deleted/page.tsx)
- Add "Restore All" and "Permanently Delete All" buttons at the top, left of the view mode toggle.
- Add confirmation dialogs for both bulk actions.

## Verification Plan

### Automated Tests
- Create unit tests in [src/lib/services/media.service.test.ts](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/lib/services/media.service.test.ts) for the new service methods.
- Run tests using: `npm test src/lib/services/media.service.test.ts`

### Manual Verification
- **Tags Management**:
  - Assign a tag to multiple episodes.
  - In Settings > Tags Management, click the "Soft remove episodes by tag" button.
  - Verify that:
    - Episodes are removed from the main list.
    - Episodes no longer have that tag.
    - Episodes appear in the Deleted Episodes page.
- **Deleted Episodes**:
  - Have multiple soft-deleted episodes.
  - Click "Restore All" and verify they return to the main list with their remaining tags.
  - Have multiple soft-deleted episodes.
  - Click "Permanently Delete All" and verify they are completely gone from the database.
