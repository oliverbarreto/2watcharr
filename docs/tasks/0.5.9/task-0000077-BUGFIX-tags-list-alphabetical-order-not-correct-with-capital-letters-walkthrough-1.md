# Refined Tag Sorting Implementation

I have implemented a new tag sorting logic that is case-insensitive and ignores leading emojis or symbols, ensuring that tags like `📚 Books` are sorted by the word `Books` rather than the emoji.

## Changes

### Tag Utility [NEW]
- [tag-utils.ts](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/lib/utils/tag-utils.ts): Added a shared utility for alphabetical tag sorting.
- [tag-utils.test.ts](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/lib/utils/tag-utils.test.ts): Verified the sorting logic with comprehensive tests.

### Repository Integration
- [tag.repository.ts](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/lib/repositories/tag.repository.ts): Applied the sorting utility to [findAll](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/lib/repositories/tag.repository.ts#54-80) and [getTagsWithEpisodeCount](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/lib/repositories/tag.repository.ts#124-162).

### UI Integration
- [page.tsx (stats)](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/app/stats/page.tsx): Applied the same sorting logic to the tag selection list in the statistics page.

## Verification Results

### Automated Tests
I ran the unit tests for the new utility, and all scenarios passed, including the specific example provided:

```typescript
✓ src/lib/utils/tag-utils.test.ts (4 tests)
  ✓ should sort tags case-insensitively
  ✓ should ignore leading emojis when sorting
  ✓ should handle the specific example provided by the user
  ✓ should handle tags with only emojis or symbols
```

### Manual Verification
- The sorting is now applied to the tag list in Settings -> Tags.
- The sorting is applied to the tag selection list on the Stats page.
- Emojis at the start of a tag name no longer affect its alphabetical position.
- Sorting is case-insensitive (e.g., `arr` comes before `Books`).
