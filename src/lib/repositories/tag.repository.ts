import { Database } from 'sqlite';
import { v4 as uuidv4 } from 'uuid';
import { Tag, CreateTagDto } from '../domain/models';
import { sortTagsAlphabetically } from '../utils/tag-utils';

export class TagRepository {
    constructor(private db: Database) { }

    /**
     * Create a new tag
     */
    async create(dto: CreateTagDto): Promise<Tag> {
        const id = uuidv4();
        const now = Math.floor(Date.now() / 1000);

        await this.db.run(
            `INSERT INTO tags (id, name, color, user_id, last_used_at, created_at) VALUES (?, ?, ?, ?, ?, ?)`,
            [id, dto.name, dto.color || null, dto.userId, now, now]
        );

        const tag = await this.findById(id);
        if (!tag) {
            throw new Error('Failed to create tag');
        }
        return tag;
    }

    /**
     * Update last used timestamp
     */
    async updateLastUsed(id: string, timestamp: number): Promise<void> {
        await this.db.run(
            'UPDATE tags SET last_used_at = ? WHERE id = ?',
            [timestamp, id]
        );
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
    async findByName(name: string, userId: string): Promise<Tag | null> {
        const row = await this.db.get('SELECT * FROM tags WHERE name = ? AND user_id = ?', [name, userId]);
        return row ? this.mapRowToTag(row) : null;
    }

    /**
     * Find all tags
     */
    async findAll(userId?: string, sort: 'alphabetical' | 'recent' = 'alphabetical'): Promise<Tag[]> {
        let query = 'SELECT * FROM tags';
        const params: (string | number | null)[] = [];
        if (userId) {
            query += ' WHERE user_id = ?';
            params.push(userId);
        }

        if (sort === 'recent') {
            query += ' ORDER BY last_used_at DESC, name ASC';
        } else {
            query += ' ORDER BY name ASC';
        }

        const rows = await this.db.all(query, params);
        const tags = rows.map((row) => this.mapRowToTag(row));

        if (sort === 'alphabetical') {
            return sortTagsAlphabetically(tags);
        }

        return tags;
    }

    /**
     * Update a tag
     */
    async update(id: string, dto: Partial<CreateTagDto>): Promise<Tag> {
        const updates: string[] = [];
        const values: (string | number | null)[] = [];

        if (dto.name !== undefined) {
            updates.push('name = ?');
            values.push(dto.name);
        }

        if (dto.color !== undefined) {
            updates.push('color = ?');
            values.push(dto.color);
        }

        if (updates.length === 0) {
            const tag = await this.findById(id);
            if (!tag) throw new Error('Tag not found');
            return tag;
        }

        values.push(id);
        await this.db.run(
            `UPDATE tags SET ${updates.join(', ')} WHERE id = ?`,
            values
        );

        const updatedTag = await this.findById(id);
        if (!updatedTag) {
            throw new Error('Failed to update tag');
        }
        return updatedTag;
    }

    /**
     * Delete tag
     */
    async delete(id: string): Promise<void> {
        await this.db.run('DELETE FROM tags WHERE id = ?', id);
    }

    /**
     * Get tags with episode count
     */
    async getTagsWithEpisodeCount(userId?: string, sort: 'alphabetical' | 'usage' | 'recent' = 'alphabetical'): Promise<Array<Tag & { episodeCount: number }>> {
        let query = `
            SELECT t.*, COUNT(et.episode_id) as episode_count
            FROM tags t
            LEFT JOIN episode_tags et ON t.id = et.tag_id
        `;
        const params: (string | number | null)[] = [];
        if (userId) {
            query += ' WHERE t.user_id = ?';
            params.push(userId);
        }
        
        query += ' GROUP BY t.id';

        if (sort === 'usage') {
            query += ' ORDER BY episode_count DESC, t.name ASC';
        } else if (sort === 'recent') {
            query += ' ORDER BY t.last_used_at DESC, t.name ASC';
        } else {
            query += ' ORDER BY t.name ASC';
        }

        const rows = await this.db.all(query, params);

        const tagsWithCount = rows.map((row: Record<string, unknown>) => ({
            ...this.mapRowToTag(row),
            episodeCount: row.episode_count as number,
        }));

        if (sort === 'alphabetical') {
            return sortTagsAlphabetically(tagsWithCount);
        }

        return tagsWithCount;
    }

    private mapRowToTag(row: Record<string, unknown>): Tag {
        return {
            id: row.id as string,
            name: row.name as string,
            color: row.color as string | null,
            userId: row.user_id as string,
            lastUsedAt: row.last_used_at as number | undefined,
            createdAt: row.created_at as number,
        };
    }
}
