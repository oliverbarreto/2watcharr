import { describe, it, expect, beforeEach, afterEach } from 'vitest';
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
        
        // Insert test user for foreign key constraints
        await db.run('INSERT INTO users (id, username, password) VALUES (?, ?, ?)', 
            ['test-user', 'testuser', 'password']);
            
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
            channelId: 'channel-id',
            userId: 'test-user'
        });

        await service.toggleWatched(episode.id);
        
        const events = await db.all('SELECT * FROM media_events WHERE episode_id = ? AND event_type = ?', [episode.id, 'watched']);
        expect(events).toHaveLength(1);
    });

    it('should record "unwatched" event when toggleWatched is called to unwatch', async () => {
        const episode = await repository.create({
            type: 'video',
            externalId: 'vid1',
            title: 'Test Episode',
            url: 'url1',
            channelId: 'channel-id',
            userId: 'test-user'
        });

        // First watch
        await service.toggleWatched(episode.id);
        // Then unwatch
        await service.toggleWatched(episode.id);
        
        const unwatchedEvents = await db.all('SELECT * FROM media_events WHERE episode_id = ? AND event_type = ?', [episode.id, 'unwatched']);
        expect(unwatchedEvents).toHaveLength(1);
    });

    it('should record "favorited" event when toggleFavorite is called', async () => {
        const episode = await repository.create({
            type: 'video',
            externalId: 'vid1',
            title: 'Test Episode',
            url: 'url1',
            channelId: 'channel-id',
            userId: 'test-user'
        });

        await service.toggleFavorite(episode.id);
        
        const events = await db.all('SELECT * FROM media_events WHERE episode_id = ? AND event_type = ?', [episode.id, 'favorited']);
        expect(events).toHaveLength(1);
    });

    it('should record "removed" event when deleteEpisode is called', async () => {
        const episode = await repository.create({
            type: 'video',
            externalId: 'vid1',
            title: 'Test Episode',
            url: 'url1',
            channelId: 'channel-id',
            userId: 'test-user'
        });

        await service.deleteEpisode(episode.id);
        
        const events = await db.all('SELECT * FROM media_events WHERE episode_id = ? AND event_type = ?', [episode.id, 'removed']);
        expect(events).toHaveLength(1);
    });

    it('should soft delete episodes by tag', async () => {
        // Create tag
        await db.run('INSERT INTO tags (id, name, user_id) VALUES (?, ?, ?)', ['tag1', 'Test Tag', 'test-user']);
        
        // Create two episodes with this tag
        const ep1 = await repository.create({
            type: 'video', externalId: 'v1', title: 'Ep 1', url: 'u1', channelId: 'channel-id', userId: 'test-user'
        });
        const ep2 = await repository.create({
            type: 'video', externalId: 'v2', title: 'Ep 2', url: 'u2', channelId: 'channel-id', userId: 'test-user'
        });
        
        await repository.addTags(ep1.id, ['tag1']);
        await repository.addTags(ep2.id, ['tag1']);
        
        // Call service
        await service.softDeleteEpisodesByTag('tag1', 'test-user');
        
        // Verify
        const updatedEp1 = await repository.findById(ep1.id);
        const updatedEp2 = await repository.findById(ep2.id);
        
        expect(updatedEp1?.isDeleted).toBe(true);
        expect(updatedEp2?.isDeleted).toBe(true);
        
        const tags1 = await repository.getTags(ep1.id);
        const tags2 = await repository.getTags(ep2.id);
        expect(tags1).not.toContain('tag1');
        expect(tags2).not.toContain('tag1');
    });

    it('should restore all episodes', async () => {
        const ep1 = await repository.create({
            type: 'video', externalId: 'v1', title: 'Ep 1', url: 'u1', channelId: 'channel-id', userId: 'test-user'
        });
        await repository.delete(ep1.id);
        
        await service.restoreAllEpisodes('test-user');
        
        const restored = await repository.findById(ep1.id);
        expect(restored?.isDeleted).toBe(false);
    });

    it('should hard delete all soft-deleted episodes', async () => {
        const ep1 = await repository.create({
            type: 'video', externalId: 'v1', title: 'Ep 1', url: 'u1', channelId: 'channel-id', userId: 'test-user'
        });
        await repository.delete(ep1.id);
        
        await service.hardDeleteAllEpisodes('test-user');
        
        const deleted = await repository.findById(ep1.id);
        expect(deleted).toBeNull();
    });
});
