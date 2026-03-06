import { NotificationType } from '@/lib/domain/models';
import {
    CheckCircle,
    CheckCircle2,
    AlertCircle,
    XCircle,
    Download,
    Settings,
    PlusCircle,
    Zap,
    Send,
    ArrowUpRight,
    type LucideIcon,
} from 'lucide-react';



/**
 * Get user-friendly label for notification type
 */
export function getNotificationTypeLabel(type: NotificationType): string {
    switch (type) {
        case NotificationType.EPISODE_REQUESTED:
            return 'Episode Requested';
        case NotificationType.EPISODE_INITIATED:
            return 'Episode Initiated';
        case NotificationType.EPISODE_DOWNLOAD_INITIATED:
            return 'Download Initiated';
        case NotificationType.EPISODE_DOWNLOAD_COMPLETED:
            return 'Download Completed';
        case NotificationType.EPISODE_DOWNLOAD_FAILED:
            return 'Download Failed';
        case NotificationType.EPISODE_POST_PROCESSING_STARTED:
            return 'Post-Processing Started';
        case NotificationType.EPISODE_POST_PROCESSING_COMPLETED:
            return 'Post-Processing Completed';
        case NotificationType.EPISODE_POST_PROCESSING_FAILED:
            return 'Post-Processing Failed';
        case NotificationType.EPISODE_CREATION_FINALIZED:
            return 'Episode Creation Finalized';
        case NotificationType.EPISODE_CREATION_FAILED:
            return 'Episode Creation Failed';
        case NotificationType.EPISODE_SENT_TO_LABCASTARR_INITIATED:
            return 'Sent to LabcastARR: Initiated';
        case NotificationType.EPISODE_SENT_TO_LABCASTARR_COMPLETED:
            return 'Sent to LabcastARR: Completed';
        case NotificationType.EPISODE_SENT_TO_LABCASTARR_FAILED:
            return 'Sent to LabcastARR: Failed';

        default:
            return 'Notification';
    }
}

/**
 * Get icon component for notification type
 */
export function getNotificationTypeIcon(type: NotificationType): LucideIcon {
    switch (type) {
        case NotificationType.EPISODE_REQUESTED:
            return PlusCircle;
        case NotificationType.EPISODE_INITIATED:
            return Zap;
        case NotificationType.EPISODE_DOWNLOAD_INITIATED:
            return Download;
        case NotificationType.EPISODE_DOWNLOAD_COMPLETED:
            return CheckCircle;
        case NotificationType.EPISODE_DOWNLOAD_FAILED:
            return XCircle;
        case NotificationType.EPISODE_POST_PROCESSING_STARTED:
            return Settings;
        case NotificationType.EPISODE_POST_PROCESSING_COMPLETED:
            return CheckCircle;
        case NotificationType.EPISODE_POST_PROCESSING_FAILED:
            return XCircle;
        case NotificationType.EPISODE_CREATION_FINALIZED:
            return CheckCircle2;
        case NotificationType.EPISODE_CREATION_FAILED:
            return AlertCircle;
        case NotificationType.EPISODE_SENT_TO_LABCASTARR_INITIATED:
            return Send;
        case NotificationType.EPISODE_SENT_TO_LABCASTARR_COMPLETED:
            return ArrowUpRight;
        case NotificationType.EPISODE_SENT_TO_LABCASTARR_FAILED:
            return XCircle;

        default:
            return CheckCircle;
    }
}

/**
 * Get color classes for notification type
 */
export function getNotificationTypeColor(type: NotificationType): {
    textClass: string;
    bgClass: string;
} {
    switch (type) {
        case NotificationType.EPISODE_REQUESTED:
            return {
                textClass: 'text-blue-600 dark:text-blue-300',
                bgClass: 'bg-blue-100 dark:bg-blue-900/30',
            };
        case NotificationType.EPISODE_INITIATED:
            return {
                textClass: 'text-cyan-600 dark:text-cyan-300',
                bgClass: 'bg-cyan-100 dark:bg-cyan-900/30',
            };
        case NotificationType.EPISODE_DOWNLOAD_INITIATED:
            return {
                textClass: 'text-yellow-600 dark:text-yellow-300',
                bgClass: 'bg-yellow-100 dark:bg-yellow-900/30',
            };
        case NotificationType.EPISODE_DOWNLOAD_COMPLETED:
            return {
                textClass: 'text-green-600 dark:text-green-300',
                bgClass: 'bg-green-100 dark:bg-green-900/30',
            };
        case NotificationType.EPISODE_DOWNLOAD_FAILED:
            return {
                textClass: 'text-red-600 dark:text-red-300',
                bgClass: 'bg-red-100 dark:bg-red-900/30',
            };
        case NotificationType.EPISODE_POST_PROCESSING_STARTED:
            return {
                textClass: 'text-purple-600 dark:text-purple-300',
                bgClass: 'bg-purple-100 dark:bg-purple-900/30',
            };
        case NotificationType.EPISODE_POST_PROCESSING_COMPLETED:
            return {
                textClass: 'text-green-600 dark:text-green-300',
                bgClass: 'bg-green-100 dark:bg-green-900/30',
            };
        case NotificationType.EPISODE_POST_PROCESSING_FAILED:
            return {
                textClass: 'text-red-600 dark:text-red-300',
                bgClass: 'bg-red-100 dark:bg-red-900/30',
            };
        case NotificationType.EPISODE_CREATION_FINALIZED:
            return {
                textClass: 'text-emerald-600 dark:text-emerald-300',
                bgClass: 'bg-emerald-100 dark:bg-emerald-900/30',
            };
        case NotificationType.EPISODE_CREATION_FAILED:
            return {
                textClass: 'text-red-600 dark:text-red-300',
                bgClass: 'bg-red-100 dark:bg-red-900/30',
            };
        case NotificationType.EPISODE_SENT_TO_LABCASTARR_INITIATED:
            return {
                textClass: 'text-orange-600 dark:text-orange-300',
                bgClass: 'bg-orange-100 dark:bg-orange-900/30',
            };
        case NotificationType.EPISODE_SENT_TO_LABCASTARR_COMPLETED:
            return {
                textClass: 'text-green-600 dark:text-green-300',
                bgClass: 'bg-green-100 dark:bg-green-900/30',
            };
        case NotificationType.EPISODE_SENT_TO_LABCASTARR_FAILED:
            return {
                textClass: 'text-red-600 dark:text-red-300',
                bgClass: 'bg-red-100 dark:bg-red-900/30',
            };

        default:
            return {
                textClass: 'text-gray-600 dark:text-gray-300',
                bgClass: 'bg-gray-100 dark:bg-gray-900/30',
            };
    }
}

/**
 * Get all notification type options for filter dropdowns
 */
export function getNotificationTypeOptions(): Array<{
    value: NotificationType;
    label: string;
}> {
    return Object.values(NotificationType).map(type => ({
        value: type,
        label: getNotificationTypeLabel(type),
    }));
}
