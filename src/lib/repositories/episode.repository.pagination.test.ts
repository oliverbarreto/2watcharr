import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { EpisodeRepository } from './episode.repository';
import { createTestDb } from '../test/test-db';
import { Database } from 'sqlite';

describe('EpisodeRepository Pagination', () => {
    let db: Database;
    let repository: EpisodeRepository;

    beforeEach(async () => {
        db = await createTestDb();
        repository = new EpisodeRepository(db);
        
        // Insert test user for foreign key constraints
        await db.run('INSERT INTO users (id, username, password) VALUES (?, ?, ?)', 
            ['test-user', 'testuser', 'password']);

        // Setup: Create a channel first because of foreign key
        await db.run('INSERT INTO channels (id, name, url) VALUES (?, ?, ?)', 
            ['channel-id', 'Test Channel', 'https://youtube.com/channel/id']);
            
        // Create 10 episodes
        for (let i = 0; i < 10; i++) {
            await repository.create({
                type: 'video',
                externalId: `test-id-${i}`,
                title: `Episode ${i}`,
                url: `https://youtube.com/watch?v=test-id-${i}`,
                channelId: 'channel-id',
                userId: 'test-user'
            });
        }
    });

    afterEach(async () => {
        await db.close();
    });

    it('should return all episodes when no pagination is provided', async () => {
        const episodes = await repository.findAll({ userId: 'test-user' });
        expect(episodes).toHaveLength(10);
    });

    it('should respect limit', async () => {
        const episodes = await repository.findAll({ userId: 'test-user' }, undefined, { limit: 5 });
        expect(episodes).toHaveLength(5);
    });

    it('should respect offset', async () => {
        const allEpisodes = await repository.findAll({ userId: 'test-user' }, { field: 'created_at', order: 'asc' });
        const paginatedEpisodes = await repository.findAll(
            { userId: 'test-user' }, 
            { field: 'created_at', order: 'asc' }, 
            { limit: 5, offset: 5 }
        );
        
        expect(paginatedEpisodes).toHaveLength(5);
        expect(paginatedEpisodes[0].id).toBe(allEpisodes[5].id);
        expect(paginatedEpisodes[4].id).toBe(allEpisodes[9].id);
    });

    it('should count all episodes matching filters', async () => {
        const count = await repository.countAll({ userId: 'test-user' });
        expect(count).toBe(10);
        
        const filteredCount = await repository.countAll({ userId: 'test-user', search: 'Episode 1' });
        expect(filteredCount).toBe(1);
    });
});
