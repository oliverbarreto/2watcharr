# Release Version 0.5.6 Implementation Plan

This plan follows the `/update-tag-release` workflow to release version 0.5.6.

## Proposed Changes

### Documentation
#### [MODIFY] [CHANGELOG.md](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/CHANGELOG.md)
Update with changes since 0.5.5:
- **Added**: Floating bubble on the watchlist page displaying the count of loaded episodes during infinite scroll.
- **Added**: "Create Note" option directly in the episode card and list row dropdown menus.
- **Added**: Content type filters (Video, Shorts, Podcast) in the watchlist filter bar.
- **Added**: "Like" and "Don't Like" voting buttons for episodes.
- **Improved**: Channel list view with wider thumbnails and more compact layout for consistency.
- **Fixed**: "Like/Don't Like" filter functionality to correctly filter episodes.

#### [MODIFY] [roadmap.md](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/docs/specs/roadmap/roadmap.md)
Update implementation status for 0.5.6 features.

### Git Operations
- Merge `develop` into `main`.
- Bump version in `package.json` to `0.5.6`.
- Tag and create GitHub release.

## Verification Plan

### Automated Tests
- Run `npm run lint`.
- Run `npm test`.

### Manual Verification
- Check `package.json` version.
- Verify GitHub release.
