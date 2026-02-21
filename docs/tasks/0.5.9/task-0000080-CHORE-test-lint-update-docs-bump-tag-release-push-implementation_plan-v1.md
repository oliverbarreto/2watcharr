# Implementation Plan - Fix Type Errors and Ensure Quality Checks

Fix type errors that were identified during full type checking (`tsc`) but missed by linting and vitest.

## Proposed Changes

### Tests

#### [MODIFY] [date-grouping.test.ts](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/lib/utils/date-grouping.test.ts)
- Update [createMockEpisode](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/lib/utils/date-grouping.test.ts#11-38) helper to include missing required properties from [MediaEpisode](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/lib/domain/models.ts#32-66):
    - `isShort`
    - `likeStatus`
    - `notes`

## Verification Plan

### Automated Tests
- Run type checking:
  ```bash
  npx tsc --noEmit
  ```
- Run linting:
  ```bash
  npm run lint
  ```
- Run unit tests:
  ```bash
  npm run test
  ```
