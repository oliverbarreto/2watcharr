# Implementation Plan - Add API Logging & Fix Reordering

The goal is to add request logging to the `/api/shortcuts/add-video` and `/api/shortcuts/add-episode` endpoints to help debug why episodes are not appearing despite success responses. We will also fix a bug in [moveToBeginning](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/lib/repositories/episode.repository.ts#613-622) that might cause issues in multi-user environments.

## Proposed Changes

### [API Routes]

#### [MODIFY] [add-video/route.ts](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/app/api/shortcuts/add-video/route.ts)
- Add performance logging (start time, status, duration) for incoming POST requests.
- Log the received URL and any tags.

#### [MODIFY] [add-episode/route.ts](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/app/api/shortcuts/add-episode/route.ts)
- Add performance logging (start time, status, duration) for incoming POST requests.
- Log the received URL and any tags.

### [Repositories]

#### [MODIFY] [episode.repository.ts](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/lib/repositories/episode.repository.ts)
- Fix [moveToBeginning](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/lib/repositories/episode.repository.ts#613-622) and [moveToEnd](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/lib/repositories/episode.repository.ts#623-632) to correctly filter by `userId` and `isDeleted = 0` when fetching the list of episodes to reorder.
- Update [moveToBeginning](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/lib/repositories/episode.repository.ts#613-622) signature to accept `userId`.

### [Services]

#### [MODIFY] [media.service.ts](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/lib/services/media.service.ts)
- Pass `userId` to [moveToBeginning](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/lib/repositories/episode.repository.ts#613-622) call in [addEpisodeFromUrl](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/lib/services/media.service.ts#28-132).

## Verification Plan

### Automated Tests
- Run existing tests to ensure no regressions: `npm test`
- Create a new test case for [moveToBeginning](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/lib/repositories/episode.repository.ts#613-622) to verify it only affects the user's episodes.

### Manual Verification
- Use `curl` to send a POST request to `/api/shortcuts/add-video` and verify the logging appears in the console.
- Use `curl` to send a POST request to `/api/shortcuts/add-episode` and verify the logging appears in the console.
- Check the database after each call to ensure the episode is actually present.
