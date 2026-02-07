---
description: Update docs, tag and release
---

Let's update documentation with recent bugfixes and features. Then let's merge develop into main and then let's bump the version (0.*.+1) tag, push to github and create a release in github.

You have the github cli available.

## Verification Plan
### Automated Tests
- Run npm run lint to ensure no linting errors.
- Run npm test to ensure all tests pass before release.
### Manual Verification
- Verify that the version in package.json is the correct version
- Verify that the GitHub release is created correctly with the appropriate tag and release notes.