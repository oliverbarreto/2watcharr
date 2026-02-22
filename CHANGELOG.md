# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).
+
+## [0.5.12] - 2026-02-22
+
+### Fixed
+- **UI**: Resolved issue where the navbar search icon did not reflect active status or channel filters.
+
+### Improved
+- **API**: Refactored async operations and centralized database transaction management for better performance and reliability.
+- **API**: Optimized bulk video addition with chunked processing and sequential writes.
+
+### Docs
+- **Readme**: Added comprehensive testing documentation.

## [0.5.11] - 2026-02-22

### Added
- **Watch Next**: New dedicated page for manual video ordering with drag-and-drop support.
- **API**: New `/api/shortcuts/add-videos` endpoint for batch adding multiple videos for a specific tag.
- **Keyboard Shortcuts**: New navigation shortcuts ($g+w$ for Watch Later, $g+n$ for Watch Next, $g+c$ for Channels, $g+s$ for Stats, $g+p$ for Preferences) and search/filter shortcuts ($f$ to toggle, $ESC$ to close).

### Improved
- **UI**: Optimized Stats page layout to provide more horizontal space for Activity Summary and Viewing Time charts.
- **UI**: Restructured Watch List to focus on date-based organization, moving manual ordering to the Watch Next page.

## [0.5.10] - 2026-02-22


### Added
- **API**: Centralized CORS logic for shortcut endpoints to handle preflight requests and consistent header generation.
- **Tech**: Console logging added to API endpoints for improved troubleshooting and observability.

### Improved
- **UI**: Spacing and layout refinements in the "Add Episode" modal form.

### Fixed
- **Logic**: Concurrency safety in `moveToBeginning` to ensure consistent ordering in multi-user or rapid update scenarios.

## [0.5.9] - 2026-02-21

### Added
- **UI**: Silent refresh mechanism for episode updates to prevent full-page reloads and preserve scroll position.

### Fixed
- **Tags**: Case-insensitive and emoji-neutral alphabetical sorting in Preferences tab.
- **Tests**: Fixed type mismatch in `date-grouping.test.ts` for `MediaEpisode` mock.
- **Lint**: Resolved all remaining linting errors and ensured full type safety.

## [0.5.8] - 2026-02-20

### Added
- **UI**: Floating blurred search panel at the top of the page for improved search experience.
- **UI**: Page titles in the navbar for better navigation context.
- **UI**: Copy link button for quick access to video URLs in episode cards and list rows.
- **UI**: Priority status toggle (Favorite/Priority) in episode cards and list rows.
- **Filters**: Priority filter to easily find favorited or prioritized content.
- **Tags**: Context-aware tag sorting (Alphabetical in Preferences, Frequency in Filters, Last used in Add Tags modal).

### Fixed
- **Filters**: Resolved issue where the priority filter was not correctly updating the URL or filtering the list.
- **UI**: Hidden search button on Stats page where it is not used.
- **Lint**: Fixed all remaining linting warnings and errors.

### Improved
- **UI**: Enhanced active menu item visibility in navbar with a subtle red highlight.

## [0.5.7] - 2026-02-19

### Added
- **Stats**: Major restructure of the statistics page using a tabbed interface (Activity, Tags, Events History).
- **Stats**: New "Videos by Tags" interactive line chart in the Tags tab.
- **Stats**: New metrics for "Viewing Time (Today)" and "Watched Today/This Week".
- **Stats**: Added "Select All" and "Deselect All" buttons for tag visibility management.

### Improved
- **Stats**: Reorganized Activity Summary into a more efficient three-column layout.
- **Stats**: Moved "Visible Tags" section below the chart for better horizontal space utilization.

## [0.5.6] - 2026-02-19
+### Added
+- **UI**: Floating bubble on the watchlist page displaying the count of loaded episodes during infinite scroll.
+- **UI**: "Create Note" option directly in the episode card and list row dropdown menus.
+- **Filters**: Content type filters (Video, Shorts, Podcast) in the watchlist filter bar.
+- **Voting**: "Like" and "Don't Like" voting buttons for episodes.
+
+### Improved
+- **UI**: Channel list view with wider thumbnails and more compact layout for consistency.
+
+### Fixed
+- **Filters**: "Like/Don't Like" filter functionality to correctly filter episodes.
+
+## [0.5.5] - 2026-02-18
+
### Added
- **YouTube Shorts**: Automatically differentiate YouTube Shorts from regular videos with a "Shorts" indicator on cards.
- **Episode Notes**: Added ability to add and view personal notes for each episode.
- **Filters**: Introduced a new "With Notes" filter to easily find episodes with existing notes.

### Improved
- **UI**: Added "Clear all filters" button to the filter bar.
- **UI**: Added "x" clear button to search textfields for faster resetting.
- **Workflow**: Enhanced `/update-tag-release` workflow with automated step hints (`// turbo`).

## [0.5.4] - 2026-02-18

### Fixed
- **Navigation**: Resolved error when navigating from watchlist episode to channel page.
- **Navbar**: Fixed broken link to switch user profile.
- **Lint**: Resolved various linting errors across multiple components.

### Improved
- **Watchlist**: Updated section titles to display day names (e.g., Monday, Tuesday) instead of just dates.
- **Channel Details**: Enhanced UI and added ability to filter videos by tag.
- **Assets**: Updated application icon for better mobile experience.

### Docs
- **Research**: Added analysis on handling YouTube Shorts with `yt-dlp`.

## [0.5.3] - 2026-02-15

### Added
- **Bulk Actions**: Added option in settings to soft remove all videos marked with a specific tag.
- **Stats Metrics**: Added "Not Watched" and "Pending Confirmation" metrics to the Activity Summary on the stats page.

