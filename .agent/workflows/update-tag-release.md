---
description: Check Linting errors, Update docs, tag and release to Github
---

## Goal
After we finnish a feature we want to make sure there are no linting errors before we update documentation accordingly, make sure that the feature can be merged and bump the version to create a new tag release in github.

## Process 
- First verify that we have no lining errors and all test pass.
- Second, update documentation with recent bugfixes and features. 
- Then, merge branch "develop" into "main" and then bump the version (0.*.+1) tag, or the versión the user specifies, 
- Finally, push to github and create a release in github. You have the github cli available.

## Verification Plan

### Automated Tests
- Run npm run lint to ensure no linting errors.
- Run npm test to ensure all tests pass before release.

### Manual Verification
- Verify that the version in package.json is the correct version
- Verify that the GitHub release is created correctly with the appropriate tag and release notes.