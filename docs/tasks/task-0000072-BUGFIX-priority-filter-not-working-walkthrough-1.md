# Walkthrough: Priority Filter Bug Fix

I have fixed the issue where the priority filter was not working as expected. The filter now correctly updates the URL, remains active until toggled off, and filters the episode list to show only high-priority content.

## Changes Made

### Frontend
- **[page.tsx](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/app/page.tsx)**: Updated to extract `priority` from the URL and include it when updating search parameters.
- **[episode-list.tsx](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/components/features/episodes/episode-list.tsx)**: Updated to pass the `priority` filter to the backend API and re-fetch episodes when it changes.

## Verification Results

### Manual Verification
- **Priority Toggle**: Clicking the Gem icon correctly toggles the priority filter.
- **URL Update**: The URL correctly reflects the state of the filter (e.g., `?priority=high`).
- **Data Filtering**: The episode list correctly filters down to only high-priority episodes.
- **Persistence**: The filter remains active after a page refresh if it was active in the URL.

The following recording demonstrates the fix:
![Priority Filter Verification](/Users/oliver/.gemini/antigravity/brain/7cff6057-a5ae-48ca-9507-785d9a0ed1c9/verify_priority_filter_1771609107765.webp)
*In the recording, you can see the filter bar being opened, the priority toggle being clicked, and the list filtering from 208 episodes down to 3.*
