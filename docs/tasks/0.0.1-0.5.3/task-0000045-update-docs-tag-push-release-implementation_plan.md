# Release 0.5.2 Implementation Plan

Automate the release process for version 0.5.2 including documentation updates, version bumping, and GitHub release creation.

## Proposed Changes

### [Documentation]
#### [MODIFY] [CHANGELOG.md](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/CHANGELOG.md)
Commit the current staged changes in [CHANGELOG.md](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/CHANGELOG.md) which document the `0.5.2` release.

### [Build & Versioning]
#### [MODIFY] [package.json](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/package.json)
Update version from `0.5.1` to `0.5.2`.

## Release Workflow

1.  **Commit Documentation**: Commit the staged [CHANGELOG.md](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/CHANGELOG.md) and any other pending documentation changes on the `develop` branch.
2.  **Merge into main**: Merge `develop` branch into `main`.
3.  **Version Bump**: Update [package.json](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/package.json) to version `0.5.2` on `main`.
4.  **Tagging**: Create a git tag `v0.5.2`.
5.  **Push**: Push `develop`, `main`, and tags to origin.
6.  **GitHub Release**: Create a release on GitHub with the notes from [CHANGELOG.md](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/CHANGELOG.md).

## Verification Plan

### Automated Tests
- Run `npm run lint` to ensure no linting errors.
- Run `npm test` to ensure all tests pass before release.

### Manual Verification
- Verify that the version in [package.json](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/package.json) is `0.5.2`.
- Verify that the GitHub release is created correctly with the appropriate tag and release notes.
