import sqlite3 from 'sqlite3';
import { open, Database } from 'sqlite';
import { runMigrations } from './migrations';

let db: Database | null = null;

/**
 * Get or create the database connection
 * @returns Promise resolving to the database instance
 */
export async function getDatabase(): Promise<Database> {
    if (!db) {
        const dbPath = process.env.DATABASE_PATH || './data/2watcharr.db';

        db = await open({
            filename: dbPath,
            driver: sqlite3.Database
        });

        // Enable WAL mode for better concurrency
        await db.run('PRAGMA journal_mode = WAL');

        // Enable foreign keys
        await db.run('PRAGMA foreign_keys = ON');

        // Run migrations
        await runMigrations(db);
    }

    return db;
}

/**
 * Close the database connection
 */
export async function closeDatabase(): Promise<void> {
    if (db) {
        await db.close();
        db = null;
    }
}
