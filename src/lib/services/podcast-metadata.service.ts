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

        const channelDto: CreateChannelDto = {
            id: podcastId,
            type: 'podcast',
            name: itunesResult.collectionName || 'Unknown Podcast',
            description: itunesResult.primaryGenreName || '',
            thumbnailUrl: itunesResult.artworkUrl600 || '',
            url: itunesResult.collectionViewUrl || '',
        };

        // 2. If episode ID is provided, fetch episode from iTunes API
        let episodeDto: Partial<CreateEpisodeDto> | null = null;
        if (episodeId) {
            episodeDto = await this.fetchEpisodeFromItunes(podcastId, episodeId, channelDto);
        }

        // 3. Fallback to RSS feed if no episode ID or iTunes lookup failed
        if (!episodeDto) {
            const feed = await this.parser.parseURL(feedUrl);
            
            if (!feed.items || feed.items.length === 0) {
                throw new Error('No episodes found in the RSS feed');
            }

            const episode = feed.items[0]; // Use the latest episode

            episodeDto = {
                type: 'podcast',
                externalId: episode.guid || episode.link || Math.random().toString(),
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
        }

        return {
            episode: episodeDto,
            channel: channelDto,
        };
    }

    /**
     * Fetch episode metadata from iTunes API using episode ID
     * @param podcastId The podcast ID
     * @param episodeId The episode ID (trackId)
     * @param channelDto Channel metadata for fallback values
     * @returns Promise resolving to episode metadata or null if not found
     */
    private async fetchEpisodeFromItunes(
        podcastId: string,
        episodeId: string,
        channelDto: CreateChannelDto
    ): Promise<Partial<CreateEpisodeDto> | null> {
        try {
            // Query iTunes API for all episodes in the podcast
            const episodesUrl = `https://itunes.apple.com/lookup?id=${podcastId}&entity=podcastEpisode&limit=200`;
            const response = await fetch(episodesUrl);
            const data = await response.json();

            if (!data.results || data.results.length === 0) {
                return null;
            }

            // Find the specific episode by trackId
            const episodeIdNum = parseInt(episodeId, 10);
            const episode = data.results.find((item: any) => 
                item.wrapperType === 'podcastEpisode' && item.trackId === episodeIdNum
            );

            if (!episode) {
                return null;
            }

            // Map iTunes episode data to our episode DTO
            return {
                type: 'podcast',
                externalId: episode.episodeGuid || episode.trackId.toString(),
                title: episode.trackName || 'Untitled Episode',
                description: episode.description || episode.shortDescription || '',
                duration: Math.floor((episode.trackTimeMillis || 0) / 1000),
                thumbnailUrl: episode.artworkUrl600 || episode.artworkUrl160 || channelDto.thumbnailUrl,
                url: episode.trackViewUrl || episode.episodeUrl || '',
                uploadDate: episode.releaseDate ? episode.releaseDate.split('T')[0] : '',
                publishedDate: episode.releaseDate || '',
                viewCount: 0,
                channelId: channelDto.id,
            };
        } catch (error) {
            console.error('Failed to fetch episode from iTunes API:', error);
            return null;
        }
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
