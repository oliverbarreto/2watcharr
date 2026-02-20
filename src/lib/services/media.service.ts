import { Database } from 'sqlite';
import { EpisodeRepository, ChannelRepository, TagRepository } from '../repositories';
import { MetadataService } from './metadata.service';
import {
    MediaEpisode,
    UpdateEpisodeDto,
    EpisodeFilters,
    SortOptions,
    LikeStatus,
    Priority,
    MediaEventType,
    PaginationOptions,
} from '../domain/models';

export class MediaService {
    private episodeRepo: EpisodeRepository;
    private channelRepo: ChannelRepository;
    private tagRepo: TagRepository;
    private metadataService: MetadataService;

    constructor(db: Database, metadataService?: MetadataService) {
        this.episodeRepo = new EpisodeRepository(db);
        this.channelRepo = new ChannelRepository(db);
        this.tagRepo = new TagRepository(db);
        this.metadataService = metadataService || new MetadataService();
    }

    /**
     * Add a media episode from a URL (YouTube or Podcast)
     * @param url Media URL
     * @param userId User ID adding the episode
     * @param tagIds Optional array of tag IDs to associate with the episode
     * @returns Promise resolving to the created episode
     */
    async addEpisodeFromUrl(url: string, userId: string, tagIds?: string[]): Promise<MediaEpisode> {
        // Extract metadata
        const metadata = await this.metadataService.extractMetadata(url);

        if (!metadata.episode.externalId) {
            throw new Error('Could not extract external ID from metadata');
        }

        // Check if episode already exists
        const existing = await this.episodeRepo.findByExternalId(metadata.episode.externalId, userId);
        if (existing) {
            // If it already exists, we "add it back" by clearing the isDeleted flag
            // and marking it as unwatched, while also updating metadata
            const updated = await this.episodeRepo.update(existing.id, {
                isDeleted: false,
                watched: false,
                title: metadata.episode.title,
                description: metadata.episode.description,
                viewCount: metadata.episode.viewCount,
            });

            // Record 'restored' event
            await this.episodeRepo.addEvent(existing.id, 'restored', updated.title, updated.type);

            // Re-associate tags if provided
            if (tagIds && tagIds.length > 0) {
                await this.episodeRepo.removeTags(existing.id);
                await this.episodeRepo.addTags(existing.id, tagIds);

                // Update last used for tags
                const now = Math.floor(Date.now() / 1000);
                for (const tagId of tagIds) {
                    await this.tagRepo.updateLastUsed(tagId, now);
                }
            }

            // Move to beginning of the list
            await this.episodeRepo.moveToBeginning(existing.id);

            return updated;
        }

        // Create or update channel
        let channel = await this.channelRepo.findById(metadata.channel.id);

        // If channel exists but lacks description or thumnail, try to fetch it
        let channelMetadata = metadata.channel;
        if (channelMetadata.type === 'video' && (!channelMetadata.description || !channelMetadata.thumbnailUrl)) {
            const extraChannelMetadata = await this.metadataService.extractChannelMetadata(channelMetadata.url);
            channelMetadata = { ...channelMetadata, ...extraChannelMetadata };
        }

        if (!channel) {
            channel = await this.channelRepo.create(channelMetadata);
        } else {
            // Update channel info if it exists
            channel = await this.channelRepo.update(channelMetadata.id, {
                name: channelMetadata.name,
                description: channelMetadata.description,
                thumbnailUrl: channelMetadata.thumbnailUrl,
                url: channelMetadata.url,
            });
        }

        // Create episode
        const episode = await this.episodeRepo.create({
            type: metadata.episode.type || 'video',
            externalId: metadata.episode.externalId,
            title: metadata.episode.title || 'Unknown Title',
            description: metadata.episode.description,
            duration: metadata.episode.duration,
            thumbnailUrl: metadata.episode.thumbnailUrl,
            url: metadata.episode.url || url,
            uploadDate: metadata.episode.uploadDate,
            publishedDate: metadata.episode.publishedDate,
            viewCount: metadata.episode.viewCount,
            channelId: channel.id,
            isShort: metadata.episode.isShort,
            userId: userId,
        });

        // Record 'added' event
        await this.episodeRepo.addEvent(episode.id, 'added', episode.title, episode.type);

        // Associate tags if provided
        if (tagIds && tagIds.length > 0) {
            await this.episodeRepo.addTags(episode.id, tagIds);

            // Update last used for tags
            const now = Math.floor(Date.now() / 1000);
            for (const tagId of tagIds) {
                await this.tagRepo.updateLastUsed(tagId, now);
            }
        }

        return episode;
    }

