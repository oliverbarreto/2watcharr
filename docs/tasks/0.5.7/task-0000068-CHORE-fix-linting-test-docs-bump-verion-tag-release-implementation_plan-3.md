# Release 0.5.7 Implementation Plan

This plan outlines the steps to release version 0.5.7, which includes a major restructuring of the Statistics page and new tag-based analytics.

## Proposed Changes

### Documentation
#### [MODIFY] [CHANGELOG.md](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/CHANGELOG.md)
Update with 0.5.7 changes:
- **Stats**: Major restructure with tabs (Activity, Tags, Events History).
- **Stats**: New "Videos by Tags" interactive line chart.
- **Stats**: New metrics: "Viewing Time (Today)" and "Watched Today/This Week".
- **Stats**: Reorganized Activity Summary and added Select All/Deselect All for tags.

#### [MODIFY] [roadmap.md](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/docs/specs/roadmap/roadmap.md)
- Move completed 0.5.7 tasks to the "Implemented Features" section.

### Versioning
#### [MODIFY] [package.json](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/package.json)
- Bump version from `0.5.6` to `0.5.7`.

## Release Process

1. **Verification**: 
   - Run `npm run lint`
   - Run `npm test`
2. **Merge**:
   - Checkout `main`
   - Merge `develop` into `main`
3. **Tag & Release**:
   - `npm version patch` (on `main`)
   - `git push origin main --tags`
   - `gh release create v0.5.7 --notes-from-tag`

## Verification Plan

### Automated Tests
- `npm run lint`: Should pass without errors.
- `npm test`: Should pass without failures.

### Manual Verification
- Verify [package.json](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/package.json) version is `0.5.7`.
- Verify GitHub release existence and content.
