# Walkthrough - Version 0.6.2 Release

I have successfully updated the project to version 0.6.2 by following the `update-tag-release` workflow.

## Changes Included in 0.6.2

- **UI Improvements**:
  - Moved the list/grid toggle in the "Watch Next" page to the far right.
  - Streamlined the navbar by removing direct links to "Archive", "Stats", and "Settings" (consolidated under the user profile or accessible via keyboard shortcuts).
  - Consolidated "Today" and "Yesterday" sections in the watchlist into a unified "Today & Yesterday" view.
  - Page titles in the navbar are now only visible on mobile.
- **New Shortcuts**: Added `CMD + ESC` to clear filters and close the search panel.
- **Bug Fixes**: Resolved a critical issue preventing the app from launching on a fresh start by ensuring database creation.

## Verification Results

### Automated Tests & Linting
- [x] `npm run lint`: Passed with no errors.
- [x] `npm test`: All 134 tests in 26 test files passed.

### Git Operations
- [x] Committed changes to `develop` branch.
- [x] Merged `develop` into `main`.
- [x] Bumped version to `0.6.2` in `package.json`.
- [x] Pushed `main` and tags to GitHub.

## Release Link
- [v0.6.2 Release on GitHub](https://github.com/oliverbarreto/2watcharr/releases/tag/v0.6.2)
