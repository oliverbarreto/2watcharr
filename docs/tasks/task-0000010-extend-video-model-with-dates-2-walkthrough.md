# Walkthrough - Video Event Tracking

I have extended the video model to track important dates (Added, Watched, Favorited, Removed, Restored) and implemented a test-driven approach to verify the logic.

## Changes Made

### 1. Database & Models
- Created a `video_events` table to store all life cycle events for videos.
- Added a migration to backfill initial 'added' events for existing videos.
- Updated the [Video](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/lib/domain/models.ts#14-42) domain model to include event timestamps.

### 2. Backend Logic (TDD)
- Set up a testing environment with **Vitest** and an in-memory SQLite helper.
- Implemented and passed **7 unit/integration tests** covering:
    - Event recording in the repository.
    - Aggregation of latest timestamps in find/list queries.
    - Sorting by event dates.
    - Service-layer integration for automatic event recording.

### 3. Frontend Enhancements
- Added new sort options to the filter bar: **Date Added**, **Date Watched**, **Date Favorited**, and **Date Removed**.
- Updated **Video Card** and **Video List Row** to display the most recent relevant event (e.g., "Watched 2 hours ago", "Added 3 days ago").

## Verification Results

### Automated Tests
All 7 tests passed successfully:
```bash
 RUN  v4.0.18 /Users/oliver/_HD_LOCAL/dev/2watcharr

 ✓ src/lib/services/video.service.test.ts (4 tests) 11ms
 ✓ src/lib/repositories/video.repository.test.ts (3 tests) 1114ms
     ✓ should sort videos by event dates  1106ms    
                        
 Test Files  2 passed (2)
      Tests  7 passed (7)
```

### Manual Verification
- Verified that sorting by "Date Watched" correctly prioritizes recently watched videos.
- Verified that "Restored" status is shown when a previously removed video is added back.
- Verified that event dates are formatted naturally using `date-fns`.

## Code Highlights

### Event Recording
```typescript
// in VideoService
async toggleWatched(id: string): Promise<Video> {
    const video = await this.videoRepo.findById(id);
    const newWatched = !video.watched;
    const updatedVideo = await this.videoRepo.update(id, { watched: newWatched });
    
    // Record event
    await this.videoRepo.addEvent(id, newWatched ? 'watched' : 'unwatched');
    
    return updatedVideo;
}
```

### Query Aggregation
```sql
-- in VideoRepository
SELECT v.*,
(SELECT created_at FROM video_events WHERE video_id = v.id AND type = 'added' ORDER BY created_at DESC LIMIT 1) as last_added_at,
...
```
