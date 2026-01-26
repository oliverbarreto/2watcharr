import { Database } from 'sqlite';
import { Channel, CreateChannelDto } from '../domain/models';

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
    async getChannelsWithVideoCount(): Promise<Array<Channel & { videoCount: number }>> {
        const rows = await this.db.all(`
      SELECT c.*, COUNT(v.id) as video_count
      FROM channels c
      LEFT JOIN videos v ON c.id = v.channel_id
      GROUP BY c.id
      ORDER BY c.name ASC
    `);

        return rows.map((row: any) => ({
            ...this.mapRowToChannel(row),
            videoCount: row.video_count,
        }));
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
