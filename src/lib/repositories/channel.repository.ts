import { Database } from 'sqlite';
import { Channel, CreateChannelDto, Tag, ChannelFilters, MediaType } from '../domain/models';

export class ChannelRepository {
    constructor(private db: Database) { }

    /**
     * Create a new channel
     */
    async create(dto: CreateChannelDto): Promise<Channel> {
        const now = Math.floor(Date.now() / 1000);

        await this.db.run(
            `INSERT INTO channels (
        id, type, name, description, thumbnail_url, url, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                dto.id,
                dto.type,
                dto.name,
                dto.description || null,
                dto.thumbnail_url || dto.thumbnailUrl || null,
                dto.url,
                now,
                now,
            ]
        );

        const channel = await this.findById(dto.id);
        if (!channel) {
            throw new Error('Failed to create channel');
        }
        return channel;
    }

    /**
     * Find channel by ID
     */
    async findById(id: string): Promise<Channel | null> {
        const row = await this.db.get('SELECT * FROM channels WHERE id = ?', id);
        return row ? this.mapRowToChannel(row) : null;
    }

    /**
     * Find all channels
     */
    async findAll(): Promise<Channel[]> {
        const rows = await this.db.all('SELECT * FROM channels ORDER BY name ASC');
        return rows.map((row) => this.mapRowToChannel(row));
    }

    /**
     * Update channel
     */
    async update(id: string, dto: Partial<CreateChannelDto>): Promise<Channel> {
        const updates: string[] = [];
        const params: (string | number | null)[] = [];

        if (dto.name !== undefined) {
            updates.push('name = ?');
            params.push(dto.name);
        }
        if (dto.description !== undefined) {
            updates.push('description = ?');
            params.push(dto.description);
        }
        if (dto.thumbnail_url !== undefined || dto.thumbnailUrl !== undefined) {
            updates.push('thumbnail_url = ?');
            params.push((dto.thumbnail_url || dto.thumbnailUrl) ?? null);
        }
        if (dto.url !== undefined) {
            updates.push('url = ?');
            params.push(dto.url);
        }

        updates.push('updated_at = ?');
        params.push(Math.floor(Date.now() / 1000));

        params.push(id);

        await this.db.run(
            `UPDATE channels SET ${updates.join(', ')} WHERE id = ?`,
            params
        );

        const channel = await this.findById(id);
        if (!channel) {
            throw new Error('Channel not found after update');
        }
        return channel;
    }

    /**
     * Get channel with episode count
     */
    async getChannelsWithEpisodeCount(filters?: ChannelFilters): Promise<Array<Channel & { episodeCount: number; tags: Tag[] }>> {
        const params: (string | number | null)[] = [];
        const conditions: string[] = [];

        let query = `
            SELECT c.*, COUNT(e.id) as episode_count
            FROM channels c
            LEFT JOIN episodes e ON c.id = e.channel_id AND e.is_deleted = 0
        `;

        if (filters?.userId) {
            query = `
                SELECT c.*, COUNT(e.id) as episode_count
                FROM channels c
                INNER JOIN episodes e ON c.id = e.channel_id AND e.is_deleted = 0 AND e.user_id = ?
            `;
            params.push(filters.userId);
        }

        if (filters?.search) {
            conditions.push('(c.name LIKE ? OR c.description LIKE ?)');
            const searchTerm = `%${filters.search}%`;
            params.push(searchTerm, searchTerm);
        }

        if (filters?.type) {
            conditions.push('c.type = ?');
            params.push(filters.type);
        }

        if (filters?.tagIds && filters.tagIds.length > 0) {
            const placeholders = filters.tagIds.map(() => '?').join(',');
            conditions.push(`EXISTS (
                SELECT 1 FROM episode_tags et 
                JOIN episodes ep ON et.episode_id = ep.id
                WHERE ep.channel_id = c.id AND et.tag_id IN (${placeholders})
                ${filters?.userId ? 'AND ep.user_id = ?' : ''}
            )`);
            params.push(...filters.tagIds);
            if (filters?.userId) params.push(filters.userId);
        }

        if (conditions.length > 0) {
            query += ' WHERE ' + conditions.join(' AND ');
        }

        query += `
            GROUP BY c.id
            ORDER BY COALESCE(c.custom_order, 999999) ASC, c.name ASC
        `;

        const rows = await this.db.all(query, params);

        const channels = rows.map((row: Record<string, unknown>) => ({
            ...this.mapRowToChannel(row),
            episodeCount: row.episode_count as number,
            tags: [] as Tag[],
        }));

        if (channels.length > 0) {
            const channelIds = channels.map((c) => c.id);
            const placeholders = channelIds.map(() => '?').join(',');

            // Get all tags for these channels, filtered by user if provided
            const tagRows = await this.db.all(`
                SELECT DISTINCT e.channel_id, t.*
                FROM tags t
                JOIN episode_tags et ON t.id = et.tag_id
                JOIN episodes e ON et.episode_id = e.id
                WHERE e.channel_id IN (${placeholders}) AND e.is_deleted = 0
                ${filters?.userId ? 'AND e.user_id = ? AND t.user_id = ?' : ''}
                ORDER BY t.name ASC
            `, [...channelIds, ...(filters?.userId ? [filters.userId, filters.userId] : [])]);

            // Group tags by channel_id
            const tagsByChannelId: Record<string, Tag[]> = {};
            tagRows.forEach((row: Record<string, unknown>) => {
                if (!tagsByChannelId[row.channel_id as string]) {
                    tagsByChannelId[row.channel_id as string] = [];
                }
                tagsByChannelId[row.channel_id as string].push({
                    id: row.id as string,
                    name: row.name as string,
                    color: row.color as string | null,
                    userId: row.user_id as string,
                    createdAt: row.created_at as number,
                });
            });

            // Attach tags to channels
            channels.forEach((c) => {
                c.tags = tagsByChannelId[c.id] || [];
            });
        }

        return channels;
    }

    /**
     * Delete a channel
     */
    async delete(id: string): Promise<void> {
        await this.db.run('DELETE FROM channels WHERE id = ?', id);
    }

    private mapRowToChannel(row: Record<string, unknown>): Channel {
        return {
            id: row.id as string,
            type: (row.type as MediaType) || 'video',
            name: row.name as string,
            description: row.description as string | null,
            thumbnailUrl: (row.thumbnail_url || row.thumbnailUrl) as string | null,
            url: (row.url || row.channel_url) as string,
            customOrder: row.custom_order as number | null,
            createdAt: row.created_at as number,
            updatedAt: row.updated_at as number,
        };
    }
}