    /**
     * List episodes with optional filters, sorting and pagination
     */
    async listEpisodes(
        filters?: EpisodeFilters,
        sort?: SortOptions,
        pagination?: PaginationOptions
    ): Promise<{ episodes: MediaEpisode[], total: number }> {
        const episodes = await this.episodeRepo.findAll(filters, sort, pagination);
        const total = await this.episodeRepo.countAll(filters);
        return { episodes, total };
    }

    /**
     * Get an episode by ID
     */
    async getEpisode(id: string): Promise<MediaEpisode | null> {
        return this.episodeRepo.findById(id);
    }

    /**
     * Update an episode
     */
    async updateEpisode(id: string, updates: UpdateEpisodeDto): Promise<MediaEpisode> {
        const episode = await this.episodeRepo.update(id, updates);
        
        if (updates.watchStatus !== undefined) {
             await this.episodeRepo.addEvent(id, updates.watchStatus as MediaEventType, episode.title, episode.type);
        } else if (updates.watched !== undefined) {
             await this.episodeRepo.addEvent(id, updates.watched ? 'watched' : 'unwatched', episode.title, episode.type);
        }

        if (updates.favorite !== undefined) {
             await this.episodeRepo.addEvent(id, updates.favorite ? 'favorited' : 'unfavorited', episode.title, episode.type);
        }

        if (updates.isDeleted === true) {
             await this.episodeRepo.addEvent(id, 'removed', episode.title, episode.type);
        } else if (updates.isDeleted === false) {
             await this.episodeRepo.addEvent(id, 'restored', episode.title, episode.type);
        }

        return episode;
    }

    /**
     * Delete an episode
     */
    async deleteEpisode(id: string): Promise<void> {
        const episode = await this.episodeRepo.findById(id);
        await this.episodeRepo.delete(id);
        if (episode) {
            await this.episodeRepo.addEvent(id, 'removed', episode.title, episode.type);
        }
    }

    /**
     * Permanently delete an episode (hard delete)
     */
    async hardDeleteEpisode(id: string): Promise<void> {
        await this.episodeRepo.hardDelete(id);
    }

    /**
     * Soft delete all episodes with a specific tag
     */
    async softDeleteEpisodesByTag(tagId: string, userId: string): Promise<void> {
        const episodes = await this.episodeRepo.findAll({ tagIds: [tagId], userId, isDeleted: false });
        
        for (const episode of episodes) {
            // Remove the specific tag
            const currentTagIds = await this.episodeRepo.getTags(episode.id);
            const remainingTagIds = currentTagIds.filter(id => id !== tagId);
            await this.episodeRepo.removeTags(episode.id);
            if (remainingTagIds.length > 0) {
                await this.episodeRepo.addTags(episode.id, remainingTagIds);
            }

            // Soft delete the episode
            await this.episodeRepo.delete(episode.id);
            
            // Record event
            await this.episodeRepo.addEvent(episode.id, 'removed', episode.title, episode.type);
        }
    }

    /**
     * Restore all soft-deleted episodes for a user
     */
    async restoreAllEpisodes(userId: string): Promise<void> {
        const episodes = await this.episodeRepo.findAll({ userId, isDeleted: true });
        await this.episodeRepo.bulkRestore(userId);
        
        for (const episode of episodes) {
            await this.episodeRepo.addEvent(episode.id, 'restored', episode.title, episode.type);
        }
    }

    /**
     * Permanently delete all soft-deleted episodes for a user
     */
    async hardDeleteAllEpisodes(userId: string): Promise<void> {
        await this.episodeRepo.bulkHardDelete(userId);
    }


    /**
     * Toggle watched status
     */
    async toggleWatched(id: string): Promise<MediaEpisode> {
        const episode = await this.episodeRepo.findById(id);
        if (!episode) {
            throw new Error('Episode not found');
        }
        const newWatched = !episode.watched;
        const updated = await this.episodeRepo.update(id, { 
            watched: newWatched,
            watchStatus: newWatched ? 'watched' : 'unwatched'
        });
        
        // Record event
        await this.episodeRepo.addEvent(id, newWatched ? 'watched' : 'unwatched', updated.title, updated.type);
        
        return updated;
    }

