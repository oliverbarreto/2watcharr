import { Database } from 'sqlite';


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
    detailedStats: {
        title: string;
        type: string;
        event_type: string;
        created_at: number;
        tags?: { name: string; color: string }[];
    }[];
}

export class StatsService {
    constructor(private db: Database) { }

    async getDashboardStats(userId: string, options?: { period?: 'day' | 'week' | 'month' | 'year' | 'total' }): Promise<DashboardStats> {
        const period = options?.period || 'month';
        const counts = await this.getCounts(userId);
        const usage = await this.getUsage(userId, period);
        const playTime = await this.getPlayTimeStats(userId);
        const activityTimeSeries = await this.getActivityTimeSeries(userId, period);
        const detailedStats = await this.getDetailedStats(userId, period);

        return {
            counts,
            usage,
            playTime,
            activityTimeSeries,
            detailedStats
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
        else if (period === 'year') {
            const startOfYear = new Date(new Date().getFullYear(), 0, 1);
            threshold = Math.floor(startOfYear.getTime() / 1000);
        } else if (period === 'total') {
            threshold = 0;
        }

        const events = await this.db.all(`
            SELECT event_type as type, COUNT(*) as count 
            FROM media_events me
            LEFT JOIN episodes e ON me.episode_id = e.id
            WHERE (e.user_id = ? OR e.user_id IS NULL) AND me.created_at >= ?
            GROUP BY event_type
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
            WHERE e.user_id = ? AND me.event_type = 'watched' AND me.created_at >= ?
        `, [userId, startOfWeek]);

        const thisMonth = await this.db.get(`
            SELECT SUM(e.duration) as total
            FROM episodes e
            JOIN media_events me ON e.id = me.episode_id
            WHERE e.user_id = ? AND me.event_type = 'watched' AND me.created_at >= ?
        `, [userId, startOfMonth]);

        return {
            totalSeconds: total?.total || 0,
            averageSecondsPerVideo: Math.round(total?.average || 0),
            thisWeekSeconds: thisWeek?.total || 0,
            thisMonthSeconds: thisMonth?.total || 0,
        };
    }

    private async getActivityTimeSeries(userId: string, period: string) {
        let query = '';
        let params: any[] = [userId];

        if (period === 'day') {
            // Last 24 hours, grouped by hour
            query = `
                SELECT 
                    strftime('%Y-%m-%dT%H:00:00', me.created_at, 'unixepoch') as time_bucket,
                    COUNT(CASE WHEN me.event_type = 'added' THEN 1 END) as added,
                    COUNT(CASE WHEN me.event_type = 'watched' THEN 1 END) as watched
                FROM media_events me
                LEFT JOIN episodes e ON me.episode_id = e.id
                WHERE (e.user_id = ? OR e.user_id IS NULL) AND me.created_at >= ?
                GROUP BY time_bucket
                ORDER BY time_bucket ASC
            `;
            const now = Math.floor(Date.now() / 1000);
            params.push(now - 86400);
        } else if (period === 'week' || period === 'month') {
            // Grouped by day
            const limit = period === 'week' ? 7 : 30;
            query = `
                SELECT 
                    date(me.created_at, 'unixepoch') as time_bucket,
                    COUNT(CASE WHEN me.event_type = 'added' THEN 1 END) as added,
                    COUNT(CASE WHEN me.event_type = 'watched' THEN 1 END) as watched
                FROM media_events me
                LEFT JOIN episodes e ON me.episode_id = e.id
                WHERE (e.user_id = ? OR e.user_id IS NULL)
                GROUP BY time_bucket
                ORDER BY time_bucket DESC
                LIMIT ?
            `;
            params.push(limit);
        } else if (period === 'year' || period === 'total') {
            // Grouped by month
            let threshold = 0;
            if (period === 'year') {
                const startOfYear = new Date(new Date().getFullYear(), 0, 1);
                threshold = Math.floor(startOfYear.getTime() / 1000);
            }
            
            query = `
                SELECT 
                    strftime('%Y-%m', me.created_at, 'unixepoch') as time_bucket,
                    COUNT(CASE WHEN me.event_type = 'added' THEN 1 END) as added,
                    COUNT(CASE WHEN me.event_type = 'watched' THEN 1 END) as watched
                FROM media_events me
                LEFT JOIN episodes e ON me.episode_id = e.id
                WHERE (e.user_id = ? OR e.user_id IS NULL) AND me.created_at >= ?
                GROUP BY time_bucket
                ORDER BY time_bucket ASC
            `;
            params.push(threshold);
        }

        const rows = await this.db.all(query, params);

        return rows.map(r => ({
            date: r.time_bucket,
            added: r.added,
            watched: r.watched
        })).sort((a, b) => a.date.localeCompare(b.date));
    }

    async getDetailedStats(userId: string, period: string) {
        let threshold = 0;
        const now = Math.floor(Date.now() / 1000);
        
        if (period === 'day') threshold = now - 86400;
        else if (period === 'week') threshold = now - 604800;
        else if (period === 'month') threshold = now - 2592000;
        else if (period === 'year') {
            const startOfYear = new Date(new Date().getFullYear(), 0, 1);
            threshold = Math.floor(startOfYear.getTime() / 1000);
        }

        const events = await this.db.all(`
            SELECT 
                COALESCE(e.title, me.title) as title,
                COALESCE(e.type, me.type) as type,
                me.event_type,
                me.created_at,
                me.episode_id
            FROM media_events me
            LEFT JOIN episodes e ON me.episode_id = e.id
            WHERE (e.user_id = ? OR e.user_id IS NULL) AND me.created_at >= ?
            ORDER BY me.created_at DESC
            LIMIT 100
        `, [userId, threshold]);

        // Fetch tags for these episodes
        const episodeIds = events.map(e => e.episode_id).filter(id => id !== null);
        let tagsByEpisode: Record<string, { name: string; color: string }[]> = {};

        if (episodeIds.length > 0) {
            const placeholders = episodeIds.map(() => '?').join(',');
            const tagRows = await this.db.all(`
                SELECT et.episode_id, t.name, t.color
                FROM episode_tags et
                JOIN tags t ON et.tag_id = t.id
                WHERE et.episode_id IN (${placeholders})
            `, episodeIds);

            tagRows.forEach(row => {
                if (!tagsByEpisode[row.episode_id]) {
                    tagsByEpisode[row.episode_id] = [];
                }
                tagsByEpisode[row.episode_id].push({ name: row.name, color: row.color });
            });
        }

        return events.map(event => ({
            ...event,
            tags: event.episode_id ? tagsByEpisode[event.episode_id] || [] : []
        }));
    }
}
