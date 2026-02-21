# Case-Insensitive and Emoji-Neutral Tag Sorting

Refine tag sorting logic to be case-insensitive and ignore leading emojis/symbols when determining alphabetical order. Mixed sorting (emojis and non-emojis) will be used as per the provided example.

## Proposed Changes

### Tag Utilities [NEW]

#### [NEW] [tag-utils.ts](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/lib/utils/tag-utils.ts)
- Create a utility file for tag-related logic.
- Implement `sortTagsAlphabetically<T extends { name: string }>(tags: T[]): T[]`:
    - Strips leading non-alphanumeric characters (emojis, spaces, symbols) for sorting comparison.
    - Performs case-insensitive comparison using `Intl.Collator`.
    - Returns a new sorted array.

### Repositories

#### [MODIFY] [tag.repository.ts](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/lib/repositories/tag.repository.ts)
- Import `sortTagsAlphabetically` from `@/lib/utils/tag-utils`.
- Update [findAll](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/lib/repositories/tag.repository.ts#53-73):
    - For `alphabetical` sort, remove `ORDER BY name ASC` from SQL (or keep it as a first pass, then re-sort in memory).
    - Apply `sortTagsAlphabetically` to the result before returning.
- Update [getTagsWithEpisodeCount](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/lib/repositories/tag.repository.ts#117-149):
    - For `alphabetical` sort, remove `ORDER BY t.name ASC` from SQL.
    - Apply `sortTagsAlphabetically` to the result before returning.

### Services (If needed)

#### [MODIFY] [stats.service.ts](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/lib/services/stats.service.ts)
- Verify if any tag lists in stats need the same sorting logic and apply if necessary.

## Verification Plan

### Automated Tests
- Create `src/lib/utils/tag-utils.test.ts` to verify the sorting logic with various inputs:
    - Mixed case: `arr`, `Books`, `Coding`, `workshops`.
    - Emojis: `📚 Books`, `🎯 Goals`.
    - Combined: The example provided by the user.
- Run tests: `npm test src/lib/utils/tag-utils.test.ts` (assuming standard test runner).

### Manual Verification
- Navigate to Settings -> Tags tab.
- Create tags with mixed casing and emojis.
- Verify they appear in the correct alphabetical order regardless of case or emoji presence.
