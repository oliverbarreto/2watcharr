import { Database } from 'sqlite';
import { v4 as uuidv4 } from 'uuid';
import {
    MediaEpisode,
    CreateEpisodeDto,
    UpdateEpisodeDto,
    EpisodeFilters,
    SortOptions,
    MediaEventType,
    MediaType,
    WatchStatus,
    Priority,
    Tag,
    PaginationOptions,
} from '../domain/models';

export class EpisodeRepository {
    constructor(private db: Database) { }

    /**
     * Create a new episode
     */
    async create(dto: CreateEpisodeDto): Promise<MediaEpisode> {
        const id = uuidv4();
        const now = Math.floor(Date.now() / 1000);

        await this.db.run(
            `INSERT INTO episodes (
        id, type, external_id, title, description, duration, thumbnail_url,
        url, upload_date, published_date, view_count, channel_id, user_id,
        watch_status, is_short, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                id,
                dto.type,
                dto.externalId,
                dto.title,
                dto.description || null,
                dto.duration || null,
                dto.thumbnailUrl || null,
                dto.url,
                dto.uploadDate || null,
                dto.publishedDate || null,
                dto.viewCount || null,
                dto.channelId,
                dto.userId,
                'unwatched',
                dto.isShort ? 1 : 0,
                now,
                now,
            ]
        );

        const episode = await this.findById(id);
        if (!episode) {
            throw new Error('Failed to create episode');
        }
        return episode;
    }

    /**
     * Find episode by ID
     */
    async findById(id: string): Promise<MediaEpisode | null> {
        const row = await this.db.get(`
            SELECT e.*, c.name as channel_name,
            (SELECT created_at FROM media_events WHERE episode_id = e.id AND event_type = 'added' ORDER BY created_at DESC LIMIT 1) as last_added_at,
            (SELECT created_at FROM media_events WHERE episode_id = e.id AND event_type = 'watched' ORDER BY created_at DESC LIMIT 1) as last_watched_at,
            (SELECT created_at FROM media_events WHERE episode_id = e.id AND event_type = 'pending' ORDER BY created_at DESC LIMIT 1) as last_pending_at,
            (SELECT created_at FROM media_events WHERE episode_id = e.id AND event_type = 'favorited' ORDER BY created_at DESC LIMIT 1) as last_favorited_at,
            (SELECT created_at FROM media_events WHERE episode_id = e.id AND event_type = 'removed' ORDER BY created_at DESC LIMIT 1) as last_removed_at
            FROM episodes e 
            LEFT JOIN channels c ON e.channel_id = c.id 
            WHERE e.id = ?
        `, id);
        if (!row) return null;

        const episode = this.mapRowToEpisode(row);
        const tagRows = await this.db.all(`
            SELECT t.* FROM tags t
            JOIN episode_tags et ON t.id = et.tag_id
            WHERE et.episode_id = ?
        `, id);
        episode.tags = tagRows.map(row => ({
            id: row.id,
            name: row.name,
            color: row.color,
            userId: row.user_id,
            createdAt: row.created_at,
        }));

        return episode;
    }

    /**
     * Find episode by External ID
     */
    async findByExternalId(externalId: string, userId: string): Promise<MediaEpisode | null> {
        const row = await this.db.get(
            'SELECT * FROM episodes WHERE external_id = ? AND user_id = ?',
            [externalId, userId]
        );
        return row ? this.mapRowToEpisode(row) : null;
    }

    /**
     * Find all episodes with optional filters and sorting
     */
    async findAll(
        filters?: EpisodeFilters,
        sort?: SortOptions,
        pagination?: PaginationOptions
    ): Promise<MediaEpisode[]> {
        const hasTagFilter = filters?.tagIds && filters.tagIds.length > 0;
        let query = `
            SELECT ${hasTagFilter ? 'DISTINCT ' : ''}e.*, c.name as channel_name,
            (SELECT created_at FROM media_events WHERE episode_id = e.id AND event_type = 'added' ORDER BY created_at DESC LIMIT 1) as last_added_at,
            (SELECT created_at FROM media_events WHERE episode_id = e.id AND event_type = 'watched' ORDER BY created_at DESC LIMIT 1) as last_watched_at,
            (SELECT created_at FROM media_events WHERE episode_id = e.id AND event_type = 'pending' ORDER BY created_at DESC LIMIT 1) as last_pending_at,
            (SELECT created_at FROM media_events WHERE episode_id = e.id AND event_type = 'favorited' ORDER BY created_at DESC LIMIT 1) as last_favorited_at,
            (SELECT created_at FROM media_events WHERE episode_id = e.id AND event_type = 'removed' ORDER BY created_at DESC LIMIT 1) as last_removed_at
            FROM episodes e
        `;
        query += ' LEFT JOIN channels c ON e.channel_id = c.id';
        const params: (string | number | null)[] = [];

        // Join with episode_tags if filtering by tags
        if (filters?.tagIds && filters.tagIds.length > 0) {
            query += ' INNER JOIN episode_tags et ON e.id = et.episode_id';
        }

        // Build WHERE clause
        const conditions: string[] = [];

        if (filters?.type) {
            conditions.push('e.type = ?');
            params.push(filters.type);
        }

        if (filters?.tagIds && filters.tagIds.length > 0) {
            const placeholders = filters.tagIds.map(() => '?').join(',');
            conditions.push(`et.tag_id IN (${placeholders})`);
            params.push(...filters.tagIds);
        }

        if (filters?.search) {
            conditions.push(
                '(e.title LIKE ? OR e.description LIKE ? OR EXISTS (SELECT 1 FROM channels c WHERE c.id = e.channel_id AND c.name LIKE ?))'
            );
            const searchTerm = `%${filters.search}%`;
            params.push(searchTerm, searchTerm, searchTerm);
        }

        if (filters?.watched !== undefined) {
            conditions.push('e.watched = ?');
            params.push(filters.watched ? 1 : 0);
        }

        if (filters?.watchStatus !== undefined) {
            conditions.push('e.watch_status = ?');
            params.push(filters.watchStatus);
        }

        if (filters?.favorite !== undefined) {
            conditions.push('e.favorite = ?');
            params.push(filters.favorite ? 1 : 0);
        }

        if (filters?.isDeleted !== undefined) {
            conditions.push('e.is_deleted = ?');
            params.push(filters.isDeleted ? 1 : 0);
        } else {
            // Default: only show non-deleted episodes
            conditions.push('e.is_deleted = 0');
        }

        if (filters?.channelId) {
            conditions.push('e.channel_id = ?');
            params.push(filters.channelId);
        }

        if (filters?.channelIds && filters.channelIds.length > 0) {
            const placeholders = filters.channelIds.map(() => '?').join(',');
            conditions.push(`e.channel_id IN (${placeholders})`);
            params.push(...filters.channelIds);
        }

        if (filters?.userId) {
            conditions.push('e.user_id = ?');
            params.push(filters.userId);
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
            query += ' ORDER BY e.custom_order ASC, e.created_at DESC';
        }

        // Add pagination
        if (pagination?.limit !== undefined) {
            query += ' LIMIT ?';
            params.push(pagination.limit);
        }
        if (pagination?.offset !== undefined) {
            query += ' OFFSET ?';
            params.push(pagination.offset);
        }

        const rows = await this.db.all(query, params);
        const episodes = rows.map((row) => this.mapRowToEpisode(row));

        if (episodes.length > 0) {
            const episodeIds = episodes.map(e => e.id);
            const placeholders = episodeIds.map(() => '?').join(',');
            const tagRows = await this.db.all(`
                SELECT et.episode_id, t.* FROM tags t
                JOIN episode_tags et ON t.id = et.tag_id
                WHERE et.episode_id IN (${placeholders})
            `, episodeIds);

            // Group tags by episode_id
            const tagsByEpisodeId: Record<string, Tag[]> = {};
            tagRows.forEach((row: Record<string, unknown>) => {
                if (!tagsByEpisodeId[row.episode_id as string]) {
                    tagsByEpisodeId[row.episode_id as string] = [];
                }
                tagsByEpisodeId[row.episode_id as string].push({
                    id: row.id as string,
                    name: row.name as string,
                    color: row.color as string | null,
                    userId: row.user_id as string,
                    createdAt: row.created_at as number,
                });
            });

            // Attach tags to episodes
            episodes.forEach(e => {
                e.tags = tagsByEpisodeId[e.id] || [];
            });
        }

        return episodes;
    }

    /**
     * Count all episodes matching filters
     */
    async countAll(filters?: EpisodeFilters): Promise<number> {
        const hasTagFilter = filters?.tagIds && filters.tagIds.length > 0;
        let query = `SELECT COUNT(${hasTagFilter ? 'DISTINCT ' : ''}e.id) as count FROM episodes e`;
        const params: (string | number | null)[] = [];

        if (hasTagFilter) {
            query += ' INNER JOIN episode_tags et ON e.id = et.episode_id';
        }

        const conditions: string[] = [];

        if (filters?.type) {
            conditions.push('e.type = ?');
            params.push(filters.type);
        }

        if (filters?.tagIds && filters.tagIds.length > 0) {
            const placeholders = filters.tagIds.map(() => '?').join(',');
            conditions.push(`et.tag_id IN (${placeholders})`);
            params.push(...filters.tagIds);
        }

        if (filters?.search) {
            conditions.push(
                '(e.title LIKE ? OR e.description LIKE ? OR EXISTS (SELECT 1 FROM channels c WHERE c.id = e.channel_id AND c.name LIKE ?))'
            );
            const searchTerm = `%${filters.search}%`;
            params.push(searchTerm, searchTerm, searchTerm);
        }

        if (filters?.watched !== undefined) {
            conditions.push('e.watched = ?');
            params.push(filters.watched ? 1 : 0);
        }

        if (filters?.watchStatus !== undefined) {
            conditions.push('e.watch_status = ?');
            params.push(filters.watchStatus);
        }

        if (filters?.favorite !== undefined) {
            conditions.push('e.favorite = ?');
            params.push(filters.favorite ? 1 : 0);
        }

        if (filters?.isDeleted !== undefined) {
            conditions.push('e.is_deleted = ?');
            params.push(filters.isDeleted ? 1 : 0);
        } else {
            conditions.push('e.is_deleted = 0');
        }

        if (filters?.channelId) {
            conditions.push('e.channel_id = ?');
            params.push(filters.channelId);
        }

        if (filters?.channelIds && filters.channelIds.length > 0) {
            const placeholders = filters.channelIds.map(() => '?').join(',');
            conditions.push(`e.channel_id IN (${placeholders})`);
            params.push(...filters.channelIds);
        }

        if (filters?.userId) {
            conditions.push('e.user_id = ?');
            params.push(filters.userId);
        }

        if (conditions.length > 0) {
            query += ' WHERE ' + conditions.join(' AND ');
        }

        const result = await this.db.get(query, params);
        return result?.count || 0;
    }

    /**
     * Update episode
     */
    async update(id: string, dto: UpdateEpisodeDto): Promise<MediaEpisode> {
        const updates: string[] = [];
        const params: (string | number | null)[] = [];

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
            // Sync watch_status if not explicitly provided
            if (dto.watchStatus === undefined) {
                updates.push('watch_status = ?');
                params.push(dto.watched ? 'watched' : 'unwatched');
            }
        }
        if (dto.watchStatus !== undefined) {
            updates.push('watch_status = ?');
            params.push(dto.watchStatus);
            // Sync watched boolean
            updates.push('watched = ?');
            params.push(dto.watchStatus === 'watched' ? 1 : 0);
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
        if (dto.isShort !== undefined) {
            updates.push('is_short = ?');
            params.push(dto.isShort ? 1 : 0);
        }

        updates.push('updated_at = ?');
        params.push(Math.floor(Date.now() / 1000));

        params.push(id);

        await this.db.run(
            `UPDATE episodes SET ${updates.join(', ')} WHERE id = ?`,
            params
        );

        // Update tags if provided
        if (dto.tagIds !== undefined) {
            await this.removeTags(id);
            if (dto.tagIds.length > 0) {
                await this.addTags(id, dto.tagIds);
            }
        }

        const episode = await this.findById(id);
        if (!episode) {
            throw new Error('Episode not found after update');
        }
        return episode;
    }

    /**
     * Bulk update watch status for all episodes in a channel
     */
    async bulkUpdateWatchStatus(channelId: string, userId: string, watched: boolean): Promise<void> {
        const now = Math.floor(Date.now() / 1000);
        const watchStatus = watched ? 'watched' : 'unwatched';
        const watchedInt = watched ? 1 : 0;

        // Get all applicable episodes first to create events
        const episodes = await this.findAll({ channelId, userId, isDeleted: false });

        await this.db.run('BEGIN TRANSACTION');

        try {
            await this.db.run(
                `UPDATE episodes 
                 SET watched = ?, watch_status = ?, updated_at = ? 
                 WHERE channel_id = ? AND user_id = ? AND is_deleted = 0`,
                [watchedInt, watchStatus, now, channelId, userId]
            );

            // Add events for each episode
            const eventType = watched ? 'watched' : 'unwatched';
            for (const episode of episodes) {
                if (episode.watched !== watched) {
                    await this.addEvent(episode.id, eventType, episode.title, episode.type);
                }
            }

            await this.db.run('COMMIT');
        } catch (error) {
            await this.db.run('ROLLBACK');
            throw error;
        }
    }

    /**
     * Delete episode (soft delete)
     */
    async delete(id: string): Promise<void> {
        await this.db.run('UPDATE episodes SET is_deleted = 1, updated_at = ? WHERE id = ?', [
            Math.floor(Date.now() / 1000),
            id
        ]);
    }

    /**
     * Restore all soft-deleted episodes for a user
     */
    async bulkRestore(userId: string): Promise<void> {
        await this.db.run(
            'UPDATE episodes SET is_deleted = 0, updated_at = ? WHERE user_id = ? AND is_deleted = 1',
            [Math.floor(Date.now() / 1000), userId]
        );
    }

    /**
     * Permanently delete episode (hard delete)
     * Removes the episode and all associated data from the database
     */
    async hardDelete(id: string): Promise<void> {
        await this.db.run('BEGIN TRANSACTION');

        try {
            // Delete associated tags
            await this.db.run('DELETE FROM episode_tags WHERE episode_id = ?', id);

            // Delete associated events
            await this.db.run('DELETE FROM media_events WHERE episode_id = ?', id);

            // Delete the episode itself
            await this.db.run('DELETE FROM episodes WHERE id = ?', id);

            await this.db.run('COMMIT');
        } catch (error) {
            await this.db.run('ROLLBACK');
            throw error;
        }
    }

    /**
     * Permanently delete all soft-deleted episodes for a user
     */
    async bulkHardDelete(userId: string): Promise<void> {
        await this.db.run('BEGIN TRANSACTION');

        try {
            // Find all soft-deleted episode IDs first for cleaning up relations
            const rows = await this.db.all('SELECT id FROM episodes WHERE user_id = ? AND is_deleted = 1', userId);
            const ids = rows.map(row => row.id);

            if (ids.length > 0) {
                const placeholders = ids.map(() => '?').join(',');
                
                // Delete associated tags
                await this.db.run(`DELETE FROM episode_tags WHERE episode_id IN (${placeholders})`, ids);

                // Delete associated events
                await this.db.run(`DELETE FROM media_events WHERE episode_id IN (${placeholders})`, ids);

                // Delete the episodes
                await this.db.run(`DELETE FROM episodes WHERE user_id = ? AND is_deleted = 1`, userId);
            }

            await this.db.run('COMMIT');
        } catch (error) {
            await this.db.run('ROLLBACK');
            throw error;
        }
    }


    /**
     * Add a media event
     */
    async addEvent(episodeId: string, eventType: MediaEventType, title?: string, type?: string): Promise<void> {
        const id = uuidv4();
        const now = Math.floor(Date.now() / 1000);

        await this.db.run(
            'INSERT INTO media_events (id, episode_id, event_type, title, type, created_at) VALUES (?, ?, ?, ?, ?, ?)',
            [id, episodeId, eventType, title || null, type || null, now]
        );
    }

    /**
     * Reorder episodes
     */
    async reorder(episodeIds: string[]): Promise<void> {
        const now = Math.floor(Date.now() / 1000);

        // Use a transaction for consistency
        await this.db.run('BEGIN TRANSACTION');

        try {
            for (let i = 0; i < episodeIds.length; i++) {
                await this.db.run(
                    'UPDATE episodes SET custom_order = ?, updated_at = ? WHERE id = ?',
                    [i, now, episodeIds[i]]
                );
            }
            await this.db.run('COMMIT');
        } catch (error) {
            await this.db.run('ROLLBACK');
            throw error;
        }
    }

    /**
     * Move episode to the beginning of the list
     */
    async moveToBeginning(id: string): Promise<void> {
        const episodes = await this.findAll({ watched: false }, { field: 'custom', order: 'asc' });
        const episodeIds = episodes.map(e => e.id).filter(vid => vid !== id);
        episodeIds.unshift(id);
        await this.reorder(episodeIds);
    }

    /**
     * Move episode to the end of the list
     */
    async moveToEnd(id: string): Promise<void> {
        const episodes = await this.findAll({ watched: false }, { field: 'custom', order: 'asc' });
        const episodeIds = episodes.map(e => e.id).filter(vid => vid !== id);
        episodeIds.push(id);
        await this.reorder(episodeIds);
    }

    /**
     * Associate tags with an episode
     */
    async addTags(episodeId: string, tagIds: string[]): Promise<void> {
        const now = Math.floor(Date.now() / 1000);

        for (const tagId of tagIds) {
            await this.db.run(
                'INSERT OR IGNORE INTO episode_tags (episode_id, tag_id, created_at) VALUES (?, ?, ?)',
                [episodeId, tagId, now]
            );
        }
    }

    /**
     * Remove all tags from an episode
     */
    async removeTags(episodeId: string): Promise<void> {
        await this.db.run('DELETE FROM episode_tags WHERE episode_id = ?', episodeId);
    }

    /**
     * Get tags for an episode
     */
    async getTags(episodeId: string): Promise<string[]> {
        const rows = await this.db.all(
            'SELECT tag_id FROM episode_tags WHERE episode_id = ?',
            episodeId
        );
        return rows.map((row: Record<string, unknown>) => row.tag_id as string);
    }

    private buildOrderBy(sort: SortOptions): string {
        const direction = sort.order === 'asc' ? 'ASC' : 'DESC';

        switch (sort.field) {
            case 'custom':
                return `e.custom_order ${direction}, e.created_at DESC`;
            case 'created_at':
                return `e.created_at ${direction}`;
            case 'priority':
                return `e.priority ${direction}, e.created_at DESC`;
            case 'favorite':
                return `e.favorite ${direction}, e.created_at DESC`;
            case 'duration':
                return `e.duration ${direction}`;
            case 'title':
                return `e.title ${direction}`;
            case 'date_added':
                return `last_added_at ${direction}`;
            case 'date_watched':
                return `last_watched_at ${direction}`;
            case 'date_favorited':
                return `last_favorited_at ${direction}`;
            case 'date_removed':
                return `last_removed_at ${direction}`;
            default:
                return 'e.custom_order ASC, e.created_at DESC';
        }
    }

    private mapRowToEpisode(row: Record<string, unknown>): MediaEpisode {
        return {
            id: row.id as string,
            type: row.type as MediaType,
            externalId: row.external_id as string,
            title: row.title as string,
            description: row.description as string | null,
            duration: row.duration as number | null,
            thumbnailUrl: row.thumbnail_url as string | null,
            url: row.url as string,
            uploadDate: row.upload_date as string | null,
            publishedDate: row.published_date as string | null,
            viewCount: row.view_count as number | null,
            channelId: row.channel_id as string,
            channelName: row.channel_name as string | undefined,
            watched: Boolean(row.watched),
            watchStatus: row.watch_status as WatchStatus,
            favorite: Boolean(row.favorite),
            isDeleted: Boolean(row.is_deleted),
            priority: row.priority as Priority,
            customOrder: row.custom_order as number | null,
            isShort: Boolean(row.is_short),
            userId: row.user_id as string,
            createdAt: row.created_at as number,
            updatedAt: row.updated_at as number,
            lastAddedAt: (row.last_added_at as number) || undefined,
            lastWatchedAt: (row.last_watched_at as number) || undefined,
            lastPendingAt: (row.last_pending_at as number) || undefined,
            lastFavoritedAt: (row.last_favorited_at as number) || undefined,
            lastRemovedAt: (row.last_removed_at as number) || undefined,
        };
    }
}
