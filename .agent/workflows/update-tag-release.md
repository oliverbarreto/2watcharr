---
description: Check Linting errors, Update docs, tag and release to Github (Usage: /update-tag-release [patch|minor|major|x.x.x])
---

## Goal

After finishing a feature, we want to ensure that all tests pass and no linting errors exist before updating documentation, merging to main, and bumping the version to create a new tag release on GitHub.

## ARGUMENTS

- Version bump: {{1}}

## Process 

// turbo
1. **Verification**: Run linting and tests to ensure the codebase is clean.
   - `npm run lint`
   - `npm test`
   - Note: run `npm run lint` if necessary after passing all tests if any changes were made due to correct code of failing tests

2. **Documentation**: Update the following files with recent changes (bugfixes, features, etc.) taking into account the version bump {{1}}:
   - `CHANGELOG.md`: Use [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) format.
   - `docs/specs/roadmap/roadmap.md`: Update implementation status.

// turbo
3. **Commit**: Commit `develop` branch before moving to `main`.
   - `git add --all && git commit -m "Run tests, fixed linting errors and updated documentation before merge/tag/release into main"`

// turbo
4. **Merge**: Merge the `develop` branch into `main`.
   - `git checkout main`
   - `git merge develop`

// turbo
5. **Version Bump**: Bump the version in `package.json` using the provided argument.
   - `npm version {{1}}`

// turbo
6. **Release**: Push to GitHub and create a release using the GitHub CLI (`gh`).
   - `git push origin main --tags`
   - `gh release create v$(node -p "require('./package.json').version") --notes-from-tag`

## Verification Plan

### Automated Tests
- Run `npm run lint` to ensure no linting errors.
- Run `npm test` to ensure all tests pass before release.

### Manual Verification
- Verify that the version in `package.json` is correct.
- Verify that the GitHub release is created with the appropriate tag and notes.