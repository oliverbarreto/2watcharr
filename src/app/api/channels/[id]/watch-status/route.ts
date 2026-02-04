import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { getDatabase } from '@/lib/db/database';
import { EpisodeRepository } from '@/lib/repositories';

/**
 * POST /api/channels/[id]/watch-status - Bulk update watch status for all episodes in a channel
 */
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;
        if (!id) {
            return NextResponse.json({ error: 'Channel ID is required' }, { status: 400 });
        }

        const { watched } = await request.json();
        if (typeof watched !== 'boolean') {
            return NextResponse.json({ error: 'watched (boolean) is required' }, { status: 400 });
        }

        const db = await getDatabase();
        const episodeRepo = new EpisodeRepository(db);

        await episodeRepo.bulkUpdateWatchStatus(id, (session.user as { id: string }).id, watched);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error bulk updating watch status:', error);
        return NextResponse.json(
            { error: 'Failed to update watch status' },
            { status: 500 }
        );
    }
}
