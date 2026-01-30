import { Database } from 'sqlite';
import { MediaType } from '../domain/models';

export interface DashboardStats {
    counts: {
        totalVideos: number;
        totalPodcasts: number;
        totalChannels: number;
        totalTags: number;
    };
    usage: {
        added: number;
        watched: number;
        favorited: number;
        removed: number;
        tagged: number;
    };
    playTime: {
        totalSeconds: number;
        averageSecondsPerVideo: number;
        thisWeekSeconds: number;
        thisMonthSeconds: number;
    };
    activityTimeSeries: {
        date: string;
        added: number;
        watched: number;
    }[];
}

export class StatsService {
    constructor(private db: Database) { }

    async getDashboardStats(userId: string, options?: { period?: 'day' | 'week' | 'month' | 'year' }): Promise<DashboardStats> {
        const counts = await this.getCounts(userId);
        const usage = await this.getUsage(userId, options?.period || 'month');
        const playTime = await this.getPlayTimeStats(userId);
        const activityTimeSeries = await this.getActivityTimeSeries(userId);

        return {
            counts,
            usage,
            playTime,
            activityTimeSeries
        };
    }

    private async getCounts(userId: string) {
        const episodes = await this.db.all(
            'SELECT type, COUNT(*) as count FROM episodes WHERE user_id = ? AND is_deleted = 0 GROUP BY type',
            [userId]
        );
        const channels = await this.db.get(
            'SELECT COUNT(*) as count FROM channels',
        );
        const tags = await this.db.get(
            'SELECT COUNT(*) as count FROM tags WHERE user_id = ?',
            [userId]
        );

        return {
            totalVideos: episodes.find(e => e.type === 'video')?.count || 0,
            totalPodcasts: episodes.find(e => e.type === 'podcast')?.count || 0,
            totalChannels: channels?.count || 0,
            totalTags: tags?.count || 0,
        };
    }

    private async getUsage(userId: string, period: string) {
        // Define timestamp threshold based on period
        let threshold = 0;
        const now = Math.floor(Date.now() / 1000);
        if (period === 'day') threshold = now - 86400;
        else if (period === 'week') threshold = now - 604800;
        else if (period === 'month') threshold = now - 2592000;
        else if (period === 'year') threshold = now - 31536000;

        const events = await this.db.all(`
            SELECT me.type, COUNT(*) as count 
            FROM media_events me
            JOIN episodes e ON me.episode_id = e.id
            WHERE e.user_id = ? AND me.created_at >= ?
            GROUP BY me.type
        `, [userId, threshold]);

        return {
            added: events.find(e => e.type === 'added')?.count || 0,
            watched: events.find(e => e.type === 'watched')?.count || 0,
            favorited: events.find(e => e.type === 'favorited')?.count || 0,
            removed: events.find(e => e.type === 'removed')?.count || 0,
            tagged: events.find(e => e.type === 'tagged')?.count || 0,
        };
    }

    private async getPlayTimeStats(userId: string) {
        const now = Math.floor(Date.now() / 1000);
        const startOfWeek = now - (new Date().getDay() * 86400);
        const startOfMonth = now - (new Date().getDate() * 86400);

        const total = await this.db.get(`
            SELECT SUM(duration) as total, COUNT(*) as count, AVG(duration) as average
            FROM episodes 
            WHERE user_id = ? AND watched = 1 AND is_deleted = 0
        `, [userId]);

        const thisWeek = await this.db.get(`
            SELECT SUM(e.duration) as total
            FROM episodes e
            JOIN media_events me ON e.id = me.episode_id
            WHERE e.user_id = ? AND me.type = 'watched' AND me.created_at >= ?
        `, [userId, startOfWeek]);

        const thisMonth = await this.db.get(`
            SELECT SUM(e.duration) as total
            FROM episodes e
            JOIN media_events me ON e.id = me.episode_id
            WHERE e.user_id = ? AND me.type = 'watched' AND me.created_at >= ?
        `, [userId, startOfMonth]);

        return {
            totalSeconds: total?.total || 0,
            averageSecondsPerVideo: Math.round(total?.average || 0),
            thisWeekSeconds: thisWeek?.total || 0,
            thisMonthSeconds: thisMonth?.total || 0,
        };
    }

    private async getActivityTimeSeries(userId: string) {
        // Last 30 days
        const limit = 30;
        const rows = await this.db.all(`
            SELECT 
                date(me.created_at, 'unixepoch') as day,
                COUNT(CASE WHEN me.type = 'added' THEN 1 END) as added,
                COUNT(CASE WHEN me.type = 'watched' THEN 1 END) as watched
            FROM media_events me
            JOIN episodes e ON me.episode_id = e.id
            WHERE e.user_id = ?
            GROUP BY day
            ORDER BY day DESC
            LIMIT ?
        `, [userId, limit]);

        return rows.map(r => ({
            date: r.day,
            added: r.added,
            watched: r.watched
        })).reverse();
    }
}
