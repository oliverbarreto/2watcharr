# Release Version 0.5.7 Plan

This plan outlines the steps to release version 0.5.7 of the project.

## Proposed Changes

### [Git Management]
- Merge `main` into `develop` to sync the version (0.5.6) and any other changes.
- Merge `develop` into `main` after verification.

### [Verification]
- Run `npm run lint` to ensure no linting errors.
- Run `npm test` to ensure all tests pass.

### [Documentation]
- Update [CHANGELOG.md](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/CHANGELOG.md) with the new features:
  - Like/Don't Like functionality and filters (added in previous cycles but maybe not in changelog).
  - Restructured stats page and tags usage chart.
  - Video, Shorts, and Podcast filters.
- Update [docs/specs/roadmap/roadmap.md](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/docs/specs/roadmap/roadmap.md) to reflect current implementation status.

### [Version Bump & Release]
- Bump version to `0.5.7` in `main`.
- Push tags to GitHub.
- Create a GitHub release using `gh release create`.

## Verification Plan

### Automated Tests
- `npm run lint`: Run linting to check for errors.
- `npm test`: Run tests to ensure stability.

### Manual Verification
- Check [package.json](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/package.json) for version `0.5.7`.
- Verify GitHub release creation on the repository page.
