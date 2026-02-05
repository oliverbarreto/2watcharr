# Release v0.3.0 Walkthrough

## Summary
Successfully prepared and executed the release of **v0.3.0**. The release includes significant features like the Deleted Episodes page, Channel Details page, and various mobile UI improvements.

## Changes Executed

### Documentation
- Updated [CHANGELOG.md](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/CHANGELOG.md) to include all new features and fixes.
- Verified roadmap items (although cleanup was postponed as per request).

### Repository Management
- **Merged** `develop` branch into `main`.
- **Bumped Version** to `0.3.0` in [package.json](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/package.json).
- **Tagged** release `v0.3.0` locally.

## Verification
- `git log` shows the merge commit and version bump on `main`.
- `git tag` lists `v0.3.0`.

## Next Steps for User
Since the `gh` CLI tool was not available, the final push to GitHub and release creation needs to be done manually or via git push:

```bash
git push origin main
git push origin v0.3.0
```

And then draft the release on GitHub.com using the content from [CHANGELOG.md](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/CHANGELOG.md).
