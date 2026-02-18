# Tasks

- [ ] Research and Planning [/]
    - [ ] Explore database schema for episodes/videos `[ ]`
    - [ ] Locate UI component for episode cards `[ ]`
    - [ ] Determine logic for identifying YouTube Shorts `[ ]`
- [x] Database Schema Update
    - [x] Add `isShort` column to the database
    - [x] Create and run migration
- [x] Backend Implementation
    - [x] Update video ingestion logic to detect Shorts
    - [x] Create script to update existing data
- [x] Frontend Implementation
    - [x] Update Episode Card to show "Shorts" pill
- [x] Verification
    - [x] Verify existing data update
    - [x] Verify new Shorts are detected correctly
    - [x] Verify UI displays "Shorts" pill
