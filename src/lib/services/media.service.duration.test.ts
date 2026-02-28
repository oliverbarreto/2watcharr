import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { MediaService } from './media.service';
import { createTestDb } from '../test/test-db';
import { Database } from 'sqlite';
import { EpisodeRepository } from '../repositories/episode.repository';

describe('MediaService Duration Sum', () => {
    let db: Database;
    let service: MediaService;
    let repository: EpisodeRepository;

    beforeEach(async () => {
        db = await createTestDb();
        service = new MediaService(db);
        repository = new EpisodeRepository(db);
        
        // Insert test user for foreign key constraints
        await db.run('INSERT INTO users (id, username, password) VALUES (?, ?, ?)', 
            ['test-user', 'testuser', 'password']);
            
        // Setup a channel for tests
        await db.run('INSERT INTO channels (id, name, url) VALUES (?, ?, ?)', 
            ['channel-id', 'Test Channel', 'https://youtube.com/channel/id']);
            
        // Create test episodes with durations
        await repository.create({
            type: 'video',
            externalId: 'vid-1',
            title: 'Video 1',
            url: 'url1',
            channelId: 'channel-id',
            userId: 'test-user',
            duration: 100 // 100 seconds
        });
        
        await repository.create({
            type: 'video',
            externalId: 'vid-2',
            title: 'Video 2',
            url: 'url2',
            channelId: 'channel-id',
            userId: 'test-user',
            duration: 250 // 250 seconds
        });
        
        const watched = await repository.create({
            type: 'video',
            externalId: 'vid-3',
            title: 'Video 3',
            url: 'url3',
            channelId: 'channel-id',
            userId: 'test-user',
            duration: 500 // 500 seconds
        });
        await repository.update(watched.id, { watchStatus: 'watched', watched: true });
    });

    afterEach(async () => {
        await db.close();
    });

    it('should return total duration for unwatched episodes', async () => {
        const { totalDuration, total } = await service.listEpisodes({ watched: false, userId: 'test-user' });
        expect(total).toBe(2);
        expect(totalDuration).toBe(350); // 100 + 250
    });

    it('should return total duration for all episodes when no watch filter', async () => {
        const { totalDuration, total } = await service.listEpisodes({ userId: 'test-user' });
        expect(total).toBe(3);
        expect(totalDuration).toBe(850); // 100 + 250 + 500
    });

    it('should return total duration for watched episodes', async () => {
        const { totalDuration, total } = await service.listEpisodes({ watched: true, userId: 'test-user' });
        expect(total).toBe(1);
        expect(totalDuration).toBe(500);
    });

    it('should return 0 duration when no episodes match', async () => {
        const { totalDuration, total } = await service.listEpisodes({ search: 'non-existent', userId: 'test-user' });
        expect(total).toBe(0);
        expect(totalDuration).toBe(0);
    });
});
