# Fix Database Schema and Migration Errors

The user reported `SQLITE_ERROR` related to column names in the `channels` table and failures in the `add_podcast_support` migration. This plan addresses the naming mismatch (camelCase vs snake_case) and makes migrations more robust.

## Proposed Changes

### [Repositories]

#### [MODIFY] [channel.repository.ts](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/lib/repositories/channel.repository.ts)
- Update [create()](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/lib/repositories/episode.repository.ts#15-53) method to use `thumbnail_url` instead of `thumbnailUrl` in the `INSERT` SQL statement.
- Update [update()](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/lib/repositories/channel.repository.ts#52-92) method to use `thumbnail_url` instead of `thumbnailUrl` in the `UPDATE` SQL statement.

### [Database]

#### [MODIFY] [migrations.ts](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/lib/db/migrations.ts)
- Update migration 6 (`add_podcast_support`) to be more resilient:
    - Check if the `episodes` table already exists. If it does, skip the schema migration part (handles new installations where current [schema.sql](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/lib/db/schema.sql) is used).
    - Dynamically detect column names (`url` vs `channel_url` and `thumbnail_url` vs `thumbnailUrl`) in the old `channels` table before migrating data.
    - Move the `INSERT INTO migrations` statement inside the transaction to prevent race conditions between Dev server workers.

## Verification Plan

### Automated Tests
- Run `npm run test` to ensure all repository tests pass with the corrected schema.
- Run `npm run build` to verify the project still compiles.

### Manual Verification
- User to restart the app and attempt to add the podcast URL again.
- Verify that `channels` and `episodes` tables are correctly populated in a fresh DB.
