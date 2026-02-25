import { Database } from 'sqlite';
import { EpisodeRepository, ChannelRepository, TagRepository } from '../repositories';
import { MetadataService } from './metadata.service';
import { UnifiedMetadata } from './youtube-metadata.service';
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
        return this.saveEpisodeFromMetadata(metadata, userId, tagIds);
    }

    /**
     * Save an episode to the database from extracted metadata.
     * This logic is shared between single additions and batch additions.
     */
    private async saveEpisodeFromMetadata(metadata: UnifiedMetadata, userId: string, tagIds?: string[]): Promise<MediaEpisode> {
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
            await this.episodeRepo.moveToBeginning(existing.id, userId);

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
            url: metadata.episode.url || metadata.episode.externalId,
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

        // Move to beginning of the list for new episodes
        await this.episodeRepo.moveToBeginning(episode.id, userId);

        return episode;
    }

    /**
     * List episodes with optional filters, sorting and pagination
     */
    async listEpisodes(
        filters?: EpisodeFilters,
        sort?: SortOptions,
        pagination?: PaginationOptions
    ): Promise<{ episodes: MediaEpisode[], total: number, totalDuration: number }> {
        const episodes = await this.episodeRepo.findAll(filters, sort, pagination);
        const { count: total, totalDuration } = await this.episodeRepo.getFilterStats(filters);
        return { episodes, total, totalDuration };
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

        if (updates.priority !== undefined) {
             const priorityEvent = updates.priority === 'high' ? 'priority_high' : 
                                  updates.priority === 'none' ? 'priority_normal' : 
                                  `priority_${updates.priority}` as MediaEventType;
             await this.episodeRepo.addEvent(id, priorityEvent, episode.title, episode.type);
             
             if (updates.priority === 'high') {
                 await this.episodeRepo.moveToBeginning(id, episode.userId);
             }
        }

        if (updates.likeStatus !== undefined) {
             const likeEvent = updates.likeStatus === 'like' ? 'liked' : 
                              updates.likeStatus === 'dislike' ? 'disliked' : 'like_reset';
             await this.episodeRepo.addEvent(id, likeEvent, episode.title, episode.type);
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
        
        // Record event
        const likeEvent = newStatus === 'like' ? 'liked' : 
                         newStatus === 'dislike' ? 'disliked' : 'like_reset';
        await this.episodeRepo.addEvent(id, likeEvent, updated.title, updated.type);
        
        return updated;
    }

    /**
     * Set episode priority
     */
    async setPriority(id: string, priority: Priority): Promise<MediaEpisode> {
        const episode = await this.episodeRepo.update(id, { priority });
        
        // Record event
        const priorityEvent = priority === 'high' ? 'priority_high' : 
                             priority === 'none' ? 'priority_normal' : 
                             `priority_${priority}` as MediaEventType;
        await this.episodeRepo.addEvent(id, priorityEvent, episode.title, episode.type);

        if (priority === 'high') {
            await this.episodeRepo.moveToBeginning(id, episode.userId);
        }
        return episode;
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
    async moveToBeginning(id: string, userId: string): Promise<void> {
        return this.episodeRepo.moveToBeginning(id, userId);
    }

    /**
     * Move episode to the end
     */
    async moveToEnd(id: string, userId: string): Promise<void> {
        return this.episodeRepo.moveToEnd(id, userId);
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

    /**
     * Add multiple videos in batch
     * @param videos List of videos (url and optional tag)
     * @param userId User ID adding the videos
     * @returns Promise resolving to list of results per URL
     */
    async addVideosBatch(
        videos: { url: string; tag?: string }[],
        userId: string
    ): Promise<{ url: string; status: 'OK' | 'NOK'; reason?: string }[]> {
        // Collect all unique tags and ensure they exist beforehand
        const uniqueTags = Array.from(new Set(videos.map(v => v.tag).filter((tag): tag is string => !!tag)));
        const tagMap = new Map<string, string>();

        for (const tagName of uniqueTags) {
            let tagEntity = await this.tagRepo.findByName(tagName, userId);
            if (!tagEntity) {
                tagEntity = await this.tagRepo.create({ name: tagName, userId });
            }
            tagMap.set(tagName, tagEntity.id);
        }

        const results: { url: string; status: 'OK' | 'NOK'; reason?: string }[] = [];
        
        // Process in chunks of 5 for metadata extraction to avoid overloading the system
        const CHUNK_SIZE = 5;
        for (let i = 0; i < videos.length; i += CHUNK_SIZE) {
            const chunk = videos.slice(i, i + CHUNK_SIZE);
            
            // 1. Parallel metadata extraction for the chunk
            const metadataPromises = chunk.map(async (v) => {
                try {
                    // Check if is a YouTube URL at all
                    const isYouTube = v.url.includes('youtube.com') || v.url.includes('youtu.be');
                    if (!isYouTube) {
                        return { v, status: 'NOK' as const, reason: 'Only YouTube URLs are supported' };
                    }

                    // Basic check to reject channel URLs
                    if (this.isYouTubeChannelUrl(v.url)) {
                        return { v, status: 'NOK' as const, reason: 'Channel URLs are not supported on this endpoint' };
                    }

                    // Validate if it is specifically a video or short URL
                    if (!this.isYouTubeVideoUrl(v.url)) {
                        return { v, status: 'NOK' as const, reason: 'Only YouTube video/short URLs are supported' };
                    }

                    const metadata = await this.metadataService.extractMetadata(v.url);
                    return { v, metadata, status: 'OK' as const };
                } catch (error) {
                    return { 
                        v, 
                        status: 'NOK' as const, 
                        reason: error instanceof Error ? error.message : 'Unknown error' 
                    };
                }
            });

            const chunkMetadataResults = await Promise.all(metadataPromises);

            // 2. Sequential persistence to avoid database transaction collisions
            for (const res of chunkMetadataResults) {
                if (res.status === 'OK' && res.metadata) {
                    try {
                        let tagIds: string[] | undefined;
                        if (res.v.tag && tagMap.has(res.v.tag)) {
                            tagIds = [tagMap.get(res.v.tag)!];
                        }
                        
                        await this.saveEpisodeFromMetadata(res.metadata, userId, tagIds);
                        results.push({ url: res.v.url, status: 'OK' });
                    } catch (error) {
                        console.error(`Error saving video ${res.v.url}:`, error);
                        results.push({
                            url: res.v.url,
                            status: 'NOK',
                            reason: error instanceof Error ? error.message : 'Failed to save to database',
                        });
                    }
                } else {
                    results.push({ url: res.v.url, status: 'NOK', reason: res.reason });
                }
            }
        }

        return results;
    }

    /**
     * Check if the URL is a YouTube video or short URL
     */
    private isYouTubeVideoUrl(url: string): boolean {
        return (url.includes('youtube.com') || url.includes('youtu.be')) && 
               (url.includes('/watch') || url.includes('/shorts/') || url.includes('youtu.be/'));
    }

    /**
     * Check if the URL is a YouTube channel URL
     */
    private isYouTubeChannelUrl(url: string): boolean {
        return url.includes('/channel/') || 
               url.includes('/c/') || 
               (url.includes('/@') && !url.includes('/watch') && !url.includes('/shorts/'));
    }
}
