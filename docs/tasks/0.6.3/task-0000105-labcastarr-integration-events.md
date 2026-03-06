# TASK: FEATURE - LabcastARR Integration - Events

## Overview

After creating the integration with LabcastARR API we need to improve a couple of things.

1. When we add an episode via adding a url we get a toaster message, for example we add a youtube video. But in case we add the same video but we add the tag to send it to LabcastARR, we get the very same toaster message indicating that we added the video, but we don't get any information about the fact that the episode was sent to LabcastARR. We should get a second toaster message indicating that the episode was sent to LabcastARR.

2. Moreover, now that the app has clearly become much more than a proof of concept, and it is now an essential tool for me, and to manage all videos that i want to watch, and now that we can also send episodes to LabcastARR, we should improve the way the app logs information and events that happend in the app.


## Requirements

Also, I want to replicate the same idea we got in LabcastARR for creating a history or a log of events, but adapted to 2watcharr. In LabcastARR we got "/activity" page, see the image. This activity log is also in line with loggin in the console of the app.

In the image you can see how we track in LabcastARR the activity of notifications events from bottom to top for two episodes created from the user with the right flow of notifications. The flow is as follows:
Episode Requested (User) -> Episode Initiated (System) -> Download Initiated (System) -> Download Completed (System) -> Episode Creation Finalized (User)

We should manage errors gracefully and show them to the user in the episode details page utilizing domain error messages and user friendly messages for the user, for example, as we already do with other api calls to `yt-dlp`. Therefore, we should also include the error in the activity log and in the table

We show for each event the following information:
- Type
- Channel
- Date
- Time
- Executed By
- Description

And we provide a way to filter the events by type, channel, date, time, executed by and description.
We also allow the user to mark events as read/unread, delete read events and also delete all events.
The user can also mark individual notifications (rows in the table) as read/unread by clicking on the action dropdown menu option with the horizontal ellipsis button.
The page also uses pagination enabled to show the events in pages of 10 events per page, and has at the bottom the necessary controls to navigate between pages and to set events per page from the range: 10, 25, 50, 100.

## Sample code used in LabcastARR definition of Notifications events

