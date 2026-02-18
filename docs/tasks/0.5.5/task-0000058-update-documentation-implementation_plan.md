# Implementation Plan - Update Roadmap to v0.5.4

Update the roadmap to reflect the recent reorganization of tasks and document the features implemented in version 0.5.4.

## Proposed Changes

### Documentation

#### [MODIFY] [roadmap.md](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/docs/specs/roadmap/roadmap.md)

1.  **Update "Implemented Features" for Release 0.5.4**:
    - Replace the broken link to `./docs/specs/roadmap/completed/0.5.4/...` with the correct task files in `./docs/tasks/0.5.4/`.
    - Add the following completed tasks for 0.5.4:
        - `BUGFIX: fix navbar switch user localhost link`
        - `UI: improve channel details page layout`
        - `BUGFIX: fix navigation to channel page from video cards`
        - `UI: show week days in watchlist page dates`
        - `UI: update favicon and navbar icons`
        - `FEATURE: allow adding YouTube Shorts episodes`
        - `UI: add channel filtering in watchlist page`
        - `CHORE: release 0.5.4 preparations (lint, tests, docs)`

2.  **Fix Broken Links for Old Tasks**:
    - Update all links starting with `./docs/tasks/task-` to `./docs/tasks/0.0.1-0.5.3/task-` (unless they belong to 0.5.4).

3.  **Update "Feature Requests"**:
    - Ensure it reflects current state (tasks that were moved to 0.5.4 should be removed from "To be done" if they were there).

## Verification Plan

### Manual Verification
- Verify that all links in the updated `roadmap.md` are valid by clicking them or checking existence via `ls`.
- Confirm that 0.5.4 features are correctly listed and linked.
