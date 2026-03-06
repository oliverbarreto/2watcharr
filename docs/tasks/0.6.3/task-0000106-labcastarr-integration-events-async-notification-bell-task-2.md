# Task: LabcastARR Integration - Events

- [x] Initial Research and Planning
    - [x] Read task description
    - [x] Explore existing LabcastARR integration implementation
    - [x] Explore existing logging/event system (if any)
    - [x] Design database schema for events/notifications
- [x] Implement Database Schema
    - [x] Create migration for `notifications` table
    - [x] Add dedicated migration for notifications table to handle existing installations
    - [x] Update [src/lib/db/schema.sql](file:///Users/oliver/local/dev/2watcharr/src/lib/db/schema.sql)
- [x] Implement Backend Logic (V1)
    - [x] Create [Notification](file:///Users/oliver/local/dev/2watcharr/src/lib/domain/models.ts#27-38) type and model
    - [x] Create [NotificationRepository](file:///Users/oliver/local/dev/2watcharr/src/lib/repositories/notification.repository.ts#28-186)
    - [x] Create [NotificationService](file:///Users/oliver/local/dev/2watcharr/src/lib/services/notification.service.ts#5-154)
    - [x] Integrate notification logging into [media.service.ts](file:///Users/oliver/local/dev/2watcharr/src/lib/services/media.service.ts) or [integration.service.ts](file:///Users/oliver/local/dev/2watcharr/src/lib/services/integration.service.ts)
    - [x] Integrate notification logging into LabcastARR send flow
    - [x] Create API routes for notifications (GET, POST, PATCH, DELETE)

- [x] Implement Frontend UI
    - [x] Create Activity Page (`/activity`)
    - [x] Create Notification Table component with filters
    - [x] Implement Pagination for notifications
    - [x] Implement Mark as Read/Unread logic
    - [x] Implement Delete Read/All events logic
    - [x] Update episode details page to show errors
    - [x] Add second toaster message when sending to LabcastARR

- [x] Verification and Testing
    - [x] Verify toaster messages
    - [x] Verify activity log page and filters
    - [x] Verify error display on episode card
    - [x] Verify notification persistence and cleanup
    - [x] Fix typecheck errors (Next.js 16 async params, test mocks)

- [x] Notification Events V2
    - [x] Update [NotificationType](file:///Users/oliver/local/dev/2watcharr/src/lib/utils/notification-helpers.ts#55-91) models
    - [x] Update [NotificationService](file:///Users/oliver/local/dev/2watcharr/src/lib/services/notification.service.ts#5-154) logging methods
    - [x] Refine [MediaService](file:///Users/oliver/local/dev/2watcharr/src/lib/services/media.service.ts#19-723) local addition flow (Requested -> Initiated -> Finalized)
    - [x] Refine [IntegrationService](file:///Users/oliver/local/dev/2watcharr/src/lib/services/integration.service.ts#14-146) LabcastARR flow (Sent Initiated -> Sent Completed/Failed)
    - [x] Update UI helpers with new labels and icons

- [x] Notification Events V3
    - [x] Restore "Episode Creation Finalized" label in UI helpers
    - [x] Reorder event logging in `MediaService.ts`
    - [x] Implement stable sort in `NotificationRepository.ts`
    - [x] Verify flow: Requested -> Initiated -> Finalized
    - [x] Verify LabcastARR flow sequence

- [x] Asynchronous Episode Addition & Notification UI
    - [x] Create `addEpisodeBackground` logic in `MediaService.ts`
    - [x] Update API route to return 202 Accepted
    - [x] Update frontend modal to handle async response
    - [x] Implement [NotificationBell](file:///Users/oliver/local/dev/2watcharr/src/components/features/notifications/notification-bell.tsx#11-115) component with unread count
    - [x] Implement polling/toast logic for new events
    - [x] Integrate bell into Navbar





