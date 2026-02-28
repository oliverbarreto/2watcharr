# Tag UI Experience Improvements Plan

Improve the UI by ordering tags correctly in different contexts: alphabetical in Preferences, most used in Filters, and last used in the Add Tag modal.

## User Review Required

> [!IMPORTANT]
> This change introduces a new column `last_used_at` to the `tags` table to track usage for "Recent tags" ordering. This will involve a database migration.

## Proposed Changes

### Database Layer
---
#### [NEW] [add_tag_last_used_at.ts](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/lib/db/migrations/add_tag_last_used_at.ts)
- Create a new migration to add `last_used_at` (INTEGER) column to the `tags` table.
- Add an index on [(user_id, last_used_at DESC)](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/app/api/episodes/%5Bid%5D/route.ts#22-64) for performance.

#### [MODIFY] [migrations.ts](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/lib/db/migrations.ts)
- Register the new migration.

#### [MODIFY] [schema.sql](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/lib/db/schema.sql)
- Update the base schema for new installations.

### Backend Layer
---
#### [MODIFY] [models.ts](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/lib/domain/models.ts)
- Add `lastUsedAt?: number` to the [Tag](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/app/settings/page.tsx#36-42) interface. (Kept for now)

#### [MODIFY] [tag.repository.ts](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/lib/repositories/tag.repository.ts)
- Update [mapRowToTag](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/lib/repositories/tag.repository.ts#150-160) to include `lastUsedAt`.
- Update [create](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/lib/repositories/tag.repository.ts#8-26) to set `lastUsedAt`.
- Add [updateLastUsed(id: string, timestamp: number): Promise<void>](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/lib/repositories/tag.repository.ts#27-36).
- Update [findAll](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/lib/repositories/tag.repository.ts#53-73) and [getTagsWithEpisodeCount](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/lib/repositories/tag.repository.ts#117-149) to support `sort` options:
    - `alphabetical`: `ORDER BY name ASC`
    - `usage`: `ORDER BY episode_count DESC, name ASC`
    - `recent`: `ORDER BY last_used_at DESC, name ASC`

#### [MODIFY] [media.service.ts](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/lib/services/media.service.ts)
- Keep: Call `tagRepo.updateLastUsed` for all tag IDs being associated to track usage, providing infrastructure for future features even if not used for sorting in the Add Tag modal right now.

#### [MODIFY] [route.ts](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/app/api/tags/route.ts)
- Update `GET /api/tags` to accept a `sort` query parameter.

### Frontend Layer
---
#### [MODIFY] [page.tsx](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/app/settings/page.tsx)
- Use `sort=alphabetical`.

#### [MODIFY] [filter-bar.tsx](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/components/features/episodes/filter-bar.tsx)
- Use `sort=usage`.

#### [MODIFY] [episode-card.tsx](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/components/features/episodes/episode-card.tsx) [PIVOT]
- Use `sort=alphabetical` instead of `recent`.

## Verification Plan

### Automated Tests
- Run existing repository and service tests to ensure no regression.
`npm test src/lib/repositories/episode.repository.test.ts`
`npm test src/lib/services/media.service.test.ts`
- Add a new test for [TagRepository](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/lib/repositories/tag.repository.ts#5-161) to verify ordering.
`npm test src/lib/repositories/tag.repository.test.ts` (new file)

### Manual Verification
1.  **Preferences:** Go to Settings -> Tags Management. Verify tags are alphabetically ordered.
2.  **Filter Bar:** On the main page, click the Tag filter icon. Verify tags are ordered by usage (most episodes first).
3.  **Add Tag Modal:** On an episode card, click the Tag icon. Verify tags are alphabetically ordered.
