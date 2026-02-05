# Release 0.3.0 Implementation Plan

## Goal Description
Prepare and execute the release of version 0.3.0. This involves documenting recent changes, cleaning up roadmap documentation, merging development changes, and tagging the release.

## User Review Required
> [!IMPORTANT]
> Please review the generated CHANGELOG.md entries before I commit them to ensure all important user-facing changes are captured.

## Proposed Changes

### Documentation Updates
#### [MODIFY] [CHANGELOG.md](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/CHANGELOG.md)
- Add section `## [0.3.0] - 2026-02-05`
- List Added features from recent work (Deleted Episodes, Channel Details, UI improvements).
- List Fixed bugs (Mobile views, Podcast metadata, etc.).

#### [MODIFY] [package.json](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/package.json)
- Bump version from `0.2.0` to `0.3.0`.


### Repo Management
- Merge `develop` -> `main`.
- Tag `v0.3.0`.
- Create GitHub release (if `gh` tool available) or push tag.

## Verification Plan

### Automated Tests
- None for the release process itself.
- Current tests should pass before merging. Run `npm test` or `vitest run`.

### Manual Verification
- Review [CHANGELOG.md](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/CHANGELOG.md) content.
- Verify [package.json](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/package.json) version.
- Check `git tag` list after execution.
- Check GitHub release page (if applicable).
