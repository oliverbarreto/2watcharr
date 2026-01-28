# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Initial project setup with Next.js v15, TypeScript, and Tailwind CSS
- SQLite database support with `sqlite3` and promise-based wrapper
- shadcn/ui component library integration
- Clean Architecture project structure
- Default view setting (Grid/List) in general settings with persistent preference.
- Soft delete functionality for videos with `is_deleted` flag.
- Restore functionality for previously deleted videos when re-added, updating metadata and resetting watched status.
- Red "handle" line at the bottom of video cards for improved dragging experience.
- Improved iOS Shortcut with success/error notifications and progress indicator.
- Support for displaying all channel tags in channel cards.
- Tag management capability in video list view, matching grid view functionality.
- Video event tracking system (Added, Watched, Favorited dates).
- New sorting options in the watchlist based on event dates.

### Changed
- "Add Video" button relocated to the top navigation bar as a prominent red circular button.
- View toggle (Grid/List) moved to the page header for better visibility.
- Channel card name now links directly to the YouTube channel.
- Share icon removed from channel cards.
- Updated filter icons using Lucide Play icons (filled/outlined) for watched/unwatched status.
- Refined watchlist layout for improved responsiveness on mobile devices (search and filters on separate rows).

### Fixed
- Resolved "Failed to fetch videos" runtime error in `video-list.tsx`.
- Fixed build errors related to server-side data fetching and hydration issues.
- Docker environment configuration for local development and iOS sharesheet testing.