```typescript
/**
 * Notification Helper Utilities
 * 
 * Provides utility functions for working with notifications:
 * - Type labels (user-friendly text)
 * - Type icons (Lucide React icons)
 * - Type colors (Tailwind CSS classes)
 */

import { NotificationType } from '@/types'
import {
  CheckCircle,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Download,
  PlayCircle,
  Settings,
  type LucideIcon,
} from 'lucide-react'

/**
 * Get user-friendly label for notification type
 * 
 * @param type - Notification type enum value
 * @returns Human-readable label
 */
export function getNotificationTypeLabel(type: NotificationType): string {
  switch (type) {
    case NotificationType.EPISODE_REQUESTED:
      return 'Episode Requested'
    case NotificationType.EPISODE_INITIATED:
      return 'Episode Initiated'
    case NotificationType.EPISODE_DOWNLOAD_INITIATED:
      return 'Download Initiated'
    case NotificationType.EPISODE_DOWNLOAD_COMPLETED:
      return 'Download Completed'
    case NotificationType.EPISODE_DOWNLOAD_FAILED:
      return 'Download Failed'
    case NotificationType.EPISODE_POST_PROCESSING_STARTED:
      return 'Post-Processing Started'
    case NotificationType.EPISODE_POST_PROCESSING_COMPLETED:
      return 'Post-Processing Completed'
    case NotificationType.EPISODE_POST_PROCESSING_FAILED:
      return 'Post-Processing Failed'
    case NotificationType.EPISODE_CREATION_FINALIZED:
      return 'Episode Creation Finalized'
    case NotificationType.EPISODE_CREATION_FAILED:
      return 'Episode Creation Failed'
    default:
      return 'Notification'
  }
}

/**
 * Get icon component for notification type
 * 
 * @param type - Notification type enum value
 * @returns Lucide icon component
 */
export function getNotificationTypeIcon(type: NotificationType): LucideIcon {
  switch (type) {
    case NotificationType.EPISODE_REQUESTED:
      return PlayCircle
    case NotificationType.EPISODE_INITIATED:
      return CheckCircle
    case NotificationType.EPISODE_DOWNLOAD_INITIATED:
      return Download
    case NotificationType.EPISODE_DOWNLOAD_COMPLETED:
      return CheckCircle
    case NotificationType.EPISODE_DOWNLOAD_FAILED:
      return XCircle
    case NotificationType.EPISODE_POST_PROCESSING_STARTED:
      return Settings
    case NotificationType.EPISODE_POST_PROCESSING_COMPLETED:
      return CheckCircle
    case NotificationType.EPISODE_POST_PROCESSING_FAILED:
      return XCircle
    case NotificationType.EPISODE_CREATION_FINALIZED:
      return CheckCircle2
    case NotificationType.EPISODE_CREATION_FAILED:
      return AlertCircle
    default:
      return CheckCircle
  }
}

/**
 * Get color classes for notification type
 * 
 * @param type - Notification type enum value
 * @returns Object with text and background color classes
 */
export function getNotificationTypeColor(type: NotificationType): {
  textClass: string
  bgClass: string
} {
  switch (type) {
    case NotificationType.EPISODE_REQUESTED:
      return {
        textClass: 'text-blue-600 dark:text-blue-300',
        bgClass: 'bg-blue-100 dark:bg-blue-900/30',
      }
    case NotificationType.EPISODE_INITIATED:
      return {
        textClass: 'text-cyan-600 dark:text-cyan-300',
        bgClass: 'bg-cyan-100 dark:bg-cyan-900/30',
      }
    case NotificationType.EPISODE_DOWNLOAD_INITIATED:
      return {
        textClass: 'text-yellow-600 dark:text-yellow-300',
        bgClass: 'bg-yellow-100 dark:bg-yellow-900/30',
      }
    case NotificationType.EPISODE_DOWNLOAD_COMPLETED:
      return {
        textClass: 'text-green-600 dark:text-green-300',
        bgClass: 'bg-green-100 dark:bg-green-900/30',
      }
    case NotificationType.EPISODE_DOWNLOAD_FAILED:
      return {
        textClass: 'text-red-600 dark:text-red-300',
        bgClass: 'bg-red-100 dark:bg-red-900/30',
      }
    case NotificationType.EPISODE_POST_PROCESSING_STARTED:
      return {
        textClass: 'text-purple-600 dark:text-purple-300',
        bgClass: 'bg-purple-100 dark:bg-purple-900/30',
      }
    case NotificationType.EPISODE_POST_PROCESSING_COMPLETED:
      return {
        textClass: 'text-green-600 dark:text-green-300',
        bgClass: 'bg-green-100 dark:bg-green-900/30',
      }
    case NotificationType.EPISODE_POST_PROCESSING_FAILED:
      return {
        textClass: 'text-red-600 dark:text-red-300',
        bgClass: 'bg-red-100 dark:bg-red-900/30',
      }
    case NotificationType.EPISODE_CREATION_FINALIZED:
      return {
        textClass: 'text-emerald-600 dark:text-emerald-300',
        bgClass: 'bg-emerald-100 dark:bg-emerald-900/30',
      }
    case NotificationType.EPISODE_CREATION_FAILED:
      return {
        textClass: 'text-red-600 dark:text-red-300',
        bgClass: 'bg-red-100 dark:bg-red-900/30',
      }
    default:
      return {
        textClass: 'text-gray-600 dark:text-gray-300',
        bgClass: 'bg-gray-100 dark:bg-gray-900/30',
      }
  }
}

/**
 * Get all notification type options for filter dropdowns
 * 
 * @returns Array of notification type options
 */
export function getNotificationTypeOptions(): Array<{
  value: NotificationType
  label: string
}> {
  return [
    {
      value: NotificationType.EPISODE_REQUESTED,
      label: getNotificationTypeLabel(NotificationType.EPISODE_REQUESTED),
    },
    {
      value: NotificationType.EPISODE_INITIATED,
      label: getNotificationTypeLabel(NotificationType.EPISODE_INITIATED),
    },
    {
      value: NotificationType.EPISODE_DOWNLOAD_INITIATED,
      label: getNotificationTypeLabel(NotificationType.EPISODE_DOWNLOAD_INITIATED),
    },
    {
      value: NotificationType.EPISODE_DOWNLOAD_COMPLETED,
      label: getNotificationTypeLabel(NotificationType.EPISODE_DOWNLOAD_COMPLETED),
    },
    {
      value: NotificationType.EPISODE_DOWNLOAD_FAILED,
      label: getNotificationTypeLabel(NotificationType.EPISODE_DOWNLOAD_FAILED),
    },
    {
      value: NotificationType.EPISODE_POST_PROCESSING_STARTED,
      label: getNotificationTypeLabel(NotificationType.EPISODE_POST_PROCESSING_STARTED),
    },
    {
      value: NotificationType.EPISODE_POST_PROCESSING_COMPLETED,
      label: getNotificationTypeLabel(NotificationType.EPISODE_POST_PROCESSING_COMPLETED),
    },
    {
      value: NotificationType.EPISODE_POST_PROCESSING_FAILED,
      label: getNotificationTypeLabel(NotificationType.EPISODE_POST_PROCESSING_FAILED),
    },
    {
      value: NotificationType.EPISODE_CREATION_FINALIZED,
      label: getNotificationTypeLabel(NotificationType.EPISODE_CREATION_FINALIZED),
    },
    {
      value: NotificationType.EPISODE_CREATION_FAILED,
      label: getNotificationTypeLabel(NotificationType.EPISODE_CREATION_FAILED),
    },
  ]
}
```

