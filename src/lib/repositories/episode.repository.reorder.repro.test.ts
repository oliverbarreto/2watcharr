import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { EpisodeRepository } from './episode.repository';
import { createTestDb } from '../test/test-db';
import { Database } from 'sqlite';

describe('EpisodeRepository Reordering Bug Reproduction', () => {
    let db: Database;
    let repository: EpisodeRepository;
    const userId = 'test-user';

    beforeEach(async () => {
        db = await createTestDb();
        repository = new EpisodeRepository(db);
        
        await db.run('INSERT INTO users (id, username, password) VALUES (?, ?, ?)', 
            [userId, 'testuser', 'password']);
        await db.run('INSERT INTO channels (id, name, url) VALUES (?, ?, ?)', 
            ['channel-id', 'Test Channel', 'https://youtube.com/channel/id']);
    });

    afterEach(async () => {
        await db.close();
    });

    it('should fail to move an episode to the end when a watched episode has a custom_order', async () => {
        // Create 3 episodes
        // Episode A: Unwatched, custom_order 0
        const eA = await repository.create({
            type: 'video', externalId: 'vidA', title: 'A', url: 'urlA', channelId: 'channel-id', userId
        });
        await repository.update(eA.id, { customOrder: 0 });

        // Episode B: Watched, custom_order 1
        const eB = await repository.create({
            type: 'video', externalId: 'vidB', title: 'B', url: 'urlB', channelId: 'channel-id', userId
        });
        await repository.update(eB.id, { watched: true, customOrder: 1 });

        // Episode C: Unwatched, custom_order 2
        const eC = await repository.create({
            type: 'video', externalId: 'vidC', title: 'C', url: 'urlC', channelId: 'channel-id', userId
        });
        await repository.update(eC.id, { customOrder: 2 });

        // INITIAL STATE (custom_order): A=0, B=1, C=2
        // If we filter for BOTH (like Watch Next might do if they are all high priority): [A, B, C]

        // ACT: Move A to the end
        // Current implementation only sees [A, C] because B is watched.
        // It will reorder [A, C] to [C, A] and set C=0, A=1.
        // B remains at 1.
        await repository.moveToEnd(eA.id, userId);

        // EXPECTATION: A should be at the end of the combined list [B, C, A] -> order C, B, A or something
        // But if we want it at the VERY end, it should have the highest custom_order.
        
        const allEpisodes = await repository.findAll({ userId, isDeleted: false }, { field: 'custom', order: 'asc' });
        const lastEpisode = allEpisodes[allEpisodes.length - 1];
        
        // This is expected to FAIL with current implementation because A=1, B=1 or A=1, B=2 etc.
        // Actually with current implementation:
        // episodes = [A, C] (since B is watched)
        // episodeIds = [C, A]
        // reorder([C, A]) -> C=0, A=1
        // B is still 1.
        // Resulting order: [C, A, B] or [C, B, A] -> A is NOT at the end if B is considered.
        
        expect(lastEpisode.id).toBe(eA.id);
    });
});
