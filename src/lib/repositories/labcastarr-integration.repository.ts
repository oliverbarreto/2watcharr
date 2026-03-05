import { Database } from 'sqlite';
import { v4 as uuidv4 } from 'uuid';
import {
    LabcastARRIntegration,
    CreateLabcastARRIntegrationDto,
    UpdateLabcastARRIntegrationDto,
} from '../domain/models';

export class LabcastARRIntegrationRepository {
    constructor(private db: Database) { }

    /**
     * Create a new integration
     */
    async create(dto: CreateLabcastARRIntegrationDto): Promise<LabcastARRIntegration> {
        const id = uuidv4();
        const now = Math.floor(Date.now() / 1000);

        await this.db.run(
            `INSERT INTO labcastarr_integrations (
                id, user_id, enabled, name, api_url, api_token, channel_id,
                auto_tag, audio_quality, audio_language, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                id,
                dto.userId,
                0, // Initially disabled
                dto.name,
                dto.apiUrl,
                dto.apiToken,
                dto.channelId,
                dto.autoTag || '2WatchARR',
                dto.audioQuality || 'default',
                dto.audioLanguage || 'default',
                now,
                now,
            ]
        );

        const integration = await this.findById(id);
        if (!integration) {
            throw new Error('Failed to create LabcastARR integration');
        }
        return integration;
    }

    /**
     * Find integration by ID
     */
    async findById(id: string): Promise<LabcastARRIntegration | null> {
        const row = await this.db.get('SELECT * FROM labcastarr_integrations WHERE id = ?', id);
        return row ? this.mapRowToIntegration(row) : null;
    }

    /**
     * Find all integrations for a user
     */
    async findByUserId(userId: string): Promise<LabcastARRIntegration[]> {
        const rows = await this.db.all(
            'SELECT * FROM labcastarr_integrations WHERE user_id = ? ORDER BY created_at DESC',
            userId
        );
        return rows.map(row => this.mapRowToIntegration(row));
    }

    /**
     * Find all active integrations for a user
     */
    async findActiveByUserId(userId: string): Promise<LabcastARRIntegration[]> {
        const rows = await this.db.all(
            'SELECT * FROM labcastarr_integrations WHERE user_id = ? AND enabled = 1',
            userId
        );
        return rows.map(row => this.mapRowToIntegration(row));
    }

    /**
     * Find active integrations for a user by auto_tag
     */
    async findByTagAndUserId(tag: string, userId: string): Promise<LabcastARRIntegration[]> {
        const rows = await this.db.all(
            'SELECT * FROM labcastarr_integrations WHERE user_id = ? AND enabled = 1 AND auto_tag = ?',
            [userId, tag]
        );
        return rows.map(row => this.mapRowToIntegration(row));
    }

    /**
     * Update integration
     */
    async update(id: string, dto: UpdateLabcastARRIntegrationDto): Promise<LabcastARRIntegration> {
        const updates: string[] = [];
        const params: (string | number | boolean | null)[] = [];

        if (dto.enabled !== undefined) {
            updates.push('enabled = ?');
            params.push(dto.enabled ? 1 : 0);
        }
        if (dto.name !== undefined) {
            updates.push('name = ?');
            params.push(dto.name);
        }
        if (dto.apiUrl !== undefined) {
            updates.push('api_url = ?');
            params.push(dto.apiUrl);
        }
        if (dto.apiToken !== undefined) {
            updates.push('api_token = ?');
            params.push(dto.apiToken);
        }
        if (dto.channelId !== undefined) {
            updates.push('channel_id = ?');
            params.push(dto.channelId);
        }
        if (dto.autoTag !== undefined) {
            updates.push('auto_tag = ?');
            params.push(dto.autoTag);
        }
        if (dto.audioQuality !== undefined) {
            updates.push('audio_quality = ?');
            params.push(dto.audioQuality);
        }
        if (dto.audioLanguage !== undefined) {
            updates.push('audio_language = ?');
            params.push(dto.audioLanguage);
        }

        updates.push('updated_at = ?');
        params.push(Math.floor(Date.now() / 1000));

        params.push(id);

        await this.db.run(
            `UPDATE labcastarr_integrations SET ${updates.join(', ')} WHERE id = ?`,
            params
        );

        const integration = await this.findById(id);
        if (!integration) {
            throw new Error('Integration not found after update');
        }
        return integration;
    }

    /**
     * Delete integration
     */
    async delete(id: string): Promise<void> {
        await this.db.run('DELETE FROM labcastarr_integrations WHERE id = ?', id);
    }

    private mapRowToIntegration(row: Record<string, unknown>): LabcastARRIntegration {
        return {
            id: row.id as string,
            userId: row.user_id as string,
            enabled: Boolean(row.enabled),
            name: row.name as string,
            apiUrl: row.api_url as string,
            apiToken: row.api_token as string,
            channelId: row.channel_id as string,
            autoTag: row.auto_tag as string,
            audioQuality: row.audio_quality as string,
            audioLanguage: row.audio_language as string,
            createdAt: row.created_at as number,
            updatedAt: row.updated_at as number,
        };
    }
}
