import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { TagRepository } from './tag.repository';
import { createTestDb } from '../test/test-db';
import { Database } from 'sqlite';

describe('TagRepository Sorting', () => {
    let db: Database;
    let repository: TagRepository;

    beforeEach(async () => {
        db = await createTestDb();
        repository = new TagRepository(db);
        
        // Insert test user
        await db.run('INSERT INTO users (id, username, password) VALUES (?, ?, ?)', 
            ['test-user', 'testuser', 'password']);
    });

    afterEach(async () => {
        await db.close();
    });

    it('should sort tags alphabetically', async () => {
        await repository.create({ name: 'Zeta', userId: 'test-user' });
        await repository.create({ name: 'Alpha', userId: 'test-user' });
        await repository.create({ name: 'Beta', userId: 'test-user' });

        const tags = await repository.findAll('test-user', 'alphabetical');
        expect(tags[0].name).toBe('Alpha');
        expect(tags[1].name).toBe('Beta');
        expect(tags[2].name).toBe('Zeta');
    });

    it('should sort tags by usage (episode count)', async () => {
        const t1 = await repository.create({ name: 'Tag 1', userId: 'test-user' });
        const t2 = await repository.create({ name: 'Tag 2', userId: 'test-user' });
        const t3 = await repository.create({ name: 'Tag 3', userId: 'test-user' });

        // Add dummy episodes and tag them
        await db.run('INSERT INTO channels (id, name, url) VALUES (?, ?, ?)', 
            ['ch1', 'Channel 1', 'url1']);
        
        const insertEpisode = async (id: string) => {
            await db.run(`
                INSERT INTO episodes (id, external_id, title, url, channel_id, user_id) 
                VALUES (?, ?, ?, ?, ?, ?)
            `, [id, id, id, id, 'ch1', 'test-user']);
        };

        const tagEpisode = async (eId: string, tId: string) => {
            await db.run('INSERT INTO episode_tags (episode_id, tag_id) VALUES (?, ?)', [eId, tId]);
        };

        // Usage: T2 (3), T1 (2), T3 (1)
        await insertEpisode('e1'); await tagEpisode('e1', t2.id);
        await insertEpisode('e2'); await tagEpisode('e2', t2.id);
        await insertEpisode('e3'); await tagEpisode('e3', t2.id);
        await insertEpisode('e4'); await tagEpisode('e4', t1.id);
        await insertEpisode('e5'); await tagEpisode('e5', t1.id);
        await insertEpisode('e6'); await tagEpisode('e6', t3.id);

        const tags = await repository.getTagsWithEpisodeCount('test-user', 'usage');
        expect(tags[0].name).toBe('Tag 2');
        expect(tags[1].name).toBe('Tag 1');
        expect(tags[2].name).toBe('Tag 3');
        expect(tags[0].episodeCount).toBe(3);
        expect(tags[1].episodeCount).toBe(2);
        expect(tags[2].episodeCount).toBe(1);
    });

    it('should sort tags by recency (last used)', async () => {
        const t1 = await repository.create({ name: 'Tag 1', userId: 'test-user' });
        const t2 = await repository.create({ name: 'Tag 2', userId: 'test-user' });
        const t3 = await repository.create({ name: 'Tag 3', userId: 'test-user' });

        // Sequence of use: T2, then T1, then T3 (most recent)
        const now = Math.floor(Date.now() / 1000);
        await repository.updateLastUsed(t2.id, now - 100);
        await repository.updateLastUsed(t1.id, now - 50);
        await repository.updateLastUsed(t3.id, now);

        const tags = await repository.findAll('test-user', 'recent');
        expect(tags[0].name).toBe('Tag 3');
        expect(tags[1].name).toBe('Tag 1');
        expect(tags[2].name).toBe('Tag 2');
    });
});
