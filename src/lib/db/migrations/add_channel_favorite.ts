import { Database } from 'sqlite';

/**
 * Add favorite field to channels table
 */
export async function addChannelFavorite(db: Database): Promise<void> {
    // Check if migration has already been applied
    const migration = await db.get(
        'SELECT * FROM migrations WHERE name = ?',
        'add_channel_favorite'
    );

    if (migration) {
        return;
    }

    console.log('Running add_channel_favorite migration...');

    try {
        // Add favorite column to channels table
        await db.run('ALTER TABLE channels ADD COLUMN favorite BOOLEAN NOT NULL DEFAULT 0');

        // Create index for favorite column
        await db.run('CREATE INDEX IF NOT EXISTS idx_channels_favorite ON channels(favorite)');

        // Record migration
        await db.run(
            'INSERT INTO migrations (name) VALUES (?)',
            'add_channel_favorite'
        );
        console.log('add_channel_favorite migration completed.');
    } catch (error) {
        if (error instanceof Error && error.message.includes('duplicate column name')) {
            await db.run(
                'INSERT INTO migrations (name) VALUES (?)',
                'add_channel_favorite'
            );
            console.log('favorite column already existed, migration marked as completed.');
        } else {
            console.error('Error running add_channel_favorite migration:', error);
            throw error;
        }
    }
}
