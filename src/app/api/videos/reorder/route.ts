import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/db/database';
import { VideoService } from '@/lib/services';
import { z } from 'zod';

const reorderSchema = z.object({
    videoIds: z.array(z.string()),
});

/**
 * POST /api/videos/reorder - Reorder videos
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { videoIds } = reorderSchema.parse(body);

        const db = await getDatabase();
        const videoService = new VideoService(db);

        await videoService.reorderVideos(videoIds);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error reordering videos:', error);

        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: 'Invalid request data', details: error.issues },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { error: 'Failed to reorder videos' },
            { status: 500 }
        );
    }
}
