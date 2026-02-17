# Release 0.2.0 Implementation Plan

This plan outlines the steps to release version 0.2.0 of 2watcharr.

## Proposed Changes

### Documentation
#### [MODIFY] [CHANGELOG.md](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/CHANGELOG.md)
Update with recent features and bugfixes:
- **Features**:
    - Pagination and search for stats table.
    - Column sorting for stats table.
    - Enhanced stats charts with period filtering.
    - "Watched", "Favorite", and "Tag" options in episode dropdowns.
    - Responsive navbar with mobile sheet menu.
    - Production-ready Docker Compose configuration.
    - Individual metadata sync for channel cards.
- **Bugfixes**:
    - Fixed podcast metadata retrieval when using podcast URL.
    - Resolved linter errors and standardized string literals.
    - Fixed 'pending' watch status logic and UI feedback.

#### [MODIFY] [README.md](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/README.md)
Update version number and add/update features section if necessary.

#### [MODIFY] [roadmap.md](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/docs/specs/roadmap/roadmap.md)
Update recently completed items.

### Code
#### [MODIFY] [package.json](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/package.json)
Bump version from `0.1.0` to `0.2.0`.

### Git Workflow
#### Merge `develop` into `main`
Execute `git checkout main && git merge develop`.

#### Tagging
Create a new tag `v0.2.0`.

#### GitHub Release
Create a release on GitHub (instructional).

## Verification Plan

### Manual Verification
- Verify that [package.json](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/package.json) reflects the new version.
- Verify that [CHANGELOG.md](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/CHANGELOG.md) contains the new entries.
- Verify that `main` branch is up to date with `develop`.
- Verify the tag `v0.2.0` exists.
