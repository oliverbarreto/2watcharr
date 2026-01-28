import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { VideoService } from './video.service';
import { createTestDb } from '../test/test-db';
import { Database } from 'sqlite';
import { VideoRepository } from '../repositories/video.repository';

describe('VideoService Event Tracking', () => {
    let db: Database;
    let service: VideoService;
    let repository: VideoRepository;

    beforeEach(async () => {
        db = await createTestDb();
        service = new VideoService(db);
        repository = new VideoRepository(db);
        
        // Setup a channel for tests
        await db.run('INSERT INTO channels (id, name, channel_url) VALUES (?, ?, ?)', 
            ['channel-id', 'Test Channel', 'https://youtube.com/channel/id']);
    });

    afterEach(async () => {
        await db.close();
    });

    it('should record "watched" event when toggleWatched is called', async () => {
        const video = await repository.create({
            youtubeId: 'vid1',
            title: 'Test Video',
            videoUrl: 'url1',
            channelId: 'channel-id'
        });

        await service.toggleWatched(video.id);
        
        const events = await db.all('SELECT * FROM video_events WHERE video_id = ? AND type = ?', [video.id, 'watched']);
        expect(events).toHaveLength(1);
    });

    it('should record "unwatched" event when toggleWatched is called to unwatch', async () => {
        const video = await repository.create({
            youtubeId: 'vid1',
            title: 'Test Video',
            videoUrl: 'url1',
            channelId: 'channel-id'
        });

        // First watch
        await service.toggleWatched(video.id);
        // Then unwatch
        await service.toggleWatched(video.id);
        
        const unwatchedEvents = await db.all('SELECT * FROM video_events WHERE video_id = ? AND type = ?', [video.id, 'unwatched']);
        expect(unwatchedEvents).toHaveLength(1);
    });

    it('should record "favorited" event when toggleFavorite is called', async () => {
        const video = await repository.create({
            youtubeId: 'vid1',
            title: 'Test Video',
            videoUrl: 'url1',
            channelId: 'channel-id'
        });

        await service.toggleFavorite(video.id);
        
        const events = await db.all('SELECT * FROM video_events WHERE video_id = ? AND type = ?', [video.id, 'favorited']);
        expect(events).toHaveLength(1);
    });

    it('should record "removed" event when deleteVideo is called', async () => {
        const video = await repository.create({
            youtubeId: 'vid1',
            title: 'Test Video',
            videoUrl: 'url1',
            channelId: 'channel-id'
        });

        await service.deleteVideo(video.id);
        
        const events = await db.all('SELECT * FROM video_events WHERE video_id = ? AND type = ?', [video.id, 'removed']);
        expect(events).toHaveLength(1);
    });
});
