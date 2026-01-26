import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/db/database';
import { VideoService } from '@/lib/services';
import { z } from 'zod';

// Request validation schema
const updateVideoSchema = z.object({
    title: z.string().optional(),
    description: z.string().optional(),
    watched: z.boolean().optional(),
    favorite: z.boolean().optional(),
    priority: z.enum(['none', 'low', 'medium', 'high']).optional(),
    tagIds: z.array(z.string()).optional(),
});

/**
 * GET /api/videos/[id] - Get a single video
 */
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const db = await getDatabase();
        const videoService = new VideoService(db);

        const video = await videoService.getVideo(id);

        if (!video) {
            return NextResponse.json(
                { error: 'Video not found' },
                { status: 404 }
            );
        }

        // Get tags for the video
        const tagIds = await videoService.getVideoTags(id);

        return NextResponse.json({
            ...video,
            tagIds,
        });
    } catch (error) {
        console.error('Error getting video:', error);
        return NextResponse.json(
            { error: 'Failed to get video' },
            { status: 500 }
        );
    }
}

/**
 * PATCH /api/videos/[id] - Update a video
 */
export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();
        const data = updateVideoSchema.parse(body);

        const db = await getDatabase();
        const videoService = new VideoService(db);

        // Extract tagIds separately
        const { tagIds, ...updates } = data;

        // Update video properties
        const video = await videoService.updateVideo(id, updates);

        // Update tags if provided
        if (tagIds !== undefined) {
            await videoService.updateTags(id, tagIds);
        }

        return NextResponse.json(video);
    } catch (error) {
        console.error('Error updating video:', error);

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
            { error: 'Failed to update video' },
            { status: 500 }
        );
    }
}

/**
 * DELETE /api/videos/[id] - Delete a video
 */
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const db = await getDatabase();
        const videoService = new VideoService(db);

        await videoService.deleteVideo(id);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting video:', error);
        return NextResponse.json(
            { error: 'Failed to delete video' },
            { status: 500 }
        );
    }
}
