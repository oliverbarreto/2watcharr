# Implementation Plan - Refining Notification Events (V2)

The goal is to improve the notification event flow and clarity, distinguishing between internal 2WatchARR processes and external LabcastARR integrations.

## Proposed Changes

### Domain Models
#### [MODIFY] [models.ts](file:///Users/oliver/local/dev/2watcharr/src/lib/domain/models.ts)
- Add new [NotificationType](file:///Users/oliver/local/dev/2watcharr/src/lib/utils/notification-helpers.ts#55-91) enum values:
  - `EPISODE_SENT_TO_LABCASTARR_INITIATED`
  - `EPISODE_SENT_TO_LABCASTARR_COMPLETED`
  - `EPISODE_SENT_TO_LABCASTARR_FAILED`

### Services
#### [MODIFY] [notification.service.ts](file:///Users/oliver/local/dev/2watcharr/src/lib/services/notification.service.ts)
- Add/Update logging methods:
  - [logEpisodeCreationFinalized](file:///Users/oliver/local/dev/2watcharr/src/lib/services/notification.service.ts#97-107)
  - `logEpisodeSentToLabcastARRInitiated`
  - `logEpisodeSentToLabcastARRCompleted`
  - `logEpisodeSentToLabcastARRFailed`
- Update [logLabcastARRSuccess](file:///Users/oliver/local/dev/2watcharr/src/lib/services/notification.service.ts#130-140) and [logLabcastARRFailed](file:///Users/oliver/local/dev/2watcharr/src/lib/services/notification.service.ts#141-151) to use the new "SENT" types.

#### [MODIFY] [media.service.ts](file:///Users/oliver/local/dev/2watcharr/src/lib/services/media.service.ts)
- Update [saveEpisodeFromMetadata](file:///Users/oliver/local/dev/2watcharr/src/lib/services/media.service.ts#56-194) to log:
  1. `EPISODE_INITIATED` at the start.
  2. `EPISODE_CREATION_FINALIZED` at the end of the local addition process.
  3. `EPISODE_CREATION_FAILED` in a catch block (covering the local process).

#### [MODIFY] [integration.service.ts](file:///Users/oliver/local/dev/2watcharr/src/lib/services/integration.service.ts)
- Update [processEpisodeTags](file:///Users/oliver/local/dev/2watcharr/src/lib/services/integration.service.ts#63-122) and [sendById](file:///Users/oliver/local/dev/2watcharr/src/lib/services/integration.service.ts#124-134) to log the new "SENT TO LABCASTARR" events (Initiated -> Completed/Failed).

### UI / Helpers
#### [MODIFY] [notification-helpers.ts](file:///Users/oliver/local/dev/2watcharr/src/lib/utils/notification-helpers.ts)
- Update [getNotificationTypeLabel](file:///Users/oliver/local/dev/2watcharr/src/lib/utils/notification-helpers.ts#18-54), [getNotificationTypeIcon](file:///Users/oliver/local/dev/2watcharr/src/lib/utils/notification-helpers.ts#55-91), and [getNotificationTypeColor](file:///Users/oliver/local/dev/2watcharr/src/lib/utils/notification-helpers.ts#92-173) to handle the new types and refine existing ones.
- Ensure LabcastARR specific events (Download, Post-processing) are correctly labeled.

## Verification Plan

### Automated Tests
- Run `npm run typecheck` to ensure no model changes broke existing code.
- Run existing tests to ensure no regressions in [MediaService](file:///Users/oliver/local/dev/2watcharr/src/lib/services/media.service.ts#19-684).

### Manual Verification
1. Add a new episode (without auto-send):
   - Check Activity log for: `Requested -> Initiated -> Creation Finalized`.
2. Add a new episode with auto-send tag:
   - Check Activity log for: `Requested -> Initiated -> Creation Finalized -> Sent to Labcastarr Initiated -> Sent to Labcastarr Completed`.
3. Manually send an episode to Labcastarr:
   - Check Activity log for: `Sent to Labcastarr Initiated -> Sent to Labcastarr Completed`.

---

## V3: Labels and Ordering Fixes

The goal is to fix the labels and ensure the event flow order is correct even when events happen in the same second.

### Proposed Changes

#### [MODIFY] [notification-helpers.ts](file:///Users/oliver/local/dev/2watcharr/src/lib/utils/notification-helpers.ts)
- Change `EPISODE_CREATION_FINALIZED` label from "Added to Watchlist" to "Episode Creation Finalized".
- Change `EPISODE_CREATION_FAILED` label from "Failed to Add to Watchlist" to "Episode Creation Failed".

#### [MODIFY] [media.service.ts](file:///Users/oliver/local/dev/2watcharr/src/lib/services/media.service.ts)
- Move [logEpisodeInitiated](file:///Users/oliver/local/dev/2watcharr/src/lib/services/notification.service.ts#86-96) to the beginning of [saveEpisodeFromMetadata](file:///Users/oliver/local/dev/2watcharr/src/lib/services/media.service.ts#56-194) to ensure it always happens before [logEpisodeCreationFinalized](file:///Users/oliver/local/dev/2watcharr/src/lib/services/notification.service.ts#97-107).

#### [MODIFY] [notification.repository.ts](file:///Users/oliver/local/dev/2watcharr/src/lib/repositories/notification.repository.ts)
- Update [findAll](file:///Users/oliver/local/dev/2watcharr/src/lib/repositories/notification.repository.ts#68-115) to use `ORDER BY created_at DESC, rowid DESC` to ensure stable sort based on insertion order for same-second events.

