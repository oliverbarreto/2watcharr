import { Database } from 'sqlite';
import { v4 as uuidv4 } from 'uuid';
import {
    Notification,
    NotificationType,
    PaginationOptions,
} from '../domain/models';

export interface NotificationFilters {
    userId: string;
    type?: NotificationType;
    isRead?: boolean;
    search?: string;
}

interface NotificationRow {
    id: string;
    user_id: string;
    type: string;
    channel_name: string | null;
    executed_by: string | null;
    description: string | null;
    episode_id: string | null;
    is_read: number;
    created_at: number;
}

export class NotificationRepository {
    constructor(private db: Database) { }


    /**
     * Create a new notification
     */
    async create(data: Omit<Notification, 'id' | 'createdAt' | 'isRead'>): Promise<Notification> {
        const id = uuidv4();
        const now = Math.floor(Date.now() / 1000);

        await this.db.run(
            `INSERT INTO notifications (
                id, user_id, type, channel_name, executed_by, description, episode_id, is_read, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                id,
                data.userId,
                data.type,
                data.channelName || null,
                data.executedBy || null,
                data.description || null,
                data.episodeId || null,
                0, // is_read default
                now,
            ]
        );

        return {
            ...data,
            id,
            isRead: false,
            createdAt: now,
            channelName: data.channelName || null,
            executedBy: data.executedBy || null,
            description: data.description || null,
            episodeId: data.episodeId || null,
        };
    }

    /**
     * Find all notifications with filters and pagination
     */
    async findAll(
        filters: NotificationFilters,
        pagination?: PaginationOptions
    ): Promise<{ items: Notification[], total: number }> {
        let query = 'FROM notifications WHERE user_id = ?';
        const params: (string | number | null | undefined)[] = [filters.userId];


        if (filters.type) {
            query += ' AND type = ?';
            params.push(filters.type);
        }

        if (filters.isRead !== undefined) {
            query += ' AND is_read = ?';
            params.push(filters.isRead ? 1 : 0);
        }

        if (filters.search) {
            query += ' AND (description LIKE ? OR channel_name LIKE ? OR executed_by LIKE ?)';
            const searchTerm = `%${filters.search}%`;
            params.push(searchTerm, searchTerm, searchTerm);
        }

        const countQuery = `SELECT COUNT(*) as count ${query}`;
        const countRes = await this.db.get(countQuery, params);
        const total = countRes?.count || 0;

        let selectQuery = `SELECT * ${query} ORDER BY created_at DESC, rowid DESC`;


        if (pagination?.limit !== undefined) {
            selectQuery += ' LIMIT ?';
            params.push(pagination.limit);
        }
        if (pagination?.offset !== undefined) {
            selectQuery += ' OFFSET ?';
            params.push(pagination.offset);
        }

        const rows = await this.db.all(selectQuery, params);
        const items = rows.map(row => this.mapRow(row));

        return { items, total };
    }

    /**
     * Mark notifications as read/unread
     */
    async markAsRead(ids: string[], userId: string, isRead: boolean = true): Promise<void> {
        if (ids.length === 0) return;
        const placeholders = ids.map(() => '?').join(',');
        await this.db.run(
            `UPDATE notifications SET is_read = ? WHERE id IN (${placeholders}) AND user_id = ?`,
            [isRead ? 1 : 0, ...ids, userId]
        );
    }

    /**
     * Mark all notifications as read for a user
     */
    async markAllAsRead(userId: string): Promise<void> {
        await this.db.run(
            'UPDATE notifications SET is_read = 1 WHERE user_id = ?',
            [userId]
        );
    }

    /**
     * Delete notifications
     */
    async delete(ids: string[], userId: string): Promise<void> {
        if (ids.length === 0) return;
        const placeholders = ids.map(() => '?').join(',');
        await this.db.run(
            `DELETE FROM notifications WHERE id IN (${placeholders}) AND user_id = ?`,
            [...ids, userId]
        );
    }

    /**
     * Delete all read notifications for a user
     */
    async deleteRead(userId: string): Promise<void> {
        await this.db.run(
            'DELETE FROM notifications WHERE user_id = ? AND is_read = 1',
            [userId]
        );
    }

    /**
     * Delete all notifications for a user
     */
    async deleteAll(userId: string): Promise<void> {
        await this.db.run(
            'DELETE FROM notifications WHERE user_id = ?',
            [userId]
        );
    }

    private mapRow(row: NotificationRow): Notification {
        return {
            id: row.id,
            userId: row.user_id,
            type: row.type as NotificationType,
            channelName: row.channel_name,
            executedBy: row.executed_by,
            description: row.description,
            episodeId: row.episode_id,
            isRead: Boolean(row.is_read),
            createdAt: row.created_at,
        };
    }

}
