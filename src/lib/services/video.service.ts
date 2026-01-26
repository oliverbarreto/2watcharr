import { Database } from 'sqlite';
import { VideoRepository, ChannelRepository, TagRepository } from '../repositories';
import { YouTubeMetadataService } from './youtube-metadata.service';
import {
    Video,
    UpdateVideoDto,
    VideoFilters,
    SortOptions,
    Priority,
} from '../domain/models';

export class VideoService {
    private videoRepo: VideoRepository;
    private channelRepo: ChannelRepository;
    private tagRepo: TagRepository;
    private metadataService: YouTubeMetadataService;

    constructor(db: Database) {
        this.videoRepo = new VideoRepository(db);
        this.channelRepo = new ChannelRepository(db);
        this.tagRepo = new TagRepository(db);
        this.metadataService = new YouTubeMetadataService();
    }

    /**
     * Add a video from a YouTube URL
     * @param url YouTube video URL
     * @param tagIds Optional array of tag IDs to associate with the video
     * @returns Promise resolving to the created video
     */
    async addVideoFromUrl(url: string, tagIds?: string[]): Promise<Video> {
        // Extract metadata using yt-dlp
        const metadata = await this.metadataService.extractMetadata(url);

        // Check if video already exists
        const existing = await this.videoRepo.findByYouTubeId(metadata.videoId);
        if (existing) {
            throw new Error('Video already exists in the database');
        }

        // Create or update channel
        let channel = await this.channelRepo.findById(metadata.channel.id);
        if (!channel) {
            channel = await this.channelRepo.create({
                id: metadata.channel.id,
                name: metadata.channel.name,
                description: metadata.channel.description,
                thumbnailUrl: metadata.channel.thumbnailUrl,
                channelUrl: metadata.channel.url,
            });
        } else {
            // Update channel info if it exists
            channel = await this.channelRepo.update(metadata.channel.id, {
                name: metadata.channel.name,
                description: metadata.channel.description,
                thumbnailUrl: metadata.channel.thumbnailUrl,
                channelUrl: metadata.channel.url,
            });
        }

        // Create video
        const video = await this.videoRepo.create({
            youtubeId: metadata.videoId,
            title: metadata.title,
            description: metadata.description,
            duration: metadata.duration,
            thumbnailUrl: metadata.thumbnailUrl,
            videoUrl: metadata.videoUrl,
            uploadDate: metadata.uploadDate,
            publishedDate: metadata.publishedDate,
            channelId: channel.id,
        });

        // Associate tags if provided
        if (tagIds && tagIds.length > 0) {
            await this.videoRepo.addTags(video.id, tagIds);
        }

        return video;
    }

    /**
     * List videos with optional filters and sorting
     */
    async listVideos(
        filters?: VideoFilters,
        sort?: SortOptions
    ): Promise<Video[]> {
        return this.videoRepo.findAll(filters, sort);
    }

    /**
     * Get a video by ID
     */
    async getVideo(id: string): Promise<Video | null> {
        return this.videoRepo.findById(id);
    }

    /**
     * Update a video
     */
    async updateVideo(id: string, updates: UpdateVideoDto): Promise<Video> {
        return this.videoRepo.update(id, updates);
    }

    /**
     * Delete a video
     */
    async deleteVideo(id: string): Promise<void> {
        await this.videoRepo.delete(id);
    }

    /**
     * Toggle watched status
     */
    async toggleWatched(id: string): Promise<Video> {
        const video = await this.videoRepo.findById(id);
        if (!video) {
            throw new Error('Video not found');
        }
        return this.videoRepo.update(id, { watched: !video.watched });
    }

    /**
     * Toggle favorite status
     */
    async toggleFavorite(id: string): Promise<Video> {
        const video = await this.videoRepo.findById(id);
        if (!video) {
            throw new Error('Video not found');
        }
        return this.videoRepo.update(id, { favorite: !video.favorite });
    }

    /**
     * Set video priority
     */
    async setPriority(id: string, priority: Priority): Promise<Video> {
        return this.videoRepo.update(id, { priority });
    }

    /**
     * Reorder videos
     */
    async reorderVideos(videoIds: string[]): Promise<void> {
        return this.videoRepo.reorder(videoIds);
    }

    /**
     * Update video tags
     */
    async updateTags(id: string, tagIds: string[]): Promise<void> {
        // Remove existing tags
        await this.videoRepo.removeTags(id);

        // Add new tags
        if (tagIds.length > 0) {
            await this.videoRepo.addTags(id, tagIds);
        }
    }

    /**
     * Get tags for a video
     */
    async getVideoTags(id: string): Promise<string[]> {
        return this.videoRepo.getTags(id);
    }
}
