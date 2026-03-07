import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { getDatabase } from '@/lib/db/database';
import { IntegrationService } from '@/lib/services/integration.service';
import { z } from 'zod';

const sendSchema = z.object({
    integrationId: z.string().min(1),
    videoUrl: z.string().url(),
    episodeId: z.string().optional(),
    channelName: z.string().optional(),
});

/**
 * POST /api/integrations/labcastarr/send - Manually send an episode to LabcastARR
 */
export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        const userId = (session.user as { id: string }).id;

        const body = await request.json();
        const data = sendSchema.parse(body);

        const db = await getDatabase();
        const integrationService = new IntegrationService(db);

        // Verify ownership/existence of integration
        const integration = await (await getDatabase()).get('SELECT user_id FROM labcastarr_integrations WHERE id = ?', data.integrationId);
        if (!integration || integration.user_id !== userId) {
            return NextResponse.json({ error: 'Integration not found or unauthorized' }, { status: 404 });
        }

        await integrationService.sendById(
            data.integrationId,
            data.videoUrl,
            userId,
            data.episodeId,
            data.channelName
        );

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error sending video to LabcastARR:', error);
        return NextResponse.json({
            error: error instanceof Error ? error.message : 'Failed to send video to LabcastARR'
        }, { status: 500 });
    }
}
