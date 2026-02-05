# Task: Create a skill to update docs, tag and release

I want to create a new SKILL to standardize the process of updating the documentation and releasing the project. I want you to help me create it. Here is my process. Feel free identify ways to improve it. Let me know before actually making any changes.

## Goal Task: update docs, tag and release

Make sure we updated documentation with recent features and bug fixex (in `docs/specs/roadmap/completed`)  and then, prepare the project to merge develop branch into main, and tehn bump the version tag (minor version 0.+1.0) and push to github to create a new release.

### Initiating Release Preparation

You must focus on release preparation. This task involves analyzing git history and updating documentation. You'll check commits after the last version bump to update the documentation accordingly. 

You'll also meticulously check and refresh the "completed" features and "completed" bugs in the documentation. This includes specifically targeting the markdown files found in the `docs/specs/roadmap/` and `docs/specs/roadmap/completed` directories.

You will explore and review docs to decide what to move to "completed".

### Orchestrating Release Workflow

You're now zeroing in on the release merge and tagging. Your next moves include merging the develop branch into main and then tagging with a new version number (e.g. 0.1.0), increasing the version the user tells you: releavant changes (+1.*.*) minor (+0.+1.*) or patch (*.*.+1). 

After tagging you will push both changes and the tag to GitHub. 
