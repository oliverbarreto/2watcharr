import { NextRequest, NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { getDatabase } from '@/lib/db/database';
import { MediaService } from '@/lib/services';
import { z } from 'zod';
import { MediaType, SortField } from '@/lib/domain/models';

// Request validation schema
const addEpisodeSchema = z.object({
    url: z.string().url('Invalid URL'),
    tagIds: z.array(z.string()).optional(),
});

/**
 * POST /api/episodes - Add a new episode from URL
 */
export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        const userId = (session.user as { id: string }).id;

        const body = await request.json();
        const { url, tagIds } = addEpisodeSchema.parse(body);

        const db = await getDatabase();
        const mediaService = new MediaService(db);

        const episode = await mediaService.addEpisodeFromUrl(url, userId, tagIds);

        return NextResponse.json(episode, { status: 201 });
    } catch (error) {
        console.error('Error adding episode:', error);

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
            { error: 'Failed to add episode' },
            { status: 500 }
        );
    }
}

/**
 * GET /api/episodes - List episodes with optional filters and sorting
 */
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);

        // Parse filters
        const tagIds = searchParams.get('tags')?.split(',').filter(Boolean);
        const search = searchParams.get('search') || undefined;
        const watchedParam = searchParams.get('watched');
        const favoriteParam = searchParams.get('favorite');
        const hasNotesParam = searchParams.get('hasNotes');
        const channelId = searchParams.get('channelId') || undefined;
        const channelsParam = searchParams.get('channels');
        const channelIds = channelsParam ? channelsParam.split(',').filter(Boolean) : undefined;
        const watchStatus = searchParams.get('watchStatus') as 'unwatched' | 'pending' | 'watched' | undefined || undefined;
        const type = searchParams.get('type') as MediaType | undefined;

        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        const userId = (session.user as { id: string }).id;

        const filters = {
            type,
            tagIds,
            search,
            watched: watchedParam ? watchedParam === 'true' : undefined,
            watchStatus,
            favorite: favoriteParam ? favoriteParam === 'true' : undefined,
            hasNotes: hasNotesParam ? hasNotesParam === 'true' : undefined,
            channelId,
            channelIds,
            userId,
            isDeleted: searchParams.get('isDeleted') === 'true' ? true : undefined,
        };


        // Parse sorting
        const sortField = searchParams.get('sort') || 'created_at';
        const sortOrder = searchParams.get('order') || 'desc';

        const sort = {
            field: sortField as SortField,
            order: sortOrder as 'asc' | 'desc',
        };

        // Parse pagination
        const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined;
        const offset = searchParams.get('offset') ? parseInt(searchParams.get('offset')!) : undefined;

        const pagination = {
            limit,
            offset,
        };

        const db = await getDatabase();
        const mediaService = new MediaService(db);

        const { episodes, total } = await mediaService.listEpisodes(filters, sort, pagination);

        return NextResponse.json({
            episodes,
            total,
        });
    } catch (error) {
        console.error('Error listing episodes:', error);
        return NextResponse.json(
            { 
                error: 'Failed to list episodes', 
                message: error instanceof Error ? error.message : String(error) 
            },
            { status: 500 }
        );
    }
}
