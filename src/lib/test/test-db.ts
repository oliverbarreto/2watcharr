import sqlite3 from 'sqlite3';
import { open, Database } from 'sqlite';
import fs from 'fs/promises';
import path from 'path';

/**
 * Create an in-memory database for testing
 */
export async function createTestDb(): Promise<Database> {
    const db = await open({
        filename: ':memory:',
        driver: sqlite3.Database
    });

    await db.run('PRAGMA foreign_keys = ON');

    // Load and run the schema
    const schemaPath = path.join(process.cwd(), 'src/lib/db/schema.sql');
    const schemaSql = await fs.readFile(schemaPath, 'utf-8');
    
    // Split schema into individual statements if necessary, 
    // but db.exec handle multiple statements.
    await db.exec(schemaSql);

    // Initialize migrations table for tests if needed, 
    // but usually not required if we just want the schema.
    await db.exec(`
        CREATE TABLE IF NOT EXISTS migrations (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL UNIQUE,
            applied_at INTEGER NOT NULL DEFAULT (unixepoch())
        );
        INSERT INTO migrations (name) VALUES ('initial_schema');
    `);

    return db;
}
