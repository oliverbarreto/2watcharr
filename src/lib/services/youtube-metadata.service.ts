import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export interface YouTubeMetadata {
    videoId: string;
    title: string;
    description: string;
    duration: number;
    thumbnailUrl: string;
    videoUrl: string;
    uploadDate: string;
    publishedDate: string;
    channel: {
        id: string;
        name: string;
        url: string;
        description: string;
        thumbnailUrl: string;
    };
}

export class YouTubeMetadataService {
    /**
     * Extract metadata from a YouTube video URL using yt-dlp
     * @param url YouTube video URL
     * @returns Promise resolving to video metadata
     */
    async extractMetadata(url: string): Promise<YouTubeMetadata> {
        // Use yt-dlp to extract JSON metadata without downloading
        const command = `yt-dlp --no-download --dump-json "${url}"`;

        try {
            const { stdout } = await execAsync(command);
            const rawData = JSON.parse(stdout);

            return {
                videoId: rawData.id,
                title: rawData.title,
                description: rawData.description || '',
                duration: rawData.duration || 0,
                thumbnailUrl: rawData.thumbnail || '',
                videoUrl: url,
                uploadDate: this.formatDate(rawData.upload_date),
                publishedDate: this.formatDate(rawData.release_date || rawData.upload_date),
                channel: {
                    id: rawData.channel_id || rawData.uploader_id || '',
                    name: rawData.channel || rawData.uploader || 'Unknown',
                    url: rawData.channel_url || rawData.uploader_url || '',
                    description: rawData.channel_description || '',
                    thumbnailUrl: rawData.channel_thumbnail || '',
                },
            };
        } catch (error) {
            console.error('Failed to extract metadata:', error);
            throw new Error(`Failed to extract video metadata: ${error instanceof Error ? error.message : 'Unknown error'}`);
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
