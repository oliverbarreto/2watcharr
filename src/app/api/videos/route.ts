import { NextRequest, NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import { getDatabase } from '@/lib/db/database';
import { VideoService } from '@/lib/services';
import { z } from 'zod';

// Request validation schema
const addVideoSchema = z.object({
    url: z.string().url('Invalid URL'),
    tagIds: z.array(z.string()).optional(),
});

/**
 * POST /api/videos - Add a new video from URL
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { url, tagIds } = addVideoSchema.parse(body);

        const db = await getDatabase();
        const videoService = new VideoService(db);

        const video = await videoService.addVideoFromUrl(url, tagIds);

        return NextResponse.json(video, { status: 201 });
    } catch (error) {
        console.error('Error adding video:', error);

        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: 'Invalid request data', details: error.issues },
                { status: 400 }
            );
        }

        if (error instanceof Error) {
            return NextResponse.json(
                { error: error.message },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { error: 'Failed to add video' },
            { status: 500 }
        );
    }
}

/**
 * GET /api/videos - List videos with optional filters and sorting
 */
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);

        // Parse filters
        const tagIds = searchParams.get('tags')?.split(',').filter(Boolean);
        const search = searchParams.get('search') || undefined;
        const watchedParam = searchParams.get('watched');
        const favoriteParam = searchParams.get('favorite');
        const channelId = searchParams.get('channelId') || undefined;

        const filters = {
            tagIds,
            search,
            watched: watchedParam ? watchedParam === 'true' : undefined,
            favorite: favoriteParam ? favoriteParam === 'true' : undefined,
            channelId,
        };

        // Parse sorting
        const sortField = searchParams.get('sort') || 'created_at';
        const sortOrder = searchParams.get('order') || 'desc';

        const sort = {
            field: sortField as any,
            order: sortOrder as 'asc' | 'desc',
        };

        const db = await getDatabase();
        const videoService = new VideoService(db);

        const videos = await videoService.listVideos(filters, sort);

        return NextResponse.json({
            videos,
            total: videos.length,
        });
    } catch (error) {
        console.error('Error listing videos:', error);
        return NextResponse.json(
            { 
                error: 'Failed to list videos', 
                message: error instanceof Error ? error.message : String(error) 
            },
            { status: 500 }
        );
    }
}
