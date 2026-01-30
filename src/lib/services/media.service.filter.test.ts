import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { MediaService } from './media.service';
import { createTestDb } from '../test/test-db';
import { Database } from 'sqlite';
import { EpisodeRepository } from '../repositories/episode.repository';

describe('MediaService Filtering', () => {
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
            
        // Create test episodes with different watch statuses
        await repository.create({
            type: 'video',
            externalId: 'unwatched-1',
            title: 'Unwatched Episode',
            url: 'url1',
            channelId: 'channel-id',
            userId: 'test-user'
        });
        
        const pending = await repository.create({
            type: 'video',
            externalId: 'pending-1',
            title: 'Pending Episode',
            url: 'url2',
            channelId: 'channel-id',
            userId: 'test-user'
        });
        await repository.update(pending.id, { watchStatus: 'pending' });
        
        const watched = await repository.create({
            type: 'video',
            externalId: 'watched-1',
            title: 'Watched Episode',
            url: 'url3',
            channelId: 'channel-id',
            userId: 'test-user'
        });
        await repository.update(watched.id, { watchStatus: 'watched', watched: true });
    });

    afterEach(async () => {
        await db.close();
    });

    it('should filter by unwatched status', async () => {
        const episodes = await service.listEpisodes({ watched: false, watchStatus: 'unwatched' });
        expect(episodes).toHaveLength(1);
        expect(episodes[0].watchStatus).toBe('unwatched');
        expect(episodes[0].externalId).toBe('unwatched-1');
    });

    it('should filter by pending status', async () => {
        const episodes = await service.listEpisodes({ watched: false, watchStatus: 'pending' });
        expect(episodes).toHaveLength(1);
        expect(episodes[0].watchStatus).toBe('pending');
        expect(episodes[0].externalId).toBe('pending-1');
    });

    it('should filter by watched status', async () => {
        const episodes = await service.listEpisodes({ watchStatus: 'watched' });
        expect(episodes).toHaveLength(1);
        expect(episodes[0].watchStatus).toBe('watched');
        expect(episodes[0].externalId).toBe('watched-1');
    });

    it('should reflect status change in filter after marking as pending', async () => {
        // Start with all episodes
        const initialEpisodes = await service.listEpisodes({});
        const unwatched = initialEpisodes.find(e => e.externalId === 'unwatched-1');
        expect(unwatched).toBeDefined();
        
        // Mark as pending
        await service.updateEpisode(unwatched!.id, { watchStatus: 'pending' });
        
        // Filter by pending
        const pendingEpisodes = await service.listEpisodes({ watched: false, watchStatus: 'pending' });
        expect(pendingEpisodes).toHaveLength(2); // One already existed, plus the new one
        expect(pendingEpisodes.map(e => e.externalId)).toContain('unwatched-1');
        expect(pendingEpisodes.map(e => e.externalId)).toContain('pending-1');
    });
});
