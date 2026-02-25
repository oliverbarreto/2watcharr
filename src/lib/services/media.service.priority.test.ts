import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { MediaService } from './media.service';
import { createTestDb } from '../test/test-db';
import { Database } from 'sqlite';
import { EpisodeRepository } from '../repositories/episode.repository';

describe('MediaService Priority Reordering', () => {
    let db: Database;
    let service: MediaService;
    let repository: EpisodeRepository;
    const userId = 'test-user';

    beforeEach(async () => {
        db = await createTestDb();
        service = new MediaService(db);
        repository = new EpisodeRepository(db);
        
        await db.run('INSERT INTO users (id, username, password) VALUES (?, ?, ?)', 
            [userId, 'testuser', 'password']);
        await db.run('INSERT INTO channels (id, name, url) VALUES (?, ?, ?)', 
            ['channel-id', 'Test Channel', 'https://youtube.com/channel/id']);
    });

    afterEach(async () => {
        await db.close();
    });

    it('should move episode to beginning when priority is set to high', async () => {
        // Create 2 episodes
        const e1 = await repository.create({
            type: 'video', externalId: 'v1', title: 'Ep 1', url: 'u1', channelId: 'channel-id', userId
        });
        const e2 = await repository.create({
            type: 'video', externalId: 'v2', title: 'Ep 2', url: 'u2', channelId: 'channel-id', userId
        });

        // Initial order: [e1, e2] (by creation/default custom order)
        // Set e2 to high priority
        await service.setPriority(e2.id, 'high');

        // Check order
        const episodes = await repository.findAll({ userId, isDeleted: false }, { field: 'custom', order: 'asc' });
        expect(episodes[0].id).toBe(e2.id);
        expect(episodes[1].id).toBe(e1.id);
    });

    it('should move episode to beginning when priority is set to high via updateEpisode', async () => {
        const e1 = await repository.create({
            type: 'video', externalId: 'v1', title: 'Ep 1', url: 'u1', channelId: 'channel-id', userId
        });
        const e2 = await repository.create({
            type: 'video', externalId: 'v2', title: 'Ep 2', url: 'u2', channelId: 'channel-id', userId
        });

        // Use updateEpisode to set priority
        await service.updateEpisode(e2.id, { priority: 'high' });

        const episodes = await repository.findAll({ userId, isDeleted: false }, { field: 'custom', order: 'asc' });
        expect(episodes[0].id).toBe(e2.id);
    });

    it('should place newly created episodes at the beginning', async () => {
        const e1 = await repository.create({
            type: 'video', externalId: 'v1', title: 'Ep 1', url: 'u1', channelId: 'channel-id', userId
        });
        
        // Use service to add another episode (which uses saveEpisodeFromMetadata)
        // We'll mock metadata service or just manually call the private method if possible, 
        // but it's better to use the public addEpisodeFromUrl if we can or mock the metadata service.
        // Actually, I'll just add one and check its customOrder is 0.
        
        const e2 = await (service as any).saveEpisodeFromMetadata({
            episode: { externalId: 'v2', title: 'Ep 2', url: 'u2', type: 'video' },
            channel: { id: 'channel-id', name: 'Test', url: 'curl', type: 'video' }
        } as any, userId);

        const episodes = await repository.findAll({ userId, isDeleted: false }, { field: 'custom', order: 'asc' });
        expect(episodes[0].id).toBe(e2.id);
        expect(episodes[1].id).toBe(e1.id);
    });
});
