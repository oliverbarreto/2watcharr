# Walkthrough - Soft Remove by Tag & Bulk Operations

I have implemented the requested enhancements to the Tags Management and Deleted Episodes functionality.

## Changes Made

### Tags Management
- Added a new **"Soft remove episodes by tag"** button (orange trash icon) to each tag row in Settings.
- Added **tooltips** to all action buttons in the tags management list (Edit, Delete Tag, Soft Remove).
- Implemented a **confirmation dialog** for the soft removal action to prevent accidental deletions.

### Deleted Episodes Page
- Added **"Restore All"** and **"Delete All"** buttons at the top of the page.
- Implemented **confirmation dialogs** for both bulk actions.
- Functional logic ensures episodes are restored with their remaining tags (if any).

### Backend
- Added [bulkRestore](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/lib/repositories/episode.repository.ts#441-450) and [bulkHardDelete](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/lib/repositories/episode.repository.ts#475-505) to [EpisodeRepository](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/lib/repositories/episode.repository.ts#17-656).
- Implemented [softDeleteEpisodesByTag](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/lib/services/media.service.ts#182-204), [restoreAllEpisodes](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/lib/services/media.service.ts#205-216), and [hardDeleteAllEpisodes](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/lib/services/media.service.ts#217-223) in [MediaService](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/lib/services/media.service.ts#14-373).
- Created new API routes:
  - `POST /api/tags/[id]/remove-episodes`
  - `POST /api/episodes/restore-all`
  - `DELETE /api/episodes/permanent-delete-all`

---

## Verification Results

### Automated Tests
I added 3 new test cases to [src/lib/services/media.service.test.ts](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/lib/services/media.service.test.ts) to verify the core logic. All tests passed successfully.

```bash
✓ src/lib/services/media.service.test.ts (7 tests) 18ms
 Test Files  2 passed (2)
      Tests  11 passed (11)
```

### Manual Verification
- Verified that **Soft Remove by Tag**:
  - Removes the tag from affected episodes.
  - Marks episodes as `is_deleted = true`.
  - Records a `removed` event.
- Verified that **Restore All**:
  - Marks all deleted episodes as `is_deleted = false`.
  - Records a `restored` event for each.
- Verified that **Permanently Delete All**:
  - Removes all soft-deleted episodes and their relations (tags, events) from the database.
