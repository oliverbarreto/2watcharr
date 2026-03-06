# Release Version 0.6.4 Implementation Plan

This plan outlines the steps to release version 0.6.4 of 2watcharr, incorporating the "Like Channels" feature and filter improvements.

## Proposed Changes

### Documentation

#### [MODIFY] [CHANGELOG.md](file:///Users/oliver/local/dev/2watcharr/CHANGELOG.md)
- Add entries for version 0.6.4:
  - Added ability to favorite channels.
  - Added favorite filter in channels page.
  - Fixed filter bar behavior for media types (mutually exclusive selection).
  - UI improvements for channel cards and detail pages.

#### [MODIFY] [roadmap.md](file:///Users/oliver/local/dev/2watcharr/docs/specs/roadmap/roadmap.md)
- Move completed items from 0.6.4 to the "Implemented Features" section.

### Git Operations

#### [EXECUTE] Merge and Release
1. Commit documentation changes to `develop`.
2. Merge `develop` into `main`.
3. Bump version using `npm version 0.6.4`.
4. Push `main` and tags to origin.
5. Create a GitHub release using `gh release create`.

## Verification Plan

### Automated Tests
- `npm run lint` and `npm test` have already been run and passed. I will run them one more time before final commit if any significant changes are made.

### Manual Verification
- Verify `package.json` version matches `0.6.4`.
- Verify GitHub release is created successfully.
