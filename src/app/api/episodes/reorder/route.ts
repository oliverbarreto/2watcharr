import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { getDatabase } from '@/lib/db/database';
import { MediaService } from '@/lib/services';
import { z } from 'zod';

const reorderSchema = z.object({
    episodeIds: z.array(z.string()),
});

/**
 * POST /api/episodes/reorder - Reorder episodes
 */
export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        const userId = (session.user as { id: string }).id;

        const body = await request.json();
        const { episodeIds } = reorderSchema.parse(body);

        const db = await getDatabase();
        const mediaService = new MediaService(db);

        // Verify ownership of ALL episodes before reordering
        for (const id of episodeIds) {
            const episode = await mediaService.getEpisode(id);
            if (!episode || episode.userId !== userId) {
                return NextResponse.json({ error: `Unauthorized or episode ${id} not found` }, { status: 403 });
            }
        }

        await mediaService.reorderEpisodes(episodeIds);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error reordering episodes:', error);

        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: 'Invalid request data', details: error.issues },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { error: 'Failed to reorder episodes' },
            { status: 500 }
        );
    }
}
