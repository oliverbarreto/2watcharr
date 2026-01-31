import { exec } from 'child_process';
import { promisify } from 'util';
import { CreateEpisodeDto, CreateChannelDto } from '../domain/models';

const execAsync = promisify(exec);

export interface UnifiedMetadata {
    episode: Partial<CreateEpisodeDto>;
    channel: CreateChannelDto;
}

export class YouTubeMetadataService {
    /**
     * Extract metadata from a YouTube video URL using yt-dlp
     * @param url YouTube video URL
     * @returns Promise resolving to unified metadata
     */
    async extractMetadata(url: string): Promise<UnifiedMetadata> {
        // Use yt-dlp to extract JSON metadata without downloading
        const command = `yt-dlp --no-download --dump-json "${url}"`;

        try {
            const { stdout } = await execAsync(command);
            const rawData = JSON.parse(stdout);

            const channel: CreateChannelDto = {
                id: rawData.channel_id || rawData.uploader_id || '',
                type: 'video',
                name: rawData.channel || rawData.uploader || 'Unknown',
                url: rawData.channel_url || rawData.uploader_url || '',
                description: rawData.channel_description || '',
                thumbnailUrl: rawData.channel_thumbnail || '',
            };

            const episode: Partial<CreateEpisodeDto> = {
                type: 'video',
                externalId: rawData.id,
                title: rawData.title,
                description: rawData.description || '',
                duration: rawData.duration || 0,
                thumbnailUrl: rawData.thumbnail || '',
                url: url,
                uploadDate: this.formatDate(rawData.upload_date),
                publishedDate: this.formatDate(rawData.release_date || rawData.upload_date),
                viewCount: rawData.view_count || 0,
                channelId: channel.id,
            };

            return { episode, channel };
        } catch (error) {
            console.error('Failed to extract metadata:', error);
            throw new Error(`Failed to extract video metadata: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    /**
     * Extract metadata from a YouTube channel URL using yt-dlp
     * @param url YouTube channel URL
     * @returns Promise resolving to channel metadata
     */
    async extractChannelMetadata(url: string): Promise<Partial<CreateChannelDto>> {
        const command = `yt-dlp --no-download --dump-single-json --flat-playlist "${url}"`;

        try {
            const { stdout } = await execAsync(command);
            const rawData = JSON.parse(stdout);

            let thumbnailUrl = '';
            if (rawData.thumbnails && rawData.thumbnails.length > 0) {
                // Try to find a high quality thumbnail (avatar)
                interface Thumbnail { id?: string; width?: number; url: string; }
                const thumbnails = rawData.thumbnails as Thumbnail[];
                const avatar = thumbnails.find((t) => t.id === 'avatar_uncropped') ||
                    [...thumbnails].sort((a, b) => (b.width || 0) - (a.width || 0))[0];
                thumbnailUrl = avatar?.url || '';
            }

            return {
                id: rawData.id || '',
                type: 'video',
                name: rawData.title || rawData.channel || 'Unknown',
                url: rawData.channel_url || rawData.webpage_url || url,
                description: rawData.description || '',
                thumbnailUrl: thumbnailUrl,
            };
        } catch (error) {
            console.error('Failed to extract channel metadata:', error);
            return {};
        }
    }

    /**
     * Format date from yt-dlp format (YYYYMMDD) to ISO 8601
     */
    private formatDate(dateString: string | undefined): string {
        if (!dateString) return '';

        // yt-dlp returns dates in YYYYMMDD format
        if (dateString.length === 8) {
            const year = dateString.substring(0, 4);
            const month = dateString.substring(4, 6);
            const day = dateString.substring(6, 8);
            return `${year}-${month}-${day}`;
        }

        return dateString;
    }
}
