import Parser from 'rss-parser';
import { CreateEpisodeDto, CreateChannelDto } from '../domain/models';

export interface PodcastMetadata {
    episode: Partial<CreateEpisodeDto>;
    channel: CreateChannelDto;
}

export class PodcastMetadataService {
    private parser: Parser;

    constructor() {
        this.parser = new Parser();
    }

    /**
     * Extract metadata from an Apple Podcasts URL
     * @param url Apple Podcasts URL
     * @returns Promise resolving to podcast metadata
     */
    async extractMetadata(url: string): Promise<PodcastMetadata> {
        const podcastId = this.extractId(url);
        const episodeId = this.extractEpisodeId(url);

        if (!podcastId) {
            throw new Error('Invalid Apple Podcasts URL: Could not find podcast ID');
        }

        // 1. Fetch channel metadata from iTunes API
        const itunesUrl = `https://itunes.apple.com/lookup?id=${podcastId}&entity=podcast`;
        const response = await fetch(itunesUrl);
        const data = await response.json();

        if (!data.results || data.results.length === 0) {
            throw new Error(`Podcast not found in iTunes: ${podcastId}`);
        }

        const itunesResult = data.results[0];
        const feedUrl = itunesResult.feedUrl;

        if (!feedUrl) {
            throw new Error('Could not find RSS feed URL for this podcast');
        }

        // 2. Fetch and parse the RSS feed
        const feed = await this.parser.parseURL(feedUrl);

        // 3. Find the specific episode
        // If episodeId is provided, look for it. Otherwise, take the latest one?
        // Actually, normally we want the specific one.
        let episode = null;
        if (episodeId) {
            // Apple's episode ID 'i' can be the GUID or sometimes it's different.
            // We search for it in guid, or as a substring in the link/enclosure.
            episode = feed.items.find(item => 
                item.guid === episodeId || 
                item.link?.includes(episodeId) || 
                item.enclosure?.url?.includes(episodeId)
            );
        }

        // Fallback to the latest episode if not found or no episodeId
        if (!episode && feed.items.length > 0) {
            episode = feed.items[0];
        }

        if (!episode) {
            throw new Error('No episodes found in the RSS feed');
        }

        const channelDto: CreateChannelDto = {
            id: podcastId,
            type: 'podcast',
            name: itunesResult.collectionName || feed.title || 'Unknown Podcast',
            description: feed.description || itunesResult.primaryGenreName || '',
            thumbnailUrl: itunesResult.artworkUrl600 || feed.image?.url || '',
            url: itunesResult.collectionViewUrl || feed.link || '',
        };

        const episodeDto: Partial<CreateEpisodeDto> = {
            type: 'podcast',
            externalId: episode.guid || episodeId || episode.link || Math.random().toString(),
            title: episode.title || 'Untitled Episode',
            description: episode.contentSnippet || episode.content || '',
            duration: this.parseDuration(episode.itunes?.duration),
            thumbnailUrl: episode.itunes?.image || channelDto.thumbnailUrl,
            url: episode.link || url,
            uploadDate: episode.isoDate ? episode.isoDate.split('T')[0] : '',
            publishedDate: episode.isoDate || '',
            viewCount: 0,
            channelId: channelDto.id,
        };

        return {
            episode: episodeDto,
            channel: channelDto,
        };
    }

    /**
     * Extract podcast ID from Apple Podcasts URL
     */
    private extractId(url: string): string | null {
        const match = url.match(/\/id(\d+)/);
        return match ? match[1] : null;
    }

    /**
     * Extract episode ID from Apple Podcasts URL
     */
    private extractEpisodeId(url: string): string | null {
        const urlObj = new URL(url);
        return urlObj.searchParams.get('i');
    }

    /**
     * Parse iTunes duration (HH:MM:SS or seconds) to seconds
     */
    private parseDuration(duration: string | undefined): number {
        if (!duration) return 0;
        if (!isNaN(Number(duration))) return Number(duration);

        const parts = duration.split(':').map(Number);
        if (parts.length === 3) {
            return parts[0] * 3600 + parts[1] * 60 + parts[2];
        } else if (parts.length === 2) {
            return parts[0] * 60 + parts[1];
        }
        return 0;
    }
}
