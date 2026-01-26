import { Database } from 'sqlite';
import { v4 as uuidv4 } from 'uuid';
import { Tag, CreateTagDto } from '../domain/models';

export class TagRepository {
    constructor(private db: Database) { }

    /**
     * Create a new tag
     */
    async create(dto: CreateTagDto): Promise<Tag> {
        const id = uuidv4();
        const now = Math.floor(Date.now() / 1000);

        await this.db.run(
            `INSERT INTO tags (id, name, color, user_id, created_at) VALUES (?, ?, ?, ?, ?)`,
            [id, dto.name, dto.color || null, dto.userId || null, now]
        );

        const tag = await this.findById(id);
        if (!tag) {
            throw new Error('Failed to create tag');
        }
        return tag;
    }

    /**
     * Find tag by ID
     */
    async findById(id: string): Promise<Tag | null> {
        const row = await this.db.get('SELECT * FROM tags WHERE id = ?', id);
        return row ? this.mapRowToTag(row) : null;
    }

    /**
     * Find tag by name
     */
    async findByName(name: string): Promise<Tag | null> {
        const row = await this.db.get('SELECT * FROM tags WHERE name = ?', name);
        return row ? this.mapRowToTag(row) : null;
    }

    /**
     * Find all tags
     */
    async findAll(): Promise<Tag[]> {
        const rows = await this.db.all('SELECT * FROM tags ORDER BY name ASC');
        return rows.map((row) => this.mapRowToTag(row));
    }

    /**
     * Delete tag
     */
    async delete(id: string): Promise<void> {
        await this.db.run('DELETE FROM tags WHERE id = ?', id);
    }

    /**
     * Get tags with video count
     */
    async getTagsWithVideoCount(): Promise<Array<Tag & { videoCount: number }>> {
        const rows = await this.db.all(`
      SELECT t.*, COUNT(vt.video_id) as video_count
      FROM tags t
      LEFT JOIN video_tags vt ON t.id = vt.tag_id
      GROUP BY t.id
      ORDER BY t.name ASC
    `);

        return rows.map((row: any) => ({
            ...this.mapRowToTag(row),
            videoCount: row.video_count,
        }));
    }

    private mapRowToTag(row: any): Tag {
        return {
            id: row.id,
            name: row.name,
            color: row.color,
            userId: row.user_id,
            createdAt: row.created_at,
        };
    }
}
