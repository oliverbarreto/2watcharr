import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { getDatabase } from '@/lib/db/database';
import { MediaService } from '@/lib/services';
import { z } from 'zod';

// Request validation schema
const updateEpisodeSchema = z.object({
    title: z.string().optional(),
    description: z.string().optional(),
    watched: z.boolean().optional(),
    watchStatus: z.enum(['unwatched', 'pending', 'watched']).optional(),
    favorite: z.boolean().optional(),
    isDeleted: z.boolean().optional(),
    priority: z.enum(['none', 'low', 'medium', 'high']).optional(),
    tagIds: z.array(z.string()).optional(),
});

/**
 * GET /api/episodes/[id] - Get a single episode
 */
export async function GET(
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

        const episode = await mediaService.getEpisode(id);

        if (!episode || episode.userId !== userId) {
            return NextResponse.json(
                { error: 'Episode not found' },
                { status: 404 }
            );
        }

        // Get tags for the episode
        const tagIds = await mediaService.getEpisodeTags(id);

        return NextResponse.json({
            ...episode,
            tagIds,
        });
    } catch (error) {
        console.error('Error getting episode:', error);
        return NextResponse.json(
            { error: 'Failed to get episode' },
            { status: 500 }
        );
    }
}

/**
 * PATCH /api/episodes/[id] - Update an episode
 */
export async function PATCH(
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

        const body = await request.json();
        const data = updateEpisodeSchema.parse(body);

        const db = await getDatabase();
        const mediaService = new MediaService(db);

        // Check ownership
        const existing = await mediaService.getEpisode(id);
        if (!existing || existing.userId !== userId) {
             return NextResponse.json({ error: 'Episode not found' }, { status: 404 });
        }

        // Extract tagIds separately
        const { tagIds, ...updates } = data;

        // Update episode properties
        const episode = await mediaService.updateEpisode(id, updates);

        // Update tags if provided
        if (tagIds !== undefined) {
            await mediaService.updateTags(id, tagIds);
        }

        return NextResponse.json(episode);
    } catch (error) {
        console.error('Error updating episode:', error);

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
            { error: 'Failed to update episode' },
            { status: 500 }
        );
    }
}

/**
 * DELETE /api/episodes/[id] - Delete an episode
 * Query params:
 *   - permanent=true: Permanently delete the episode (hard delete)
 */
export async function DELETE(
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

        // Check ownership
        const existing = await mediaService.getEpisode(id);
        if (!existing || existing.userId !== userId) {
             return NextResponse.json({ error: 'Episode not found' }, { status: 404 });
        }

        // Check if this is a permanent delete
        const { searchParams } = new URL(request.url);
        const isPermanent = searchParams.get('permanent') === 'true';

        if (isPermanent) {
            await mediaService.hardDeleteEpisode(id);
        } else {
            await mediaService.deleteEpisode(id);
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting episode:', error);
        return NextResponse.json(
            { error: 'Failed to delete episode' },
            { status: 500 }
        );
    }
}
