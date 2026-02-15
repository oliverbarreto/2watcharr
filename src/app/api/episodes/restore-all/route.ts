import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { getDatabase } from '@/lib/db/database';
import { MediaService } from '@/lib/services';

/**
 * POST /api/episodes/restore-all - Restore all soft-deleted episodes
 */
export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        const userId = (session.user as { id: string }).id;

        const db = await getDatabase();
        const mediaService = new MediaService(db);

        await mediaService.restoreAllEpisodes(userId);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error restoring all episodes:', error);
        return NextResponse.json(
            { error: 'Failed to restore episodes' },
            { status: 500 }
        );
    }
}
