# Archive Episodes Feature Walkthrough

I have implemented the Archive feature for episodes, allowing you to move watched or irrelevant episodes to a separate "Archived" section, keeping your main "Watch Next" and "Watch List" views clean.

## Key Changes

### Backend
- **Database Schema**: Added `is_archived` (boolean) and `archived_at` (timestamp) columns to the `episodes` table with appropriate indexes.
- **API Endpoints**:
    - `PATCH /api/episodes/[id]`: Updated to handle `isArchived` status.
    - `POST /api/episodes/archive-all-watched`: New endpoint for bulk archiving.
    - `POST /api/episodes/unarchive-all`: New endpoint for bulk unarchiving.
- **Service Layer**: Implemented core logic for archiving and unarchiving in [MediaService](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/lib/services/media.service.ts#16-597).

### Frontend
- **Archived Page**: A new dedicated page at `/archived` to view and manage archived episodes.
- **UI Integration**:
    - Added **Archive** / **Unarchive** buttons to [EpisodeCard](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/components/features/episodes/episode-card.tsx#65-1034) and [EpisodeListRow](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/components/features/episodes/episode-list-row.tsx#72-1041).
    - Integrated "Archive Watched" and "View Archived" buttons in the [WatchNext](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/app/watchnext/page.tsx#339-354) page.
    - Added "Archived" and "Deleted" links to the Navbar user dropdown.
    - Updated Date Grouping to support sorting by "Archived Date".

## How to use

### Archiving Episodes
You can archive individual episodes from the **Watch Next** or **Watch List** pages using the archive icon (cabinet box) in the episode card or list row.

### Bulk Archiving
On the **Watch Next** page, use the **Archive Watched** button to quickly archive all episodes you've already watched.

### Managing Archived Episodes
Navigate to the **Archived** page via the Navbar or the "View Archived" button. Here you can search, filter, and sort your archived episodes. You can also unarchive them individually or use the **Unarchive All** button to bring everything back to your active lists.

## Verification Results

### Automated Tests
- Database migrations were successfully registered and verified against the schema.
- API endpoints for bulk actions were tested for correct database updates.

### Manual Verification
- Verified individual archive/unarchive actions with confirmation dialogs.
- Verified bulk archive/unarchive functionality.
- Verified date grouping on the Archived page (episodes are grouped by the date they were archived).
- Verified responsive UI on mobile and desktop views.
