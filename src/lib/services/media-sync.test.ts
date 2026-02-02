import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { MediaService } from './media.service';
import { createTestDb } from '../test/test-db';
import { Database } from 'sqlite';
import { ChannelRepository } from '../repositories/channel.repository';
import { MetadataService } from './metadata.service';

describe('MediaService Channel Sync', () => {
    let db: Database;
    let service: MediaService;
    let channelRepo: ChannelRepository;
    let mockMetadataService: MetadataService;

    beforeEach(async () => {
        db = await createTestDb();
        channelRepo = new ChannelRepository(db);
        
        mockMetadataService = {
            extractChannelMetadata: vi.fn().mockImplementation(async (url: string) => {
                if (url === 'https://youtube.com/channel/error') {
                    throw new Error('Simulation of yt-dlp error');
                }
                if (url === 'https://youtube.com/channel/empty') {
                    return {};
                }
                return {
                    id: 'channel-1',
                    name: 'Updated Channel Name',
                    description: 'Updated Description',
                    thumbnailUrl: 'https://example.com/thumb.jpg',
                    url: url
                };
            })
        } as unknown as MetadataService;

        service = new MediaService(db, mockMetadataService);
    });

    afterEach(async () => {
        await db.close();
        vi.restoreAllMocks();
    });

    it('should sync metadata for video channels', async () => {
        await db.run('INSERT INTO channels (id, type, name, url) VALUES (?, ?, ?, ?)', 
            ['channel-1', 'video', 'Old Name', 'https://youtube.com/channel/1']);

        const result = await service.syncAllChannelsMetadata();
        
        expect(result.total).toBe(1);
        expect(result.synced).toBe(1);

        const updated = await channelRepo.findById('channel-1');
        expect(updated?.name).toBe('Updated Channel Name');
        expect(updated?.description).toBe('Updated Description');
        expect(updated?.thumbnailUrl).toBe('https://example.com/thumb.jpg');
    });

    it('should skip podcast channels', async () => {
        await db.run('INSERT INTO channels (id, type, name, url) VALUES (?, ?, ?, ?)', 
            ['podcast-1', 'podcast', 'Podcast Name', 'https://podcasts.apple.com/1']);

        const result = await service.syncAllChannelsMetadata();
        
        expect(result.total).toBe(1);
        expect(result.synced).toBe(0);
    });

    it('should handling missing metadata gracefully', async () => {
        await db.run('INSERT INTO channels (id, type, name, url) VALUES (?, ?, ?, ?)', 
            ['channel-empty', 'video', 'Empty Name', 'https://youtube.com/channel/empty']);

        const result = await service.syncAllChannelsMetadata();
        
        expect(result.total).toBe(1);
        expect(result.synced).toBe(0);
    });

    it('should handle errors in individual channels and continue', async () => {
        await db.run('INSERT INTO channels (id, type, name, url) VALUES (?, ?, ?, ?)', 
            ['channel-1', 'video', 'Old Name', 'https://youtube.com/channel/1']);
        await db.run('INSERT INTO channels (id, type, name, url) VALUES (?, ?, ?, ?)', 
            ['channel-error', 'video', 'Error Name', 'https://youtube.com/channel/error']);

        const result = await service.syncAllChannelsMetadata();
        
        expect(result.total).toBe(2);
        expect(result.synced).toBe(1);
    });
});
