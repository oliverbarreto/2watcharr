# Feature: Video Management

## Overview
Improve how videos are managed in the database, including soft deletion, restoration, and metadata tracking.

## Status: Partally Completed

## Tasks
- [x] **Soft Delete Implementation**
    - [x] Add `is_deleted` column to `videos` table.
    - [x] Update delete logic to set `is_deleted = true` instead of physical deletion.
- [x] **Video Restoration**
    - [x] Implement logic to restore a soft-deleted video when it is re-added.
    - [x] Ensure metadata (title, views, etc.) is updated upon restoration.
    - [x] Reset `watched` status to `false` when a video is re-added.
- [x] **Date and Event Tracking**
    - [x] Create `video_events` table to track when videos are added, watched, or favorited.
    - [x] Update repository layers to record these events automatically.
- [x] **Advanced Sorting**
    - [x] Add sorting options for "Date Added", "Date Watched", etc., based on tracked events.
- [ ] **Data Export/Import**
    - [ ] Add ability to export the watchlist to JSON/CSV.
    - [ ] Add ability to import a watchlist.
