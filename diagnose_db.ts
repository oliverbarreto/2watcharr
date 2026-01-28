import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import { VideoRepository } from './src/lib/repositories/video.repository.js';
import { runMigrations } from './src/lib/db/migrations.js';
import path from 'path';

async function diagnose() {
    console.log('Starting diagnosis...');
    try {
        const db = await open({
            filename: './data/2watcharr.db',
            driver: sqlite3.Database
        });

        console.log('Database opened.');
        
        // Ensure migrations are run (this should be idempotent)
        console.log('Checking migrations...');
        await runMigrations(db);
        console.log('Migrations checked.');

        const repo = new VideoRepository(db);

        console.log('Testing findAll()...');
        const videos = await repo.findAll();
        console.log(`Success: Found ${videos.length} videos.`);
        
        if (videos.length > 0) {
            console.log('First video sample:', JSON.stringify(videos[0], null, 2));
        }

        await db.close();
        console.log('Diagnosis complete.');
    } catch (error) {
        console.error('DIAGNOSIS FAILED:', error);
    }
}

diagnose();
