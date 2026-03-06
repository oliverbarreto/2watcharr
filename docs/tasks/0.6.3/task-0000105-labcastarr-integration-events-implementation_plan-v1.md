# Implementation Plan - LabcastARR Integration Events

Improve 2watcharr by adding a notification/activity system and enhancing user feedback for LabcastARR integration.

## Proposed Changes

### Database & Models

#### [MODIFY] [models.ts](file:///Users/oliver/local/dev/2watcharr/src/lib/domain/models.ts)
- Define `NotificationType` enum following LabcastARR's types.
- Define `Notification` interface.
- Add `channelName` and `executedBy` fields.

#### [NEW] [add_notifications.ts](file:///Users/oliver/local/dev/2watcharr/src/lib/db/migrations/add_notifications.ts)
- Create `notifications` table with fields: [id](file:///Users/oliver/local/dev/2watcharr/src/lib/services/media.service.ts#532-620), `user_id`, `type`, `channel_name`, `executed_by`, `description`, `episode_id`, `is_read`, `created_at`.
- Add indexes for `user_id`, `type`, `is_read`, and `created_at`.

### Backend Services

#### [NEW] [notification.repository.ts](file:///Users/oliver/local/dev/2watcharr/src/lib/repositories/notification.repository.ts)
- CRUD operations for notifications.
- Support for filtering and pagination.
- Mark as read/unread, bulk delete.

#### [NEW] [notification.service.ts](file:///Users/oliver/local/dev/2watcharr/src/lib/services/notification.service.ts)
- Business logic for notifications.
- High-level methods for logging events (e.g., `logEpisodeRequested`, `logLabcastARRSuccess`).

#### [MODIFY] [media.service.ts](file:///Users/oliver/local/dev/2watcharr/src/lib/services/media.service.ts)
- Inject `NotificationService`.
- Log `EPISODE_REQUESTED` and `EPISODE_INITIATED` when adding episodes.

#### [MODIFY] [integration.service.ts](file:///Users/oliver/local/dev/2watcharr/src/lib/services/integration.service.ts)
- Log `EPISODE_CREATION_FINALIZED` or `EPISODE_CREATION_FAILED` when sending to LabcastARR.

### API Routes

#### [NEW] [route.ts](file:///Users/oliver/local/dev/2watcharr/src/app/api/notifications/route.ts)
- GET: List notifications with pagination and filters.
- PATCH: Bulk mark as read/unread.
- DELETE: Bulk delete.

#### [NEW] [[id]/route.ts](file:///Users/oliver/local/dev/2watcharr/src/app/api/notifications/[id]/route.ts)
- PATCH: Mark individual as read/unread.
- DELETE: Delete individual.

### Frontend UI

#### [MODIFY] [add-episode-dialog.tsx](file:///Users/oliver/local/dev/2watcharr/src/components/features/episodes/add-episode-dialog.tsx)
- Check if episode tags include LabcastARR auto-tag.
- Show second toaster: "Sent to LabcastARR".

#### [NEW] [page.tsx](file:///Users/oliver/local/dev/2watcharr/src/app/activity/page.tsx)
- Activity log page with DataTable.
- Pagination, column filtering, and bulk actions.

#### [NEW] [notification-helpers.ts](file:///Users/oliver/local/dev/2watcharr/src/lib/utils/notification-helpers.ts)
- Port the sample code for labels, icons, and colors.

#### [MODIFY] [episode-details.tsx](file:///Users/oliver/local/dev/2watcharr/src/components/features/episodes/episode-details.tsx)
- Display errors stored in notifications (or in a new `error` field in `episodes` table).
- *Decision*: Better to add an `error_message` column to `episodes` table for quick access? Or just pull from notifications?
- *Proposed*: Add `error` field to [UpdateEpisodeDto](file:///Users/oliver/local/dev/2watcharr/src/lib/domain/models.ts#115-132) and `episodes` table.

## Verification Plan

### Automated Tests
- N/A (Project seems to rely on manual verification for UI features).

### Manual Verification
1. **Toaster Messages**:
   - Add a video without LabcastARR tag -> Observe one toast.
   - Add a video with LabcastARR tag -> Observe two toasts.
2. **Activity Log**:
   - Navigate to `/activity`.
   - Verify events are logged for added episodes.
   - Verify filters (Type, Channel, User).
   - Verify pagination.
   - Test "Mark as Read" and "Delete Read" buttons.
3. **LabcastARR Integration**:
   - Trigger a send to LabcastARR.
   - Verify "Episode Creation Finalized" event appears in Activity page.
   - Simulate a failure and verify "Episode Creation Failed" event appears and shows in episode details.
