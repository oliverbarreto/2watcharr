# Version Bump to 0.6.3

This plan outlines the steps to bump the version of 2watcharr to 0.6.3, following the `/update-tag-release` workflow. This includes merging latest features into `develop`, updating documentation, and performing the release into `main`.

## Proposed Changes

### Branch Management
- Merge `features/activity` into `develop`.
- Ensure `develop` is clean and up to date.

### [MODIFY] [CHANGELOG.md](file:///Users/oliver/local/dev/2watcharr/CHANGELOG.md)
Update with changes for 0.6.3:
- **Asynchronous Episode Addition**: Immediate modal dismissal and background processing for adding episodes.
- **Notification System**: Added notification bell for real-time status updates.
- **LabcastARR Integration**: Added ability to send episodes to LabcastARR.
- **Performance**: Optimized metadata extraction to prevent app hanging on large channels.

### [MODIFY] [roadmap.md](file:///Users/oliver/local/dev/2watcharr/docs/specs/roadmap/roadmap.md)
- Update implementation status for completed features (LabcastARR integration).

### Version Bump & Release
- Merge `develop` into `main`.
- Run `npm version 0.6.3`.
- Push to GitHub and create release using `gh`.

## Verification Plan

### Automated Tests
- Run `npm run lint` to ensure no linting errors.
- Run `npm test` to ensure all tests pass.

### Manual Verification
- Verify that the version in `package.json` is `0.6.3`.
- Verify that `CHANGELOG.md` reflects the 0.6.3 changes.
- Verify that the `gh` release is created successfully.
