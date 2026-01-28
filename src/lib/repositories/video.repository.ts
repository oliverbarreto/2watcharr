import { Database } from 'sqlite';
import { v4 as uuidv4 } from 'uuid';
import {
    Video,
    CreateVideoDto,
    UpdateVideoDto,
    VideoFilters,
    SortOptions,
    VideoEventType,
} from '../domain/models';

export class VideoRepository {
    constructor(private db: Database) { }

    /**
     * Create a new video
     */
    async create(dto: CreateVideoDto): Promise<Video> {
        const id = uuidv4();
        const now = Math.floor(Date.now() / 1000);

        await this.db.run(
            `INSERT INTO videos (
        id, youtube_id, title, description, duration, thumbnail_url,
        video_url, upload_date, published_date, view_count, channel_id, user_id,
        created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                id,
                dto.youtubeId,
                dto.title,
                dto.description || null,
                dto.duration || null,
                dto.thumbnailUrl || null,
                dto.videoUrl,
                dto.uploadDate || null,
                dto.publishedDate || null,
                dto.viewCount || null,
                dto.channelId,
                dto.userId || null,
                now,
                now,
            ]
        );

        const video = await this.findById(id);
        if (!video) {
            throw new Error('Failed to create video');
        }
        return video;
    }

    /**
     * Find video by ID
     */
    async findById(id: string): Promise<Video | null> {
        const row = await this.db.get(`
            SELECT v.*, c.name as channel_name,
            (SELECT created_at FROM video_events WHERE video_id = v.id AND type = 'added' ORDER BY created_at DESC LIMIT 1) as last_added_at,
            (SELECT created_at FROM video_events WHERE video_id = v.id AND type = 'watched' ORDER BY created_at DESC LIMIT 1) as last_watched_at,
            (SELECT created_at FROM video_events WHERE video_id = v.id AND type = 'favorited' ORDER BY created_at DESC LIMIT 1) as last_favorited_at,
            (SELECT created_at FROM video_events WHERE video_id = v.id AND type = 'removed' ORDER BY created_at DESC LIMIT 1) as last_removed_at
            FROM videos v 
            LEFT JOIN channels c ON v.channel_id = c.id 
            WHERE v.id = ?
        `, id);
        if (!row) return null;

        const video = this.mapRowToVideo(row);
        const tagRows = await this.db.all(`
            SELECT t.* FROM tags t
            JOIN video_tags vt ON t.id = vt.tag_id
            WHERE vt.video_id = ?
        `, id);
        video.tags = tagRows.map(row => ({
            id: row.id,
            name: row.name,
            color: row.color,
            userId: row.user_id,
            createdAt: row.created_at,
        }));

        return video;
    }

    /**
     * Find video by YouTube ID
     */
    async findByYouTubeId(youtubeId: string): Promise<Video | null> {
        const row = await this.db.get(
            'SELECT * FROM videos WHERE youtube_id = ?',
            youtubeId
        );
        return row ? this.mapRowToVideo(row) : null;
    }

    /**
     * Find all videos with optional filters and sorting
     */
    async findAll(
        filters?: VideoFilters,
        sort?: SortOptions
    ): Promise<Video[]> {
        const hasTagFilter = filters?.tagIds && filters.tagIds.length > 0;
        let query = `
            SELECT ${hasTagFilter ? 'DISTINCT ' : ''}v.*, c.name as channel_name,
            (SELECT created_at FROM video_events WHERE video_id = v.id AND type = 'added' ORDER BY created_at DESC LIMIT 1) as last_added_at,
            (SELECT created_at FROM video_events WHERE video_id = v.id AND type = 'watched' ORDER BY created_at DESC LIMIT 1) as last_watched_at,
            (SELECT created_at FROM video_events WHERE video_id = v.id AND type = 'favorited' ORDER BY created_at DESC LIMIT 1) as last_favorited_at,
            (SELECT created_at FROM video_events WHERE video_id = v.id AND type = 'removed' ORDER BY created_at DESC LIMIT 1) as last_removed_at
            FROM videos v
        `;
        query += ' LEFT JOIN channels c ON v.channel_id = c.id';
        const params: any[] = [];

        // Join with video_tags if filtering by tags
        if (filters?.tagIds && filters.tagIds.length > 0) {
            query += ' INNER JOIN video_tags vt ON v.id = vt.video_id';
        }

        // Build WHERE clause
        const conditions: string[] = [];

        if (filters?.tagIds && filters.tagIds.length > 0) {
            const placeholders = filters.tagIds.map(() => '?').join(',');
            conditions.push(`vt.tag_id IN (${placeholders})`);
            params.push(...filters.tagIds);
        }

        if (filters?.search) {
            conditions.push(
                '(v.title LIKE ? OR v.description LIKE ? OR EXISTS (SELECT 1 FROM channels c WHERE c.id = v.channel_id AND c.name LIKE ?))'
            );
            const searchTerm = `%${filters.search}%`;
            params.push(searchTerm, searchTerm, searchTerm);
        }

        if (filters?.watched !== undefined) {
            conditions.push('v.watched = ?');
            params.push(filters.watched ? 1 : 0);
        }

        if (filters?.favorite !== undefined) {
            conditions.push('v.favorite = ?');
            params.push(filters.favorite ? 1 : 0);
        }

        if (filters?.isDeleted !== undefined) {
            conditions.push('v.is_deleted = ?');
            params.push(filters.isDeleted ? 1 : 0);
        } else {
            // Default: only show non-deleted videos
            conditions.push('v.is_deleted = 0');
        }

        if (filters?.channelId) {
            conditions.push('v.channel_id = ?');
            params.push(filters.channelId);
        }

        if (conditions.length > 0) {
            query += ' WHERE ' + conditions.join(' AND ');
        }

        // Add sorting
        if (sort) {
            const orderBy = this.buildOrderBy(sort);
            query += ` ORDER BY ${orderBy}`;
        } else {
            // Default sort: Manual order first, then fallback to newest first
            query += ' ORDER BY v.custom_order ASC, v.created_at DESC';
        }

        const rows = await this.db.all(query, params);
        const videos = rows.map((row) => this.mapRowToVideo(row));

        if (videos.length > 0) {
            const videoIds = videos.map(v => v.id);
            const placeholders = videoIds.map(() => '?').join(',');
            const tagRows = await this.db.all(`
                SELECT vt.video_id, t.* FROM tags t
                JOIN video_tags vt ON t.id = vt.tag_id
                WHERE vt.video_id IN (${placeholders})
            `, videoIds);

            // Group tags by video_id
            const tagsByVideoId: Record<string, any[]> = {};
            tagRows.forEach(row => {
                if (!tagsByVideoId[row.video_id]) {
                    tagsByVideoId[row.video_id] = [];
                }
                tagsByVideoId[row.video_id].push({
                    id: row.id,
                    name: row.name,
                    color: row.color,
                    userId: row.user_id,
                    createdAt: row.created_at,
                });
            });

            // Attach tags to videos
            videos.forEach(v => {
                v.tags = tagsByVideoId[v.id] || [];
            });
        }

        return videos;
    }

    /**
     * Update video
     */
    async update(id: string, dto: UpdateVideoDto): Promise<Video> {
        const updates: string[] = [];
        const params: any[] = [];

        if (dto.title !== undefined) {
            updates.push('title = ?');
            params.push(dto.title);
        }
        if (dto.description !== undefined) {
            updates.push('description = ?');
            params.push(dto.description);
        }
        if (dto.watched !== undefined) {
            updates.push('watched = ?');
            params.push(dto.watched ? 1 : 0);
        }
        if (dto.favorite !== undefined) {
            updates.push('favorite = ?');
            params.push(dto.favorite ? 1 : 0);
        }
        if (dto.priority !== undefined) {
            updates.push('priority = ?');
            params.push(dto.priority);
        }
        if (dto.isDeleted !== undefined) {
            updates.push('is_deleted = ?');
            params.push(dto.isDeleted ? 1 : 0);
        }
        if (dto.customOrder !== undefined) {
            updates.push('custom_order = ?');
            params.push(dto.customOrder);
        }
        if (dto.viewCount !== undefined) {
            updates.push('view_count = ?');
            params.push(dto.viewCount);
        }

        updates.push('updated_at = ?');
        params.push(Math.floor(Date.now() / 1000));

        params.push(id);

        await this.db.run(
            `UPDATE videos SET ${updates.join(', ')} WHERE id = ?`,
            params
        );

        // Update tags if provided
        if (dto.tagIds !== undefined) {
            await this.removeTags(id);
            if (dto.tagIds.length > 0) {
                await this.addTags(id, dto.tagIds);
            }
        }

        const video = await this.findById(id);
        if (!video) {
            throw new Error('Video not found after update');
        }
        return video;
    }

    /**
     * Delete video
     */
    async delete(id: string): Promise<void> {
        await this.db.run('UPDATE videos SET is_deleted = 1, updated_at = ? WHERE id = ?', [
            Math.floor(Date.now() / 1000),
            id
        ]);
    }

    /**
     * Add a video event
     */
    async addEvent(videoId: string, type: VideoEventType): Promise<void> {
        const id = uuidv4();
        const now = Math.floor(Date.now() / 1000);

        await this.db.run(
            'INSERT INTO video_events (id, video_id, type, created_at) VALUES (?, ?, ?, ?)',
            [id, videoId, type, now]
        );
    }

    /**
     * Reorder videos
     */
    async reorder(videoIds: string[]): Promise<void> {
        const now = Math.floor(Date.now() / 1000);

        // Use a transaction for consistency
        await this.db.run('BEGIN TRANSACTION');

        try {
            for (let i = 0; i < videoIds.length; i++) {
                await this.db.run(
                    'UPDATE videos SET custom_order = ?, updated_at = ? WHERE id = ?',
                    [i, now, videoIds[i]]
                );
            }
            await this.db.run('COMMIT');
        } catch (error) {
            await this.db.run('ROLLBACK');
            throw error;
        }
    }

    /**
     * Move video to the beginning of the list
     */
    async moveToBeginning(id: string): Promise<void> {
        const videos = await this.findAll({ watched: false }, { field: 'custom', order: 'asc' });
        const videoIds = videos.map(v => v.id).filter(vid => vid !== id);
        videoIds.unshift(id);
        await this.reorder(videoIds);
    }

    /**
     * Move video to the end of the list
     */
    async moveToEnd(id: string): Promise<void> {
        const videos = await this.findAll({ watched: false }, { field: 'custom', order: 'asc' });
        const videoIds = videos.map(v => v.id).filter(vid => vid !== id);
        videoIds.push(id);
        await this.reorder(videoIds);
    }

    /**
     * Associate tags with a video
     */
    async addTags(videoId: string, tagIds: string[]): Promise<void> {
        const now = Math.floor(Date.now() / 1000);

        for (const tagId of tagIds) {
            await this.db.run(
                'INSERT OR IGNORE INTO video_tags (video_id, tag_id, created_at) VALUES (?, ?, ?)',
                [videoId, tagId, now]
            );
        }
    }

    /**
     * Remove all tags from a video
     */
    async removeTags(videoId: string): Promise<void> {
        await this.db.run('DELETE FROM video_tags WHERE video_id = ?', videoId);
    }

    /**
     * Get tags for a video
     */
    async getTags(videoId: string): Promise<string[]> {
        const rows = await this.db.all(
            'SELECT tag_id FROM video_tags WHERE video_id = ?',
            videoId
        );
        return rows.map((row: any) => row.tag_id);
    }

    private buildOrderBy(sort: SortOptions): string {
        const direction = sort.order === 'asc' ? 'ASC' : 'DESC';

        switch (sort.field) {
            case 'custom':
                return `v.custom_order ${direction}, v.created_at DESC`;
            case 'created_at':
                return `v.created_at ${direction}`;
            case 'priority':
                return `v.priority ${direction}, v.created_at DESC`;
            case 'favorite':
                return `v.favorite ${direction}, v.created_at DESC`;
            case 'duration':
                return `v.duration ${direction}`;
            case 'title':
                return `v.title ${direction}`;
            case 'date_added':
                return `last_added_at ${direction}`;
            case 'date_watched':
                return `last_watched_at ${direction}`;
            case 'date_favorited':
                return `last_favorited_at ${direction}`;
            case 'date_removed':
                return `last_removed_at ${direction}`;
            default:
                return 'v.custom_order ASC, v.created_at DESC';
        }
    }

    private mapRowToVideo(row: any): Video {
        return {
            id: row.id,
            youtubeId: row.youtube_id,
            title: row.title,
            description: row.description,
            duration: row.duration,
            thumbnailUrl: row.thumbnail_url,
            videoUrl: row.video_url,
            uploadDate: row.upload_date,
            publishedDate: row.published_date,
            viewCount: row.view_count,
            channelId: row.channel_id,
            channelName: row.channel_name,
            watched: Boolean(row.watched),
            favorite: Boolean(row.favorite),
            isDeleted: Boolean(row.is_deleted),
            priority: row.priority,
            customOrder: row.custom_order,
            userId: row.user_id,
            createdAt: row.created_at,
            updatedAt: row.updated_at,
            lastAddedAt: row.last_added_at || undefined,
            lastWatchedAt: row.last_watched_at || undefined,
            lastFavoritedAt: row.last_favorited_at || undefined,
            lastRemovedAt: row.last_removed_at || undefined,
        };
    }
}
