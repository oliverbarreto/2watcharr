import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { getDatabase } from '@/lib/db/database';
import { TagRepository, EpisodeRepository } from '@/lib/repositories';
import { IntegrationService } from '@/lib/services/integration.service';
import { z } from 'zod';

const bulkSendSchema = z.object({
    integrationId: z.string().min(1),
});

/**
 * POST /api/tags/[id]/send-to-labcastarr - Bulk send all episodes with this tag to LabcastARR
 */
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        const userId = (session.user as { id: string }).id;

        const { id: tagId } = await params;
        const body = await request.json();
        const { integrationId } = bulkSendSchema.parse(body);

        const db = await getDatabase();
        const tagRepo = new TagRepository(db);
        const episodeRepo = new EpisodeRepository(db);
        const integrationService = new IntegrationService(db);

        // 1. Verify tag ownership
        const tag = await tagRepo.findById(tagId);
        if (!tag || tag.userId !== userId) {
            return NextResponse.json({ error: 'Tag not found' }, { status: 404 });
        }

        // 2. Get all episodes with this tag
        const episodes = await episodeRepo.findAll({ tagIds: [tagId], userId, isDeleted: false });
        if (episodes.length === 0) {
            return NextResponse.json({ success: true, count: 0 });
        }

        // 3. Send and track results
        let successCount = 0;
        let failCount = 0;
        const errors: string[] = [];

        for (const episode of episodes) {
            try {
                // Validation: only YouTube URLs for now
                if (episode.url && (episode.url.includes('youtube.com') || episode.url.includes('youtu.be'))) {
                    await integrationService.sendById(integrationId, episode.url);
                    successCount++;
                } else {
                    failCount++;
                }
            } catch (error) {
                console.error(`Error bulk sending episode ${episode.id}:`, error);
                failCount++;
                errors.push(error instanceof Error ? error.message : 'Unknown error');
            }
        }

        return NextResponse.json({
            success: true,
            count: successCount,
            failed: failCount,
            errors: errors.length > 0 ? Array.from(new Set(errors)) : []
        });
    } catch (error) {
        console.error('Error in bulk send to LabcastARR:', error);
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: 'Invalid request data', details: error.issues }, { status: 400 });
        }
        return NextResponse.json({ error: 'Failed to bulk send' }, { status: 500 });
    }
}
