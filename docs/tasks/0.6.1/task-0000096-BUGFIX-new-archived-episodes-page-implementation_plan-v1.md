# Implementation Plan - Archive Feature Fixes

Fixes for archiving criteria on the Watch Next page and unarchive errors on the Archived page.

## Proposed Changes

### Media Service

#### [MODIFY] [media.service.ts](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/lib/services/media.service.ts)
- Update [bulkArchiveWatched](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/lib/services/media.service.ts#385-404) to only archive episodes where `priority !== 'none'`.

### API Layer

#### [MODIFY] [route.ts](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/app/api/episodes/%5Bid%5D/route.ts)
- Update the Zod schema `updateEpisodeSchema` to allow `archivedAt` to be `null`. This will fix the validation error when the frontend sends `null` to unarchive.

### Domain Models

#### [MODIFY] [models.ts](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/lib/domain/models.ts)
- Update [UpdateEpisodeDto](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/lib/domain/models.ts#115-132) to allow `archivedAt` to be `number | null`.

## Verification Plan

### Automated Tests
- Create a new test file `src/lib/services/media.service.archive.test.ts` to verify:
    - [bulkArchiveWatched](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/lib/services/media.service.ts#385-404) only archives watched episodes with priority.
    - [bulkArchiveWatched](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/lib/services/media.service.ts#385-404) does not archive watched episodes without priority.
- Run the test using `npx vitest src/lib/services/media.service.archive.test.ts`.

### Manual Verification
- **Archiving Criteria**:
    1. Go to "Watch Next" page.
    2. Have some watched episodes with priority and some without.
    3. Click "Archive Watched".
    4. Verify only those with priority are archived.
- **Unarchive Action**:
    1. Go to "Archived" page.
    2. Click unarchive on an episode.
    3. Verify it works without error.
