import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { VideoRepository } from './video.repository';
import { createTestDb } from '../test/test-db';
import { Database } from 'sqlite';
import { CreateVideoDto } from '../domain/models';

describe('VideoRepository Event Tracking', () => {
    let db: Database;
    let repository: VideoRepository;

    beforeEach(async () => {
        db = await createTestDb();
        repository = new VideoRepository(db);
    });

    afterEach(async () => {
        await db.close();
    });

    it('should record an event', async () => {
        const videoDto: CreateVideoDto = {
            youtubeId: 'test-id',
            title: 'Test Video',
            videoUrl: 'https://youtube.com/watch?v=test-id',
            channelId: 'channel-id'
        };
        
        // Setup: Create a channel first because of foreign key
        await db.run('INSERT INTO channels (id, name, channel_url) VALUES (?, ?, ?)', 
            ['channel-id', 'Test Channel', 'https://youtube.com/channel/id']);
            
        const video = await repository.create(videoDto);
        
        // This method doesn't exist yet, it should cause a TypeScript error if compiled,
        // but Vitest will try to run it and fail.
        await repository.addEvent(video.id, 'watched');
        
        const events = await db.all('SELECT * FROM video_events WHERE video_id = ?', video.id);
        expect(events).toHaveLength(1);
        expect(events[0].type).toBe('watched');
    });

    it('should retrieve latest event timestamps with the video', async () => {
        const videoDto: CreateVideoDto = {
            youtubeId: 'test-id-2',
            title: 'Test Video 2',
            videoUrl: 'https://youtube.com/watch?v=test-id-2',
            channelId: 'channel-id'
        };
        
        await db.run('INSERT OR IGNORE INTO channels (id, name, channel_url) VALUES (?, ?, ?)', 
            ['channel-id', 'Test Channel', 'https://youtube.com/channel/id']);
            
        const video = await repository.create(videoDto);
        
        // Record multiple events
        // @ts-ignore
        await repository.addEvent(video.id, 'added');
        // Wait a bit to ensure different timestamps if needed, 
        // but we can just check if they exist.
        await repository.addEvent(video.id, 'watched');
        
        const updatedVideo = await repository.findById(video.id);
        
        expect(updatedVideo).toBeDefined();
        expect(updatedVideo?.lastAddedAt).toBeGreaterThan(0);
        expect(updatedVideo?.lastWatchedAt).toBeGreaterThan(0);
        expect(updatedVideo?.lastFavoritedAt).toBeUndefined();
    });

    it('should sort videos by event dates', async () => {
        await db.run('INSERT OR IGNORE INTO channels (id, name, channel_url) VALUES (?, ?, ?)', 
            ['channel-id', 'Test Channel', 'https://youtube.com/channel/id']);

        const v1 = await repository.create({
            youtubeId: 'vid1',
            title: 'Video 1',
            videoUrl: 'url1',
            channelId: 'channel-id'
        });
        const v2 = await repository.create({
            youtubeId: 'vid2',
            title: 'Video 2',
            videoUrl: 'url2',
            channelId: 'channel-id'
        });

        // v2 watched later than v1
        await repository.addEvent(v1.id, 'watched');
        // Small delay to ensure sequence
        await new Promise(resolve => setTimeout(resolve, 1100)); 
        // @ts-ignore
        await repository.addEvent(v2.id, 'watched');

        // Sort by date_watched DESC
        const sorted = await repository.findAll({}, { field: 'date_watched', order: 'desc' });
        
        expect(sorted[0].id).toBe(v2.id);
        expect(sorted[1].id).toBe(v1.id);
    });
});
