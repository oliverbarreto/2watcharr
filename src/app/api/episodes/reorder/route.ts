import { NextRequest, NextResponse } from 'next/server';
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
        const body = await request.json();
        const { episodeIds } = reorderSchema.parse(body);

        const db = await getDatabase();
        const mediaService = new MediaService(db);

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
