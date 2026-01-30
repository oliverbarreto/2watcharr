
import { getDatabase } from './src/lib/db/database';
import { StatsService } from './src/lib/services/stats.service';

async function test() {
    try {
        const db = await getDatabase();
        const statsService = new StatsService(db);
        
        // Use a dummy userId or find one
        const user = await db.get('SELECT id FROM users LIMIT 1');
        if (!user) {
            console.log('No user found in DB');
            return;
        }

        console.log('Testing StatsService for user:', user.id);
        const stats = await statsService.getDashboardStats(user.id);
        console.log('Stats:', JSON.stringify(stats, null, 2));
    } catch (err) {
        console.error('StatsService failed:', err);
    }
}

test();
