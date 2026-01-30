import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { EpisodeRepository } from './episode.repository';
import { createTestDb } from '../test/test-db';
import { Database } from 'sqlite';
import { CreateEpisodeDto } from '../domain/models';

describe('EpisodeRepository Event Tracking', () => {
    let db: Database;
    let repository: EpisodeRepository;

    beforeEach(async () => {
        db = await createTestDb();
        repository = new EpisodeRepository(db);
        
        // Insert test user for foreign key constraints
        await db.run('INSERT INTO users (id, username, password) VALUES (?, ?, ?)', 
            ['test-user', 'testuser', 'password']);
    });

    afterEach(async () => {
        await db.close();
    });

    it('should record an event', async () => {
        const episodeDto: CreateEpisodeDto = {
            type: 'video',
            externalId: 'test-id',
            title: 'Test Episode',
            url: 'https://youtube.com/watch?v=test-id',
            channelId: 'channel-id',
            userId: 'test-user'
        };
        
        // Setup: Create a channel first because of foreign key
        await db.run('INSERT INTO channels (id, name, url) VALUES (?, ?, ?)', 
            ['channel-id', 'Test Channel', 'https://youtube.com/channel/id']);
            
        const episode = await repository.create(episodeDto);
        
        await repository.addEvent(episode.id, 'watched');
        
        const events = await db.all('SELECT * FROM media_events WHERE episode_id = ?', episode.id);
        expect(events).toHaveLength(1);
        expect(events[0].type).toBe('watched');
    });

    it('should retrieve latest event timestamps with the episode', async () => {
        const episodeDto: CreateEpisodeDto = {
            type: 'video',
            externalId: 'test-id-2',
            title: 'Test Episode 2',
            url: 'https://youtube.com/watch?v=test-id-2',
            channelId: 'channel-id',
            userId: 'test-user'
        };
        
        await db.run('INSERT OR IGNORE INTO channels (id, name, url) VALUES (?, ?, ?)', 
            ['channel-id', 'Test Channel', 'https://youtube.com/channel/id']);
            
        const episode = await repository.create(episodeDto);
        
        // Record multiple events
        await repository.addEvent(episode.id, 'added');
        await repository.addEvent(episode.id, 'watched');
        
        const updatedEpisode = await repository.findById(episode.id);
        
        expect(updatedEpisode).toBeDefined();
        expect(updatedEpisode?.lastAddedAt).toBeGreaterThan(0);
        expect(updatedEpisode?.lastWatchedAt).toBeGreaterThan(0);
        expect(updatedEpisode?.lastFavoritedAt).toBeUndefined();
    });

    it('should sort episodes by event dates', async () => {
        await db.run('INSERT OR IGNORE INTO channels (id, name, url) VALUES (?, ?, ?)', 
            ['channel-id', 'Test Channel', 'https://youtube.com/channel/id']);

        const e1 = await repository.create({
            type: 'video',
            externalId: 'vid1',
            title: 'Episode 1',
            url: 'url1',
            channelId: 'channel-id',
            userId: 'test-user'
        });
        const e2 = await repository.create({
            type: 'video',
            externalId: 'vid2',
            title: 'Episode 2',
            url: 'url2',
            channelId: 'channel-id',
            userId: 'test-user'
        });

        // e2 watched later than e1
        await repository.addEvent(e1.id, 'watched');
        // Small delay to ensure sequence
        await new Promise(resolve => setTimeout(resolve, 1100)); 
        await repository.addEvent(e2.id, 'watched');

        // Sort by date_watched DESC
        const sorted = await repository.findAll({}, { field: 'date_watched', order: 'desc' });
        
        expect(sorted[0].id).toBe(e2.id);
        expect(sorted[1].id).toBe(e1.id);
    });
});
