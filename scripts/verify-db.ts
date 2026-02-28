import { getDatabase } from '../src/lib/db/database';
import fs from 'fs';
import path from 'path';

async function verify() {
    console.log('Verifying database initialization...');
    try {
        const db = await getDatabase();
        console.log('Database opened successfully.');
        const dbPath = process.env.DATABASE_PATH || './data/2watcharr.db';
        const absolutePath = path.resolve(process.cwd(), dbPath);
        if (fs.existsSync(absolutePath)) {
            console.log(`Database file exists at: ${absolutePath}`);
        } else {
            console.error('Database file NOT found!');
        }
        await db.close();
    } catch (error) {
        console.error('Error during verification:', error);
    }
}

verify();
