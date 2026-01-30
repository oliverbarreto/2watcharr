import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { MediaService } from './media.service';
import { createTestDb } from '../test/test-db';
import { Database } from 'sqlite';
import { EpisodeRepository } from '../repositories/episode.repository';

describe('MediaService Event Tracking', () => {
    let db: Database;
    let service: MediaService;
    let repository: EpisodeRepository;

    beforeEach(async () => {
        db = await createTestDb();
        service = new MediaService(db);
        repository = new EpisodeRepository(db);
        
        // Setup a channel for tests
        await db.run('INSERT INTO channels (id, name, url) VALUES (?, ?, ?)', 
            ['channel-id', 'Test Channel', 'https://youtube.com/channel/id']);
    });

    afterEach(async () => {
        await db.close();
    });

    it('should record "watched" event when toggleWatched is called', async () => {
        const episode = await repository.create({
            type: 'video',
            externalId: 'vid1',
            title: 'Test Episode',
            url: 'url1',
            channelId: 'channel-id'
        });

        await service.toggleWatched(episode.id);
        
        const events = await db.all('SELECT * FROM media_events WHERE episode_id = ? AND type = ?', [episode.id, 'watched']);
        expect(events).toHaveLength(1);
    });

    it('should record "unwatched" event when toggleWatched is called to unwatch', async () => {
        const episode = await repository.create({
            type: 'video',
            externalId: 'vid1',
            title: 'Test Episode',
            url: 'url1',
            channelId: 'channel-id'
        });

        // First watch
        await service.toggleWatched(episode.id);
        // Then unwatch
        await service.toggleWatched(episode.id);
        
        const unwatchedEvents = await db.all('SELECT * FROM media_events WHERE episode_id = ? AND type = ?', [episode.id, 'unwatched']);
        expect(unwatchedEvents).toHaveLength(1);
    });

    it('should record "favorited" event when toggleFavorite is called', async () => {
        const episode = await repository.create({
            type: 'video',
            externalId: 'vid1',
            title: 'Test Episode',
            url: 'url1',
            channelId: 'channel-id'
        });

        await service.toggleFavorite(episode.id);
        
        const events = await db.all('SELECT * FROM media_events WHERE episode_id = ? AND type = ?', [episode.id, 'favorited']);
        expect(events).toHaveLength(1);
    });

    it('should record "removed" event when deleteEpisode is called', async () => {
        const episode = await repository.create({
            type: 'video',
            externalId: 'vid1',
            title: 'Test Episode',
            url: 'url1',
            channelId: 'channel-id'
        });

        await service.deleteEpisode(episode.id);
        
        const events = await db.all('SELECT * FROM media_events WHERE episode_id = ? AND type = ?', [episode.id, 'removed']);
        expect(events).toHaveLength(1);
    });
});
