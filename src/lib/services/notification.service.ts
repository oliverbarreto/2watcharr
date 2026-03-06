import { Database } from 'sqlite';
import { NotificationRepository, NotificationFilters } from '../repositories/notification.repository';
import { Notification, NotificationType, PaginationOptions } from '../domain/models';

export class NotificationService {
    private notificationRepo: NotificationRepository;

    constructor(private db: Database) {
        this.notificationRepo = new NotificationRepository(db);
    }

    /**
     * Get paginated notifications for a user
     */
    async getNotifications(
        userId: string,
        filters: Omit<NotificationFilters, 'userId'>,
        pagination?: PaginationOptions
    ): Promise<{ items: Notification[], total: number }> {
        return this.notificationRepo.findAll({ ...filters, userId }, pagination);
    }

    /**
     * Mark specific notifications as read
     */
    async markAsRead(ids: string[], userId: string): Promise<void> {
        await this.notificationRepo.markAsRead(ids, userId, true);
    }

    /**
     * Mark specific notifications as unread
     */
    async markAsUnread(ids: string[], userId: string): Promise<void> {
        await this.notificationRepo.markAsRead(ids, userId, false);
    }

    /**
     * Mark all as read
     */
    async markAllAsRead(userId: string): Promise<void> {
        await this.notificationRepo.markAllAsRead(userId);
    }

    /**
     * Delete specific notifications
     */
    async deleteNotifications(ids: string[], userId: string): Promise<void> {
        await this.notificationRepo.delete(ids, userId);
    }

    /**
     * Delete all read notifications
     */
    async deleteReadNotifications(userId: string): Promise<void> {
        await this.notificationRepo.deleteRead(userId);
    }

    /**
     * Delete all notifications
     */
    async deleteAllNotifications(userId: string): Promise<void> {
        await this.notificationRepo.deleteAll(userId);
    }

    /**
     * Helper to log an event
     */
    async logEvent(data: Omit<Notification, 'id' | 'createdAt' | 'isRead'>): Promise<Notification> {
        return this.notificationRepo.create(data);
    }

    /**
     * Specialized logging methods
     */
    async logEpisodeRequested(userId: string, channelName: string, description: string, episodeId?: string): Promise<Notification> {
        return this.logEvent({
            userId,
            type: NotificationType.EPISODE_REQUESTED,
            channelName,
            description,
            episodeId: episodeId || null,
            executedBy: 'User',
        });
    }

    async logEpisodeInitiated(userId: string, channelName: string, description: string, episodeId: string): Promise<Notification> {
        return this.logEvent({
            userId,
            type: NotificationType.EPISODE_INITIATED,
            channelName,
            description,
            episodeId: episodeId || null,
            executedBy: 'System',
        });
    }

    async logEpisodeCreationFinalized(userId: string, channelName: string, description: string, episodeId: string): Promise<Notification> {
        return this.logEvent({
            userId,
            type: NotificationType.EPISODE_CREATION_FINALIZED,
            channelName,
            description,
            episodeId: episodeId || null,
            executedBy: 'System',
        });
    }

    async logEpisodeCreationFailed(userId: string, channelName: string, description: string, episodeId?: string): Promise<Notification> {
        return this.logEvent({
            userId,
            type: NotificationType.EPISODE_CREATION_FAILED,
            channelName,
            description,
            episodeId: episodeId || null,
            executedBy: 'System',
        });
    }

    async logLabcastARRInitiated(userId: string, channelName: string, description: string, episodeId: string): Promise<Notification> {
        return this.logEvent({
            userId,
            type: NotificationType.EPISODE_SENT_TO_LABCASTARR_INITIATED,
            channelName,
            description,
            episodeId: episodeId || null,
            executedBy: 'System',
        });
    }

    async logLabcastARRSuccess(userId: string, channelName: string, description: string, episodeId: string): Promise<Notification> {
        return this.logEvent({
            userId,
            type: NotificationType.EPISODE_SENT_TO_LABCASTARR_COMPLETED,
            channelName,
            description,
            episodeId: episodeId || null,
            executedBy: 'System',
        });
    }

    async logLabcastARRFailed(userId: string, channelName: string, description: string, episodeId: string): Promise<Notification> {
        return this.logEvent({
            userId,
            type: NotificationType.EPISODE_SENT_TO_LABCASTARR_FAILED,
            channelName,
            description,
            episodeId: episodeId || null,
            executedBy: 'System',
        });
    }


}
