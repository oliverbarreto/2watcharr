import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { getDatabase } from '@/lib/db/database';
import { StatsService } from '@/lib/services';

/**
 * GET /api/stats - Get dashboard statistics
 */
export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        const userId = (session.user as { id: string }).id;

        const { searchParams } = new URL(request.url);
        const period = searchParams.get('period') as 'day' | 'week' | 'month' | 'year' || 'month';

        const db = await getDatabase();
        const statsService = new StatsService(db);

        const stats = await statsService.getDashboardStats(userId, { period });

        return NextResponse.json(stats);
    } catch (error) {
        console.error('Error getting stats:', error);
        return NextResponse.json(
            { error: 'Failed to get statistics' },
            { status: 500 }
        );
    }
}
