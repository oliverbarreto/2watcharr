import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { MediaService } from './media.service';
import { createTestDb } from '../test/test-db';
import { Database } from 'sqlite';
import { MetadataService } from './metadata.service';

describe('MediaService Batch Addition', () => {
    let db: Database;
    let service: MediaService;
    let metadataService: MetadataService;

    beforeEach(async () => {
        db = await createTestDb();
        metadataService = new MetadataService();
        service = new MediaService(db, metadataService);
        
        // Insert test user
        await db.run('INSERT INTO users (id, username, password) VALUES (?, ?, ?)', 
            ['user1', 'user1', 'pass']);
            
        // Mock extractMetadata to support our tests
        vi.spyOn(metadataService, 'extractMetadata').mockImplementation(async (url: string) => {
            if (url.includes('v1')) {
                return {
                    episode: {
                        externalId: 'ext1',
                        title: 'Video 1',
                        type: 'video',
                        url: url,
                        duration: 100,
                    },
                    channel: {
                        id: 'chan1',
                        name: 'Channel 1',
                        url: 'https://youtube.com/chan1',
                        type: 'video'
                    }
                };
            }
            if (url.includes('v2')) {
                return {
                    episode: {
                        externalId: 'ext2',
                        title: 'Video 2',
                        type: 'video',
                        url: url,
                        duration: 200,
                    },
                    channel: {
                        id: 'chan2',
                        name: 'Channel 2',
                        url: 'https://youtube.com/chan2',
                        type: 'video'
                    }
                };
            }
            throw new Error('Video not found');
        });

        // Mock extractChannelMetadata
        vi.spyOn(metadataService, 'extractChannelMetadata').mockImplementation(async () => ({}));
    });

    afterEach(async () => {
        await db.close();
        vi.restoreAllMocks();
    });

    it('should add multiple videos successfully', async () => {
        const videos = [
            { url: 'https://www.youtube.com/watch?v=v1', tag: 'Tag1' },
            { url: 'https://www.youtube.com/watch?v=v2', tag: 'Tag1' }
        ];

        const results = await service.addVideosBatch(videos, 'user1');

        expect(results).toHaveLength(2);
        expect(results[0].status).toBe('OK');
        expect(results[1].status).toBe('OK');

        // Verify episodes were created
        const episodes = await db.all('SELECT * FROM episodes WHERE user_id = ?', ['user1']);
        expect(episodes).toHaveLength(2);
        expect(episodes.map(e => e.external_id)).toContain('ext1');
        expect(episodes.map(e => e.external_id)).toContain('ext2');

        // Verify tag was created and associated
        const tags = await db.all('SELECT * FROM tags WHERE user_id = ?', ['user1']);
        expect(tags).toHaveLength(1);
        expect(tags[0].name).toBe('Tag1');

        const episodeTags = await db.all('SELECT * FROM episode_tags');
        expect(episodeTags).toHaveLength(2);
    });

    it('should handle invalid URLs by reporting NOK', async () => {
        const videos = [
            { url: 'https://www.youtube.com/watch?v=v1' },
            { url: 'https://google.com' } // Invalid
        ];

        const results = await service.addVideosBatch(videos, 'user1');

        expect(results).toHaveLength(2);
        expect(results[0].status).toBe('OK');
        expect(results[1].status).toBe('NOK');
        expect(results[1].reason).toContain('Only YouTube');
    });

    it('should reject channel URLs', async () => {
        const videos = [
            { url: 'https://www.youtube.com/channel/UC123' }
        ];

        const results = await service.addVideosBatch(videos, 'user1');

        expect(results).toHaveLength(1);
        expect(results[0].status).toBe('NOK');
        expect(results[0].reason).toContain('Channel URLs are not supported');
    });

    it('should handle extraction errors gracefully', async () => {
        const videos = [
            { url: 'https://www.youtube.com/watch?v=missing' }
        ];

        const results = await service.addVideosBatch(videos, 'user1');

        expect(results).toHaveLength(1);
        expect(results[0].status).toBe('NOK');
        expect(results[0].reason).toBe('Video not found');
    });
});
