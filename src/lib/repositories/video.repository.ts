import { Database } from 'sqlite';
import { v4 as uuidv4 } from 'uuid';
import {
    Video,
    CreateVideoDto,
    UpdateVideoDto,
    VideoFilters,
    SortOptions,
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
        video_url, upload_date, published_date, channel_id, user_id,
        created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
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
        const row = await this.db.get('SELECT * FROM videos WHERE id = ?', id);
        return row ? this.mapRowToVideo(row) : null;
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
        let query = 'SELECT DISTINCT v.* FROM videos v';
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
            // Default sort: favorite DESC, priority DESC, created_at DESC
            query += ' ORDER BY v.favorite DESC, v.priority DESC, v.created_at DESC';
        }

        const rows = await this.db.all(query, params);
        return rows.map((row) => this.mapRowToVideo(row));
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
        if (dto.customOrder !== undefined) {
            updates.push('custom_order = ?');
            params.push(dto.customOrder);
        }

        updates.push('updated_at = ?');
        params.push(Math.floor(Date.now() / 1000));

        params.push(id);

        await this.db.run(
            `UPDATE videos SET ${updates.join(', ')} WHERE id = ?`,
            params
        );

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
        await this.db.run('DELETE FROM videos WHERE id = ?', id);
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
            default:
                return 'v.created_at DESC';
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
            channelId: row.channel_id,
            watched: Boolean(row.watched),
            favorite: Boolean(row.favorite),
            priority: row.priority,
            customOrder: row.custom_order,
            userId: row.user_id,
            createdAt: row.created_at,
            updatedAt: row.updated_at,
        };
    }
}
