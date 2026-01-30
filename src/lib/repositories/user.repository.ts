import { Database } from 'sqlite';
import { v4 as uuidv4 } from 'uuid';
import { User, UserProfile } from '../domain/models';

export class UserRepository {
    constructor(private db: Database) { }

    /**
     * Create a new user
     */
    async create(user: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> {
        const id = uuidv4();
        const now = Math.floor(Date.now() / 1000);

        await this.db.run(
            `INSERT INTO users (
                id, username, password, display_name, emoji, color, is_admin, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                id,
                user.username,
                user.password,
                user.displayName || null,
                user.emoji || null,
                user.color || null,
                user.isAdmin ? 1 : 0,
                now,
                now,
            ]
        );

        const created = await this.findById(id);
        if (!created) throw new Error('Failed to create user');
        return created;
    }

    /**
     * Find user by ID
     */
    async findById(id: string): Promise<User | null> {
        const row = await this.db.get('SELECT * FROM users WHERE id = ?', id);
        return row ? this.mapRowToUser(row) : null;
    }

    /**
     * Find user by username
     */
    async findByUsername(username: string): Promise<User | null> {
        const row = await this.db.get('SELECT * FROM users WHERE username = ?', username);
        return row ? this.mapRowToUser(row) : null;
    }

    /**
     * Get all user profiles (excluding passwords)
     */
    async findAllProfiles(): Promise<UserProfile[]> {
        const rows = await this.db.all('SELECT id, username, display_name, emoji, color, is_admin, created_at, updated_at FROM users ORDER BY created_at ASC');
        return rows.map(this.mapRowToUserProfile);
    }

    /**
     * Update user
     */
    async update(id: string, updates: Partial<Omit<User, 'id' | 'createdAt' | 'updatedAt'>>): Promise<User> {
        const fields: string[] = [];
        const params: any[] = [];
        const now = Math.floor(Date.now() / 1000);

        Object.entries(updates).forEach(([key, value]) => {
            if (value !== undefined) {
                // Map camelCase to snake_case if necessary
                const dbKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
                fields.push(`${dbKey} = ?`);
                params.push(value === true ? 1 : value === false ? 0 : value);
            }
        });

        if (fields.length === 0) {
            const current = await this.findById(id);
            if (!current) throw new Error('User not found');
            return current;
        }

        fields.push('updated_at = ?');
        params.push(now);
        params.push(id);

        await this.db.run(
            `UPDATE users SET ${fields.join(', ')} WHERE id = ?`,
            params
        );

        const updated = await this.findById(id);
        if (!updated) throw new Error('User not found after update');
        return updated;
    }

    /**
     * Delete user
     */
    async delete(id: string): Promise<void> {
        await this.db.run('DELETE FROM users WHERE id = ?', id);
    }

    /**
     * Count users
     */
    async count(): Promise<number> {
        const row = await this.db.get('SELECT COUNT(*) as count FROM users');
        return row.count;
    }

    private mapRowToUser(row: any): User {
        return {
            id: row.id,
            username: row.username,
            password: row.password,
            displayName: row.display_name,
            emoji: row.emoji,
            color: row.color,
            isAdmin: Boolean(row.is_admin),
            createdAt: row.created_at,
            updatedAt: row.updated_at,
        };
    }

    private mapRowToUserProfile(row: any): UserProfile {
        return {
            id: row.id,
            username: row.username,
            displayName: row.display_name,
            emoji: row.emoji,
            color: row.color,
            isAdmin: Boolean(row.is_admin),
            createdAt: row.created_at,
            updatedAt: row.updated_at,
        };
    }
}
