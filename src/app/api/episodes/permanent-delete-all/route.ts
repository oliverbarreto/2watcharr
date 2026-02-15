import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { getDatabase } from '@/lib/db/database';
import { MediaService } from '@/lib/services';

/**
 * DELETE /api/episodes/permanent-delete-all - Permanently delete all soft-deleted episodes
 */
export async function DELETE(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        const userId = (session.user as { id: string }).id;

        const db = await getDatabase();
        const mediaService = new MediaService(db);

        await mediaService.hardDeleteAllEpisodes(userId);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error permanently deleting all episodes:', error);
        return NextResponse.json(
            { error: 'Failed to delete episodes' },
            { status: 500 }
        );
    }
}
