# Release 0.5.5 and Workflow Improvement

This plan covers the steps to improve the `/update-tag-release` workflow and execute the release process for version 0.5.5.

## Proposed Changes

### Workflows
#### [MODIFY] [update-tag-release.md](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/.agent/workflows/update-tag-release.md)
- Add `// turbo` annotations to automated steps (lint, test, version bump, push).
- Improve the structure and clarity of the instructions.

### Documentation
#### [MODIFY] [CHANGELOG.md](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/CHANGELOG.md)
- Add entry for version 0.5.5 with recent features:
    - YouTube Shorts differentiation.
    - Episode notes functionality.
    - "With Notes" filter.
    - Clear UI buttons for filters and search.

#### [MODIFY] [roadmap.md](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/docs/specs/roadmap/roadmap.md)
- Ensure 0.5.5 section is accurate.

### Configuration
#### [MODIFY] [package.json](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/package.json)
- Bump version to `0.5.5`.

#### [MODIFY] [package-lock.json](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/package-lock.json)
- Bump version to `0.5.5`.

## Verification Plan

### Automated Tests
- Run `npm run lint` to confirm no errors.
- Run `npm test` to confirm all tests pass.

### Manual Verification
- Verify [package.json](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/package.json) version is `0.5.5`.
- Verify [CHANGELOG.md](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/CHANGELOG.md) contains the new version entry.
- Verify GitHub release and tag are created (using `gh` CLI).
