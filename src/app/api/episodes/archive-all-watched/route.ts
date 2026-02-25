import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { getDatabase } from '@/lib/db/database';
import { MediaService } from '@/lib/services';

/**
 * POST /api/episodes/archive-all-watched - Archive all watched episodes
 */
export async function POST() {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        const userId = (session.user as { id: string }).id;

        const db = await getDatabase();
        const mediaService = new MediaService(db);

        await mediaService.bulkArchiveWatched(userId);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error archiving all watched episodes:', error);
        return NextResponse.json(
            { error: 'Failed to archive episodes' },
            { status: 500 }
        );
    }
}
