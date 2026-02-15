/* eslint-disable @typescript-eslint/no-require-imports */
const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const { v4: uuidv4 } = require('uuid');
const path = require('path');

async function main() {
    const dbPath = path.join(__dirname, '../data/2watcharr.db');
    const db = await open({
        filename: dbPath,
        driver: sqlite3.Database
    });

    const userId = 'default-admin';
    const channelId = 'UCfQNB91qRP_5ILeu_S_bSkg';
    const tagName = 'TEST-SCROLL';
    const tagColor = '#3B82F6';

    console.log('Ensuring TEST-SCROLL tag exists...');
    let tag = await db.get('SELECT * FROM tags WHERE name = ? AND user_id = ?', [tagName, userId]);
    if (!tag) {
        const tagId = uuidv4();
        await db.run(
            'INSERT INTO tags (id, name, color, user_id, created_at) VALUES (?, ?, ?, ?, ?)',
            [tagId, tagName, tagColor, userId, Math.floor(Date.now() / 1000)]
        );
        tag = { id: tagId };
        console.log(`Created tag ${tagName} with ID ${tagId}`);
    } else {
        console.log(`Tag ${tagName} already exists with ID ${tag.id}`);
    }

    console.log('Fetching an existing episode to use as a template...');
    const template = await db.get('SELECT * FROM episodes WHERE user_id = ? LIMIT 1', [userId]);
    if (!template) {
        console.error('No episodes found to use as template. Please add at least one episode first.');
        process.exit(1);
    }

    console.log('Generating 200 mock episodes...');
    await db.run('BEGIN TRANSACTION');
    try {
        const now = Math.floor(Date.now() / 1000);
        for (let i = 0; i < 200; i++) {
            const episodeId = uuidv4();
            const externalId = `mock-vid-${i}-${Date.now()}`;
            const title = `Mock Episode ${i + 1}: Infinite Scroll Test`;
            
            // We want them to have different created_at to test sorting, 
            // but for infinite scroll we mostly care about the number.
            // Let's make them slightly older than each other so they appear in a predictable order.
            const createdAt = now - (i * 60); 

            await db.run(`
                INSERT INTO episodes (
                    id, type, external_id, title, description, duration, 
                    thumbnail_url, url, upload_date, published_date, 
                    view_count, channel_id, user_id, watched, watch_status, 
                    favorite, is_deleted, priority, custom_order, created_at, updated_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    episodeId, template.type, externalId, title, `Description for mock episode ${i + 1}`,
                    template.duration, template.thumbnail_url, template.url, 
                    template.upload_date, template.published_date, template.view_count,
                    channelId, userId, 0, 'unwatched', 0, 0, 'none', null, createdAt, createdAt
                ]
            );

            await db.run(
                'INSERT INTO episode_tags (episode_id, tag_id, created_at) VALUES (?, ?, ?)',
                [episodeId, tag.id, createdAt]
            );

            // Add an 'added' event so it shows up in history/sorting if needed
            await db.run(
                'INSERT INTO media_events (id, episode_id, event_type, title, type, created_at) VALUES (?, ?, ?, ?, ?, ?)',
                [uuidv4(), episodeId, 'added', title, template.type, createdAt]
            );
        }
        await db.run('COMMIT');
        console.log('Successfully added 200 mock episodes.');
    } catch (error) {
        await db.run('ROLLBACK');
        console.error('Error adding mock episodes:', error);
    }

    await db.close();
}

main().catch(console.error);
