# Plan: Align Develop and Main Branches

Align the `develop` branch with `main` by merging the latest changes from `develop` into `main`, updating documentation, and creating a new tag release (`v0.5.12`).

## Proposed Changes

### Branch Management
- Merge `develop` into `main`.
- Resolve any conflicts (especially in [package.json](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/package.json) where `main` is `0.5.11` and `develop` is `0.5.10`).

### Documentation
- Update [CHANGELOG.md](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/CHANGELOG.md) with the latest changes from `develop`:
    - Fix navbar search icon visual state.
    - Improved async API calls and transaction management.
    - README updates.
- Update [docs/specs/roadmap/roadmap.md](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/docs/specs/roadmap/roadmap.md) if necessary.

### Release Process
- Bump version to `0.5.12` on `main`.
- Create a new GitHub release for `v0.5.12`.
- Merge `main` back into `develop` to synchronize the version and documentation.

## Verification Plan

### Automated Tests
- Run `npm run lint` on both branches.
- Run `npm test` to ensure no regressions.

### Manual Verification
- Verify [package.json](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/package.json) version on both branches after the process.
- Verify [CHANGELOG.md](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/CHANGELOG.md) contains the new entries.
- Verify the GitHub release is visible (if I have access to push).
