# Release Version 0.5.3

Releasing version 0.5.3 with several new features and documentation improvements.

## Proposed Changes

### Configuration
#### [MODIFY] [package.json](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/package.json)
- Bump version from `0.5.2` to `0.5.3`.

### Documentation
#### [MODIFY] [CHANGELOG.md](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/CHANGELOG.md)
- Add entries for version `0.5.3`:
    - **Added**: Soft remove videos by tag (Bulk actions).
    - **Added**: New stats metrics (Not Watched, Pending Confirmation).
    - **Improved**: Chart legend placement on stats page.
    - **Docs**: Improved skills/workflows and added production deployment instructions.

### Git Workflow
#### [MERGE] `develop` into `main`
- Ensure all latest changes from `develop` are integrated into `main` before tagging.

#### [TAG] `v0.5.3`
- Create a new git tag `v0.5.3`.

## Verification Plan

### Automated Tests
- Run `npm run lint` to ensure code quality.
- Run `npm test` to ensure no regressions.

### Manual Verification
- Verify [package.json](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/package.json) version is `0.5.3`.
- Verify [CHANGELOG.md](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/CHANGELOG.md) reflects the changes correctly.
- Check GitHub repository for the new tag and release after pushing.
