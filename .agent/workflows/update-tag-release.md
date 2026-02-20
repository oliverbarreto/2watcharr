---
description: Check Linting errors, Update docs, tag and release to Github
---

## Goal
After finishing a feature, we want to ensure no linting errors exist before updating documentation, merging to main, and bumping the version to create a new tag release on GitHub.

## Process 

// turbo
1. **Verification**: Run linting and tests to ensure the codebase is clean.
   - `npm run lint`
   - `npm test`

2. **Documentation**: Update the following files with recent changes (bugfixes, features, etc.):
   - `CHANGELOG.md`: Use [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) format.
   - `docs/specs/roadmap/roadmap.md`: Update implementation status.

// turbo
3. **Commit**: Commit `develop` branch before moving to `main`.
   - `git checkout develop`

// turbo
4. **Merge**: Merge the `develop` branch into `main`.
   - `git checkout main`
   - `git merge develop`

// turbo
5. **Version Bump**: Bump the version in `package.json` (0.*.+1 or user-specified).
   - `npm version [patch|minor|major]`

// turbo
6. **Release**: Push to GitHub and create a release using the GitHub CLI (`gh`).
   - `git push origin main --tags`
   - `gh release create v[version] --notes-from-tag`

## Verification Plan

### Automated Tests
- Run `npm run lint` to ensure no linting errors.
- Run `npm test` to ensure all tests pass before release.

### Manual Verification
- Verify that the version in `package.json` is correct.
- Verify that the GitHub release is created with the appropriate tag and notes.