### Improved
- **Stats UI**: Moved chart legend placement to be directly below the date filter for better accessibility.

### Fixed
- **Tests**: Updated tests to match the paginated `listEpisodes` API.
- **Lint**: Resolved various linting errors across components and services for a cleaner codebase.

### Docs
- **Deployment**: Added production deployment instructions.
- **Workflows**: Improved `update-tag-release` and `test` skills/workflows.

## [0.5.2] - 2026-02-07

### Added
- **Infinite Scroll**: Added infinite scroll to the Watch List page to improve performance when loading a large number of channels.
- **Default Filter**: Added option to set default filter for the Watch List page.   

### Fixed
- **Tags**: Fixed issue with tags capitalization in the Watch List page.

### Docs
- **Organization**: organized roadmap docs by release tag folders.


## [0.5.1] - 2026-02-06

### Docs
- **Roadmap**: CHANGELOG.md corrected with progress

## [0.5.0] - 2026-02-06

### Docs
- **Roadmap**: Updated roadmap (😎 YES, we screwed up with this version bump. Blanme it on Antigravity)

## [0.4.0] - 2026-02-06

### Added
- **Manual Reordering**: New manual sort option for the watchlist with drag-and-drop support and persistent order.
- **Episode Tags in Stats**: Added a tags column to the events table for better context on activities.
- **Stats Page**: Added legends to all charts for better data visualization.
- **Watchlist**: Introduced manual episode ordering with drag-and-drop support.
- **Timeline Sections**: Added date-based sections (Today, Yesterday, etc.) in the watchlist when filtering by date.
- **Priority Filtering**: Added option to filter for favorites and priority episodes.

### Improved
- **Stats Table UX**: Enhanced sorting and layout for the detailed history and events tables.
- **Stats Page**: Enhanced events table with a new tags column and support for sorting across all columns.
- **Activity Tracking**: Added tracking for soft and hard deletion events.
- **Mobile Reordering**: Optimized drag-and-drop experience for mobile users.

### Fixed
- **Chart Legends**: Added missing legends to stats charts for better data visualization.
- **Missing Events**: Resolved issues preventing podcast events and events for deleted episodes from showing in the history.
- **Manual Sort Sections**: Fixed UI where date headers would still appear when manual sort was active.
- **Watchlist**: Restrict drag-and-drop reordering to manual mode only to prevent UI inconsistencies.

### Docs
- **Database Migrations**: Added guide for applying migrations in production environments.

## [0.3.1] - 2026-02-05

### Added
- **API Tokens**: Individual API tokens for users to authenticate external workflows (e.g., Apple Shortcuts).
- **Paste from Clipboard**: Added a button in the add episode dialog to paste URLs directly from the clipboard.

### Fixed
- **iOS Workflow**: Resolved issues with the iOS Shortcut integration by supporting token-based authentication.
- **Safari Compatibility**: Replaced `window.confirm` with custom dialogs and fixed autofill issues in user management.

### Improved
- **Add Episode Modal**: Added a toggle for tags on mobile devices to save screen space while keeping them accessible.

## [0.3.0] - 2026-02-05

### Added
- **Deleted Episodes Page**: New page to manage soft-deleted episodes, allowing permanent removal or restoration.
- **Channel Details Page**: Dedicated page for viewing channel information, stats, and episodes.
- "Remove permanently" option in episode card dropdowns.

### Changed
- **Mobile Experience**: Enforced grid view on mobile channel pages for better usability.
- **Settings**: General tab is now the default active tab.
- **Channel Cards**: Improved chevron button size for overlay toggling on mobile.

## [0.2.0] - 2026-02-03

### Added
- Pagination and search functionality to the stats table for better data management.
- Column sorting in the Detailed History table on the stats page.
- Enhanced activity charts with period filtering (Today, Week, Month, Year, All Time).
- "Watched", "Favorite", and "Tag" options in episode dropdowns for easier access.
- Action buttons are now always visible in list rows for faster interaction.
- Support for individual metadata synchronization per channel card.
- Responsive navbar with a mobile sheet menu for better mobile navigation.

### Changed
- Improved stats card UI with more compact layouts on mobile.
- Refined episode card grid view UI, including a zoom effect on hover.
- Standardized 'Pending Confirmation' logic and UI feedback across the platform.

### Fixed
- Podcast metadata retrieval now correctly identifies podcasts when given a search URL.
- Resolved various linter errors and standardized string literals.
- Fixed 'pending' watch status filtering and UI inconsistencies.

## [0.1.0] - 2026-02-02

### Added
- Edit User functionality in User Management settings (allows changing icon, color, name, username, and password).
- Responsive Navbar with a mobile sheet menu for improved navigation on small screens.
- 'Pending Confirmation' status for episodes when opened, with visual feedback.
- Dedicated Stats page with library metrics and activity visualization using Area Charts.
- Support for Episode management and Podcast media types, extending core functionality.
- Individual channel card metadata synchronization button for quick updates.
- Channel filtering system (by name, tags, and media type) for better organization.
- Integrated Vitest testing framework with an initial suite of core tests.
- User management system including authentication, onboarding, and multiple user profiles.
- Production-ready Docker configuration with Nginx Proxy Manager support and security hardening.
- Initial project setup with Next.js v15, TypeScript, and Tailwind CSS.
- SQLite database support with `sqlite3` and promise-based wrapper.
- Shadcn/ui component library integration. Using now charts and other components.
- Clean Architecture project structure.
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
- Resolve linter errors by updating image components, simplifying error handling, and standardizing string literals across the codebase.
- Resolved "Failed to fetch videos" runtime error in `video-list.tsx`.
- Fixed build errors related to server-side data fetching and hydration issues.
- Docker environment configuration for local development and iOS sharesheet testing.
