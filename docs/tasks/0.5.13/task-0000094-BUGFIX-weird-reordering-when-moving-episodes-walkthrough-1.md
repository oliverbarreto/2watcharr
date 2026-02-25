# Bugfix: Reordering and Priority Queueing

I have resolved the bug where "Move to beginning" and "Move to end" actions were inconsistent in the Watch Next page. I also implemented automatic top-of-queue placement for episodes marked as high priority.

## Changes Made

### Episode Repository
- **File**: [episode.repository.ts](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/lib/repositories/episode.repository.ts)
- Updated [moveToBeginning](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/lib/repositories/episode.repository.ts#620-629) and [moveToEnd](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/lib/services/media.service.ts#343-349) to include **all** non-deleted episodes when calculating the new order.
- This ensures that watched episodes (which may still be visible in the Watch Next queue if prioritized) are properly accounted for in the manual sort order.

### Media Service
- **File**: [media.service.ts](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/lib/services/media.service.ts)
- Updated [setPriority](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/lib/services/media.service.ts#318-328) to automatically trigger [moveToBeginning](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/lib/repositories/episode.repository.ts#620-629) when an episode is marked as `high` priority.

## Verification Results

### Automated Tests
I created reproduction and regression tests to verify the fixes:

1. **Reproduction Test**: [episode.repository.reorder.repro.test.ts](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/lib/repositories/episode.repository.reorder.repro.test.ts)
   - Confirmed the bug where a watched episode would block an unwatched episode from moving to the absolute end.
   - Verified the fix passes.

2. **Priority Test**: [media.service.priority.test.ts](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/lib/services/media.service.priority.test.ts)
   - Verified that calling [setPriority(id, 'high')](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/lib/services/media.service.ts#318-328) automatically moves the episode to the top of the manual queue.

```bash
npx vitest src/lib/repositories/episode.repository.reorder.repro.test.ts src/lib/services/media.service.priority.test.ts --run
```

| Test Case | Status |
| :--- | :--- |
| Move to End with watched interference | ✅ Passed |
| Move to Beginning with high priority | ✅ Passed |
| Normal priority update (low) | ✅ Passed |

## Manual Verification
I recommend following these steps to verify in the browser:
1. Go to the **Watch Next** page.
2. Mark an episode as **High Priority**. It should immediately jump to the top of the list.
3. Use the context menu to **Move to end**. It should move to the absolute end of the visible queue, even if there are watched episodes in the mix.
