# BUGFIX: Reordering in Watch Next Page

Fix the bug where "Move to beginning" and "Move to end" actions don't work as expected in the Watch Next page.

## Proposed Changes

### [Component Name] Episode Repository

#### [MODIFY] [episode.repository.ts](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/lib/repositories/episode.repository.ts)

Update [moveToBeginning](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/lib/services/media.service.ts#332-338) and [moveToEnd](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/lib/repositories/episode.repository.ts#630-639) to fetch and reorder ALL non-deleted episodes for the user, instead of just the unwatched ones. This ensures a consistent `custom_order` across all possible views (Watch Next, Watch List, etc.) and avoids "hidden" episodes (like watched ones with high priority) from keeping their low `custom_order` values and blocking others from moving to the true beginning or end.

### [Component Name] Media Service

#### [MODIFY] [media.service.ts](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/lib/services/media.service.ts)

Update [setPriority](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/lib/services/media.service.ts#318-324) to automatically call [moveToBeginning](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/lib/services/media.service.ts#332-338) when an episode is marked as `high` priority. This fulfills the requirement that prioritized episodes should appear at the top of the Watch Next queue.

```typescript
// Proposed change for setPriority
async setPriority(id: string, priority: Priority): Promise<MediaEpisode> {
    const episode = await this.episodeRepo.update(id, { priority });
    if (priority === 'high') {
        await this.episodeRepo.moveToBeginning(id, episode.userId);
    }
    return episode;
}
```

```typescript
// Proposed change for moveToBeginning
async moveToBeginning(id: string, userId: string): Promise<void> {
    const episodes = await this.findAll({ userId, isDeleted: false }, { field: 'custom', order: 'asc' });
    const episodeIds = episodes.map(e => e.id).filter(vid => vid !== id);
    episodeIds.unshift(id);
    await this.reorder(episodeIds);
}

// Proposed change for moveToEnd
async moveToEnd(id: string, userId: string): Promise<void> {
    const episodes = await this.findAll({ userId, isDeleted: false }, { field: 'custom', order: 'asc' });
    const episodeIds = episodes.map(e => e.id).filter(vid => vid !== id);
    episodeIds.push(id);
    await this.reorder(episodeIds);
}
```

Wait! I should also check if `MediaService.saveEpisodeFromMetadata` needs an update.
It calls `this.episodeRepo.moveToBeginning(existing.id, userId);` when restoring an episode.
This will now move it to the absolute beginning of the user's list, which is correct.

## Verification Plan

### Automated Tests
I will add a new test file `src/lib/repositories/episode.repository.reorder.test.ts` to verify:
1. "Move to beginning" works when there are watched and unwatched episodes mixed.
2. "Move to beginning" works when some episodes have `NULL` `custom_order`.
3. "Move to end" works correctly in the same scenarios.

Commands:
```bash
npx vitest src/lib/repositories/episode.repository.reorder.test.ts
```

### Manual Verification
1. Open the "Watch Next" page.
2. Ensure some high-priority episodes exist.
3. Try "Move to end" for the first episode. Verify it moves to the very end of the visible list.
4. Try "Move to beginning" for an episode in the middle. Verify it moves to the very beginning.
5. Switch to "All" episodes (if possible) and verify the order is consistent.