    /**
     * Set watch status
     */
    async setWatchStatus(id: string, status: 'unwatched' | 'pending' | 'watched'): Promise<MediaEpisode> {
        const updated = await this.episodeRepo.update(id, { watchStatus: status });
        
        // Record event
        if (status === 'watched') {
            await this.episodeRepo.addEvent(id, 'watched', updated.title, updated.type);
        } else if (status === 'pending') {
            await this.episodeRepo.addEvent(id, 'pending', updated.title, updated.type);
        } else {
            await this.episodeRepo.addEvent(id, 'unwatched', updated.title, updated.type);
        }
        
        return updated;
    }

    /**
     * Toggle favorite status
     */
    async toggleFavorite(id: string): Promise<MediaEpisode> {
        const episode = await this.episodeRepo.findById(id);
        if (!episode) {
            throw new Error('Episode not found');
        }
        const newFavorite = !episode.favorite;
        const updated = await this.episodeRepo.update(id, { favorite: newFavorite });
        
        // Record event
        await this.episodeRepo.addEvent(id, newFavorite ? 'favorited' : 'unfavorited', updated.title, updated.type);
        
        return updated;
    }

    /**
     * Toggle like status
     */
    async toggleLikeStatus(id: string, status: LikeStatus): Promise<MediaEpisode> {
        const episode = await this.episodeRepo.findById(id);
        if (!episode) {
            throw new Error('Episode not found');
        }
        
        // If clicking the same status, reset to 'none'
        const newStatus = episode.likeStatus === status ? 'none' : status;
        const updated = await this.episodeRepo.update(id, { likeStatus: newStatus });
        
        return updated;
    }

    /**
     * Set episode priority
     */
    async setPriority(id: string, priority: Priority): Promise<MediaEpisode> {
        return this.episodeRepo.update(id, { priority });
    }

    /**
     * Reorder episodes
     */
    async reorderEpisodes(episodeIds: string[]): Promise<void> {
        return this.episodeRepo.reorder(episodeIds);
    }

    /**
     * Move episode to the beginning
     */
    async moveToBeginning(id: string): Promise<void> {
        return this.episodeRepo.moveToBeginning(id);
    }

    /**
     * Move episode to the end
     */
    async moveToEnd(id: string): Promise<void> {
        return this.episodeRepo.moveToEnd(id);
    }

    /**
     * Update episode tags
     */
    async updateTags(id: string, tagIds: string[]): Promise<void> {
        // Remove existing tags
        await this.episodeRepo.removeTags(id);

        // Add new tags
        if (tagIds.length > 0) {
            await this.episodeRepo.addTags(id, tagIds);
            
            // Update last used for tags
            const now = Math.floor(Date.now() / 1000);
            for (const tagId of tagIds) {
                await this.tagRepo.updateLastUsed(tagId, now);
            }

            const episode = await this.episodeRepo.findById(id);
            if (episode) {
                // Record 'tagged' event
                await this.episodeRepo.addEvent(id, 'tagged', episode.title, episode.type);
            }
        }
    }

    /**
     * Get tags for an episode
     */
    async getEpisodeTags(id: string): Promise<string[]> {
        return this.episodeRepo.getTags(id);
    }

    /**
     * Sync metadata for all channels
     */
    async syncAllChannelsMetadata(): Promise<{ total: number; synced: number }> {
        const channels = await this.channelRepo.findAll();
        let synced = 0;

        for (const channel of channels) {
            try {
                // Only sync video (YouTube) channels for now as podcast metadata might be harder to sync individually without an episode
                if (channel.type === 'video' && channel.url) {
                    const success = await this.syncChannelMetadata(channel.id, channel.url);
                    if (success) synced++;
                }
            } catch (error) {
                console.error(`Failed to sync channel ${channel.id}:`, error);
            }
        }

        return { total: channels.length, synced };
    }

    /**
     * Sync metadata for a single channel
     */
    async syncChannelMetadata(id: string, url: string): Promise<boolean> {
        const metadata = await this.metadataService.extractChannelMetadata(url);
        if (metadata.name) {
            await this.channelRepo.update(id, {
                name: metadata.name,
                description: metadata.description,
                thumbnailUrl: metadata.thumbnailUrl,
                url: metadata.url,
            });
            return true;
        }
        return false;
    }
}
