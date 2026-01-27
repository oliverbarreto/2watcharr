import { NextRequest, NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import { getDatabase } from '@/lib/db/database';
import { VideoService } from '@/lib/services';
import { TagRepository } from '@/lib/repositories';
import { z } from 'zod';

// Request validation schema
const addVideoSchema = z.object({
    url: z.string().url('Invalid URL'),
    tag: z.string().optional(), // Tag name (will be created if doesn't exist)
});

/**
 * POST /api/shortcuts/add-video - Add video from iOS Shortcut
 * Simplified endpoint optimized for iOS Shortcuts integration
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { url, tag } = addVideoSchema.parse(body);

        const db = await getDatabase();
        const videoService = new VideoService(db);
        const tagRepo = new TagRepository(db);

        let tagIds: string[] | undefined;

        // If tag name is provided, find or create it
        if (tag) {
            let tagEntity = await tagRepo.findByName(tag);
            if (!tagEntity) {
                tagEntity = await tagRepo.create({ name: tag });
            }
            tagIds = [tagEntity.id];
        }

        // Add the video
        const video = await videoService.addVideoFromUrl(url, tagIds);

        return NextResponse.json({
            success: true,
            video: {
                id: video.id,
                title: video.title,
                channel: video.channelId,
            },
        });
    } catch (error) {
        console.error('Error adding video from shortcut:', error);

        if (error instanceof z.ZodError) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Invalid request data',
                    details: error.issues,
                },
                { status: 400 }
            );
        }

        if (error instanceof Error) {
            return NextResponse.json(
                {
                    success: false,
                    error: error.message,
                },
                { status: 400 }
            );
        }

        return NextResponse.json(
            {
                success: false,
                error: 'Failed to add video',
            },
            { status: 500 }
        );
    }
}
