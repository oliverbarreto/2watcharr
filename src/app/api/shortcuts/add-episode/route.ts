import { NextRequest, NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { getDatabase } from '@/lib/db/database';
import { MediaService } from '@/lib/services';
import { TagRepository, UserRepository } from '@/lib/repositories';
import { z } from 'zod';
import { handleOptions, getCorsHeaders } from '@/lib/utils/cors';

// Request validation schema
const addEpisodeSchema = z.object({
    url: z.string().url('Invalid URL'),
    tag: z.string().optional(), // Tag name (will be created if doesn't exist)
});

/**
 * OPTIONS /api/shortcuts/add-episode - Handle CORS preflight
 */
export const OPTIONS = handleOptions;

/**
 * POST /api/shortcuts/add-episode - Add episode from iOS Shortcut
 */
export async function POST(request: NextRequest) {
    const origin = request.headers.get('origin');
    const corsHeaders = getCorsHeaders(origin);

    try {
        const startTime = Date.now();
        const requestUrl = new URL(request.url);
        
        const session = await getServerSession(authOptions);
        let userId: string;

        const db = await getDatabase();
        const userRepo = new UserRepository(db);

        if (session?.user) {
            userId = (session.user as { id: string }).id;
        } else {
            // Check for API Token in headers
            const apiToken = request.headers.get('X-API-Token');
            if (apiToken) {
                const user = await userRepo.findByApiToken(apiToken);
                if (user) {
                    userId = user.id;
                } else {
                    console.log(`POST ${requestUrl.pathname} 401 in ${Date.now() - startTime}ms - Invalid API Token`);
                    return NextResponse.json({ success: false, error: 'Invalid API Token' }, { status: 401, headers: corsHeaders });
                }
            } else {
                console.log(`POST ${requestUrl.pathname} 401 in ${Date.now() - startTime}ms - Unauthorized`);
                return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401, headers: corsHeaders });
            }
        }

        const body = await request.json();
        const { url, tag } = addEpisodeSchema.parse(body);

        const mediaService = new MediaService(db);
        const tagRepo = new TagRepository(db);

        let tagIds: string[] | undefined;

        // If tag name is provided, find or create it for THIS user
        if (tag) {
            let tagEntity = await tagRepo.findByName(tag, userId);
            if (!tagEntity) {
                tagEntity = await tagRepo.create({ name: tag, userId });
            }
            tagIds = [tagEntity.id];
        }

        // Add the episode
        const episode = await mediaService.addEpisodeFromUrl(url, userId, tagIds);

        const duration = Date.now() - startTime;
        console.log(`POST ${requestUrl.pathname} 200 in ${duration}ms - User: ${userId}, URL: ${url}`);

        return NextResponse.json({
            success: true,
            episode: {
                id: episode.id,
                title: episode.title,
                type: episode.type,
                channel: episode.channelId,
            },
        }, { headers: corsHeaders });
    } catch (error) {
        console.error('Error adding episode from shortcut:', error);

        if (error instanceof z.ZodError) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Invalid request data',
                    details: error.issues,
                },
                { status: 400, headers: corsHeaders }
            );
        }

        if (error instanceof Error) {
            return NextResponse.json(
                {
                    success: false,
                    error: error.message,
                },
                { status: 400, headers: corsHeaders }
            );
        }

        return NextResponse.json(
            {
                success: false,
                error: 'Failed to add episode',
            },
            { status: 500, headers: corsHeaders }
        );
    }
}
