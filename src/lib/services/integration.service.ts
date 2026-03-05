import { Database } from 'sqlite';
import { LabcastARRIntegrationRepository } from '../repositories/labcastarr-integration.repository';
import { TagRepository } from '../repositories/tag.repository';
import {
    LabcastARRIntegration,
    CreateLabcastARRIntegrationDto,
    UpdateLabcastARRIntegrationDto,
    Tag,
} from '../domain/models';
import { LabcastARRClient } from '../integrations/labcastarr.client';

export class IntegrationService {
    private integrationRepo: LabcastARRIntegrationRepository;
    private tagRepo: TagRepository;

    constructor(private db: Database) {
        this.integrationRepo = new LabcastARRIntegrationRepository(db);
        this.tagRepo = new TagRepository(db);
    }

    /**
     * Get user integrations
     */
    async getIntegrations(userId: string): Promise<LabcastARRIntegration[]> {
        return this.integrationRepo.findByUserId(userId);
    }

    /**
     * Create a new LabcastARR integration
     */
    async createIntegration(dto: CreateLabcastARRIntegrationDto): Promise<LabcastARRIntegration> {
        return this.integrationRepo.create(dto);
    }

    /**
     * Update an integration
     */
    async updateIntegration(id: string, dto: UpdateLabcastARRIntegrationDto): Promise<LabcastARRIntegration> {
        return this.integrationRepo.update(id, dto);
    }

    /**
     * Delete an integration
     */
    async deleteIntegration(id: string): Promise<void> {
        return this.integrationRepo.delete(id);
    }

    /**
     * Test a connection (without needing to save it first)
     */
    async testConnection(config: LabcastARRIntegration): Promise<boolean> {
        const client = new LabcastARRClient(config);
        return await client.testConnection();
    }

    /**
     * Handle automated episode sending based on tags
     */
    async processEpisodeTags(episodeId: string, userId: string, tagIds: string[], videoUrl: string): Promise<void> {
        // Validation: only YouTube URLs for now
        if (!videoUrl || !(videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be'))) {
            return;
        }

        // Get all tags for their names
        const tags = await this.tagRepo.findByIds(tagIds);
        const tagNames = tags.map((t: Tag) => t.name);

        // Get all active integrations for this user
        const integrations = await this.integrationRepo.findActiveByUserId(userId);

        for (const integration of integrations) {
            if (tagNames.includes(integration.autoTag)) {
                try {
                    await this.sendToLabcastARR(integration, videoUrl);
                    console.log(`Auto-sent episode ${episodeId} to LabcastARR channel ${integration.channelId}`);
                } catch (error) {
                    console.error(`Error auto-sending episode ${episodeId} to LabcastARR:`, error);
                }
            }
        }
    }

    /**
     * Send a video to LabcastARR
     */
    async sendById(integrationId: string, videoUrl: string): Promise<void> {
        const integration = await this.integrationRepo.findById(integrationId);
        if (!integration || !integration.enabled) {
            throw new Error('Integration not found or disabled');
        }
        await this.sendToLabcastARR(integration, videoUrl);
    }

    private async sendToLabcastARR(integration: LabcastARRIntegration, videoUrl: string): Promise<void> {
        const client = new LabcastARRClient(integration);
        await client.createEpisode({
            channel_id: parseInt(integration.channelId, 10),
            video_url: videoUrl,
            tags: ['2WatchARR'], // As per user requirement
            audio_quality: integration.audioQuality === 'default' ? undefined : integration.audioQuality,
            audio_language: integration.audioLanguage === 'default' ? undefined : integration.audioLanguage,
        });
    }
}
