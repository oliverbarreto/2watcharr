import { Database } from 'sqlite';
import { Channel, CreateChannelDto, Tag } from '../domain/models';

export class ChannelRepository {
    constructor(private db: Database) { }

    /**
     * Create a new channel
     */
    async create(dto: CreateChannelDto): Promise<Channel> {
        const now = Math.floor(Date.now() / 1000);

        await this.db.run(
            `INSERT INTO channels (
        id, name, description, thumbnail_url, channel_url, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [
                dto.id,
                dto.name,
                dto.description || null,
                dto.thumbnailUrl || null,
                dto.channelUrl,
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
        const params: any[] = [];

        if (dto.name !== undefined) {
            updates.push('name = ?');
            params.push(dto.name);
        }
        if (dto.description !== undefined) {
            updates.push('description = ?');
            params.push(dto.description);
        }
        if (dto.thumbnailUrl !== undefined) {
            updates.push('thumbnail_url = ?');
            params.push(dto.thumbnailUrl);
        }
        if (dto.channelUrl !== undefined) {
            updates.push('channel_url = ?');
            params.push(dto.channelUrl);
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
     * Get channel with video count
     */
    async getChannelsWithVideoCount(): Promise<Array<Channel & { videoCount: number; tags: Tag[] }>> {
        const rows = await this.db.all(`
            SELECT c.*, COUNT(v.id) as video_count
            FROM channels c
            LEFT JOIN videos v ON c.id = v.channel_id AND v.is_deleted = 0
            GROUP BY c.id
            ORDER BY c.name ASC
        `);

        const channels = rows.map((row: any) => ({
            ...this.mapRowToChannel(row),
            videoCount: row.video_count,
            tags: [] as Tag[],
        }));

        if (channels.length > 0) {
            const channelIds = channels.map((c) => c.id);
            const placeholders = channelIds.map(() => '?').join(',');

            // Get all tags for these channels
            const tagRows = await this.db.all(`
                SELECT DISTINCT v.channel_id, t.*
                FROM tags t
                JOIN video_tags vt ON t.id = vt.tag_id
                JOIN videos v ON vt.video_id = v.id
                WHERE v.channel_id IN (${placeholders}) AND v.is_deleted = 0
                ORDER BY t.name ASC
            `, channelIds);

            // Group tags by channel_id
            const tagsByChannelId: Record<string, Tag[]> = {};
            tagRows.forEach((row: any) => {
                if (!tagsByChannelId[row.channel_id]) {
                    tagsByChannelId[row.channel_id] = [];
                }
                tagsByChannelId[row.channel_id].push({
                    id: row.id,
                    name: row.name,
                    color: row.color,
                    userId: row.user_id,
                    createdAt: row.created_at,
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

    private mapRowToChannel(row: any): Channel {
        return {
            id: row.id,
            name: row.name,
            description: row.description,
            thumbnailUrl: row.thumbnail_url,
            channelUrl: row.channel_url,
            createdAt: row.created_at,
            updatedAt: row.updated_at,
        };
    }
}
