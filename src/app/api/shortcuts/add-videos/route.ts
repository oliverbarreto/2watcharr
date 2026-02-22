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
const addVideosSchema = z.array(z.object({
    url: z.string().url('Invalid URL'),
    tag: z.string().optional(), // Tag name (will be created if doesn't exist)
}));

/**
 * OPTIONS /api/shortcuts/add-videos - Handle CORS preflight
 */
export const OPTIONS = handleOptions;

/**
 * POST /api/shortcuts/add-videos - Add multiple videos from iOS Shortcut
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
        const videos = addVideosSchema.parse(body);

        const mediaService = new MediaService(db);
        const results = await mediaService.addVideosBatch(videos, userId);

        const duration = Date.now() - startTime;
        console.log(`POST ${requestUrl.pathname} 200 in ${duration}ms - User: ${userId}, Count: ${videos.length}`);

        return NextResponse.json({
            success: true,
            results: results
        }, { headers: corsHeaders });

    } catch (error) {
        console.error('Error in batch add-videos:', error);

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

        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to process batch request',
            },
            { status: 500, headers: corsHeaders }
        );
    }
}
