# Walkthrough - Update Tag Release 0.6.1

The application has been successfully updated to version `0.6.1`. This release focused on critical bug fixes for the archive feature and significant UX improvements for the statistics page.

## Changes Made

### Archive Feature
- **Refined Logic**: The "Archive Watched Episodes" feature now correctly targets only episodes that are both marked as watched AND have priority.
- **Bug Fix**: Resolved the "Failed to unarchive episode" error that occurred on the Archived episodes page.

### Statistics Page
- **Enhanced Search**: Added a search textfield to both "Channels" and "Tags" tabs to allow for easier filtering of large datasets.
- **Top 5 Reset**: Added a "Top 5" button to quickly reset filters and display the most significant data points.

### Code Quality
- **Linting**: Fixed all remaining linting errors across the codebase.
- **Verification**: Verified that all 134 tests across 26 test files passed successfully.

## Verification Results

### Automated Tests
- `npm run lint`: Passed with no errors.
- `npm test`: 26 test files passed, 134 tests total.

### Git Release
- **Tag**: `v0.6.1` created and pushed.
- **GitHub Release**: Created with notes automatically generated from the tag.
- **Synchronized Branches**: `main` and `develop` are currently aligned.

---

The release is live and can be viewed on GitHub.
