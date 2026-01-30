import { YouTubeMetadataService, UnifiedMetadata } from './youtube-metadata.service';
import { PodcastMetadataService } from './podcast-metadata.service';
import { CreateChannelDto } from '../domain/models';

export class MetadataService {
    private youtubeService: YouTubeMetadataService;
    private podcastService: PodcastMetadataService;

    constructor() {
        this.youtubeService = new YouTubeMetadataService();
        this.podcastService = new PodcastMetadataService();
    }

    /**
     * Extract metadata from any supported URL (YouTube or Apple Podcasts)
     * @param url The media URL
     * @returns Promise resolving to unified metadata
     */
    async extractMetadata(url: string): Promise<UnifiedMetadata> {
        if (this.isYouTubeUrl(url)) {
            return this.youtubeService.extractMetadata(url);
        } else if (this.isPodcastUrl(url)) {
            return this.podcastService.extractMetadata(url);
        } else {
            throw new Error('Unsupported URL type. Please provide a YouTube or Apple Podcasts link.');
        }
    }

    /**
     * Extract channel metadata (only for YouTube currently)
     * @param url Channel URL
     * @returns Promise resolving to partial channel metadata
     */
    async extractChannelMetadata(url: string): Promise<Partial<CreateChannelDto>> {
        if (this.isYouTubeUrl(url)) {
            return this.youtubeService.extractChannelMetadata(url);
        }
        // Podcast channel metadata is already fetched during extractMetadata via iTunes API
        return {};
    }

    /**
     * Check if the URL is a YouTube URL
     */
    private isYouTubeUrl(url: string): boolean {
        return url.includes('youtube.com') || url.includes('youtu.be');
    }

    /**
     * Check if the URL is an Apple Podcasts URL
     */
    private isPodcastUrl(url: string): boolean {
        return url.includes('podcasts.apple.com');
    }
}
