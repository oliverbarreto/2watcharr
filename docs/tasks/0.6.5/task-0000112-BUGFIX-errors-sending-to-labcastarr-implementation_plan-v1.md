# Implementation Plan - LabcastARR Integration Fixes and UX Improvements

This plan addresses several issues related to sending episodes to LabcastARR, notification toast loops, and accessibility errors in dialogs.

## Proposed Changes

### 1. Fix Toast Message Loop (Error 1)
The [NotificationBell](file:///Users/oliver/local/dev/2watcharr/src/components/features/notifications/notification-bell.tsx#11-150) component remounts on every navigation, causing it to re-toast unread notifications because its internal state is reset.

#### [MODIFY] [notification-bell.tsx](file:///Users/oliver/local/dev/2watcharr/src/components/features/notifications/notification-bell.tsx)
- Use a `Ref` for `lastNotificationId` and `isInitialMount` to manage state across renders without triggering premature effects.
- Implement `localStorage` persistence for `shownToastIds` to ensure that a toast for a specific notification is only shown once per user session/device, even across page navigations.
- Listen for a new custom event `notification-updated` (in addition to `episode-added`) to refresh the unread count immediately.

### 2. Fix DialogTitle Accessibility Error (Error 2)
Redundant nested [Dialog](file:///Users/oliver/local/dev/2watcharr/src/components/ui/command.tsx#32-62) components in tag management sections were causing accessibility warnings.

#### [MODIFY] [episode-list-row.tsx](file:///Users/oliver/local/dev/2watcharr/src/components/features/episodes/episode-list-row.tsx)
- Remove the outer `<Dialog>` and `<DialogContent>` that wrap the `<CommandDialog>`.
- [CommandDialog](file:///Users/oliver/local/dev/2watcharr/src/components/ui/command.tsx#32-62) is a complete dialog component and should not be nested inside another `DialogContent`.

#### [MODIFY] [episode-card.tsx](file:///Users/oliver/local/dev/2watcharr/src/components/features/episodes/episode-card.tsx)
- Apply the same fix as above for the tag management section.

### 3. LabcastARR Send UX Improvements
Enhance the feedback when manually sending an episode to LabcastARR.

#### [MODIFY] [integration.service.ts](file:///Users/oliver/local/dev/2watcharr/src/lib/services/integration.service.ts)
- Add notification logging to [sendById](file:///Users/oliver/local/dev/2watcharr/src/lib/services/integration.service.ts#124-134) so that manual sends also appear in the Activity Log and contribute to the unread count.

#### [MODIFY] [episode-list-row.tsx](file:///Users/oliver/local/dev/2watcharr/src/components/features/episodes/episode-list-row.tsx) & [episode-card.tsx](file:///Users/oliver/local/dev/2watcharr/src/components/features/episodes/episode-card.tsx)
- Update [handleSendToLabcastARR](file:///Users/oliver/local/dev/2watcharr/src/components/features/episodes/episode-card.tsx#362-383) to show a more descriptive toast matching the background processing style (success/error).
- Dispatch the `notification-updated` event after a successful send to update the notification bell badge immediately.

## Verification Plan

### Automated Tests
- Run `npm run lint` to ensure no new accessibility warnings or lint errors are introduced.
- Run `npm test` to ensure existing services still function correctly.

### Manual Verification
1. **Toast Loop Fix**:
   - Add an episode and wait for the success notification toast.
   - Navigate between "Home" and "Activity" pages without clicking the "View" button in the toast.
   - Verify that the toast **does not** reappear on subsequent page loads.
2. **LabcastARR Send UX**:
   - Manually send an episode to LabcastARR from the dropdown menu.
   - Verify that a toast message appears with a "View" button.
   - Verify that the notification bell badge updates immediately with a new unread notification.
3. **Accessibility Error**:
   - Open the browser console and navigate to the Home page.
   - Verify that the `DialogContent` accessibility warning is no longer present when opening the "Manage Tags" dialog.
