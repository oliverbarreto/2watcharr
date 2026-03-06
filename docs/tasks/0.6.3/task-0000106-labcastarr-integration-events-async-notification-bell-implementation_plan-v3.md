# Implementation Plan - Asynchronous Episode Addition & Notification Bell

Improve UI/UX by making episode addition non-blocking and providing asynchronous feedback.

## User Review Required

> [!IMPORTANT]
> Since we don't have WebSockets or Server-Sent Events implemented, I will use a **short-polling** mechanism (e.g., every 10-15 seconds) in the frontend to check for new notifications and trigger on-screen toast messages.

## Proposed Changes

### Backend Logic
#### [MODIFY] [media.service.ts](file:///Users/oliver/local/dev/2watcharr/src/lib/services/media.service.ts)
- Create `async addEpisodeBackground(url: string, userId: string, tagIds?: string[])` which handles the full flow but is designed to be called without waiting for the result.
- Update [addEpisodeFromUrl](file:///Users/oliver/local/dev/2watcharr/src/lib/services/media.service.ts#38-53) or create a new entry point that logs `EPISODE_REQUESTED` immediately and returns.

#### [MODIFY] [route.ts](file:///Users/oliver/local/dev/2watcharr/src/app/api/episodes/route.ts)
- Update [POST](file:///Users/oliver/local/dev/2watcharr/src/app/api/integrations/labcastarr/test/route.ts#13-42) handler to call the background addition process and return `202 Accepted` immediately.

### Frontend Components
#### [NEW] [notification-bell.tsx](file:///Users/oliver/local/dev/2watcharr/src/components/features/notifications/notification-bell.tsx)
- Create a bell icon component for the Navbar.
- Display unread count badge.
- Implement short-polling to `/api/notifications` to:
  1. Update unread count.
  2. Detect new "Finalized", "Failed", or "Sent to LabcastARR" events and show browser toasts (`sonner`).

#### [MODIFY] [navbar.tsx](file:///Users/oliver/local/dev/2watcharr/src/components/layout/navbar.tsx)
- Integrate the [NotificationBell](file:///Users/oliver/local/dev/2watcharr/src/components/features/notifications/notification-bell.tsx#11-120) into the navigation bar.

#### [MODIFY] [add-episode-dialog.tsx](file:///Users/oliver/local/dev/2watcharr/src/components/features/episodes/add-episode-dialog.tsx)
- Update [handleSubmit](file:///Users/oliver/local/dev/2watcharr/src/components/features/episodes/add-episode-dialog.tsx#76-129) to handle the `202 Accepted` response.
- Show "Episode requested" toast and close the modal immediately.

## Verification Plan

### Automated Tests
- Run `npm run typecheck` to ensure no interface breakages.

### Manual Verification
1. Add a YouTube URL.
2. Confirm modal closes instantly.
3. Wait ~10-30 seconds.
4. Confirm a toast appears saying "Episode Creation Finalized: [Title]".
5. Confirm the notification bell unread count updates.
6. Confirm the episode appears in the Watchlist (after a manual refresh or navigation).

---

## Notification Bell UX V2

Refine the bell behavior for immediate feedback and intuitive badge management.

### Proposed Changes

#### [MODIFY] [notification-bell.tsx](file:///Users/oliver/local/dev/2watcharr/src/components/features/notifications/notification-bell.tsx)
- **Immediate Updates**: Add an event listener for `episode-added` and `episode-deleted` (or generic `refresh-notifications`) to trigger an immediate fetch.
- **Faster Polling**: Reduce polling interval from 15s to 5s.
- **Badge Clearing**: In the [onClick](file:///Users/oliver/local/dev/2watcharr/src/components/features/notifications/notification-bell.tsx#47-48) handler, call `PATCH /api/notifications` with `{ all: true }` before navigating to `/activity`.
- **Sync State**: Ensure `unreadCount` is set to 0 locally immediately after clicking to provide instant visual feedback.

### Manual Verification
1. Add an episode, confirm the requested toast appears.
2. Observe the bell icon; it should update within 5 seconds (or immediately if event triggered) without page refresh.
3. Click the bell icon.
4. Confirm navigation to `/activity` and that the badge is cleared immediately.