---

## V2

Right now we have the following flow when we correctly add a new video or podcast:
Episode Requested (User) -> Episode Initiated (System) 

When we add a new video and we use the tag to auto-send to Labcastarr API we have:
Episode Requested (User) -> Episode Initiated (System) -> Episode Creation Finalized (System)

As you can understand, the event "Episode Initiated (System)" is not the best description to tell the user that the episode was correctly created and added to the watchlist by the app. We should have another event of the type "Episode Creation Finalized" to denote the end of the creation of the episode if everything went ok. And then we should have different notifications events in the case we send it to Labcastarr, eg:
Episode Requested (User) -> Episode Initiated (System) -> Episode Creation Finalized (System) -> Episode Sent to Labcastarr Initiated (System) -> Episode Sent to Labcastarr Completed (System)


Currently we literally replicated all the notification events from labcastar, but we can see that there are a few of them that are specific to Labcastarr
- Episode Requested
- Episode Initiated
- Download Initiated (Labcastarr specific)
- Download Completed (Labcastarr specific)
- Download Failed (Labcastarr specific)
- Post-Processing Started (Labcastarr specific)
- Post-Processing Completed (Labcastarr specific)
- Post-Processing Failed (Labcastarr specific)
- Episode Creation Finalized
- Episode Creation Failed

Moreover, we should have specific events for 2WatchARR:
- Episode Sent to Labcastarr Initiated (if we use the tag to auto-send or manually send to Labcastarr API) 
- Episode Sent to Labcastarr Completed (if we use the tag to auto-send or manually send to Labcastarr API) 
- Episode Sent to Labcastarr Failed (if we use the tag to auto-send or manually send to Labcastarr API) 


---

# v3

As you can see in the image, we have the state "Added to Watchlist", it shoudl be "Episode Creation Finalized" 

and then right after it, we have another notification events named "Episode Creation Finalized"?

After the changes i tested adding a new episode and got the following flow of events as you can see in the image:
Episode Requested (User) -> Added to Watchlist (System) -> Episode Initiated (System)

It should have been:
Episode Requested (User) -> Episode Initiated (System) -> Episode Creation Finalized (System) 

In case we send it to Labcastarr as well using the tag for auto-sending it, it should:
Episode Requested (User) -> Episode Initiated (System) -> Episode Creation Finalized (System) -> Episode Sent to Labcastarr Initiated (System) -> Episode Sent to Labcastarr Completed (System)