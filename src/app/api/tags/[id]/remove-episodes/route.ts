import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { getDatabase } from '@/lib/db/database';
import { MediaService } from '@/lib/services';

/**
 * POST /api/tags/[id]/remove-episodes - Soft remove episodes by tag
 */
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        const userId = (session.user as { id: string }).id;

        const db = await getDatabase();
        const mediaService = new MediaService(db);

        await mediaService.softDeleteEpisodesByTag(id, userId);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error soft removing episodes by tag:', error);
        return NextResponse.json(
            { error: 'Failed to remove episodes' },
            { status: 500 }
        );
    }
}
