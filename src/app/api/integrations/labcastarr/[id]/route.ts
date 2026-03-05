import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { getDatabase } from '@/lib/db/database';
import { IntegrationService } from '@/lib/services/integration.service';
import { z } from 'zod';

const updateIntegrationSchema = z.object({
    enabled: z.boolean().optional(),
    name: z.string().min(1).optional(),
    apiUrl: z.string().url().optional(),
    apiToken: z.string().min(1).optional(),
    channelId: z.string().min(1).optional(),
    autoTag: z.string().optional(),
    audioQuality: z.string().optional(),
    audioLanguage: z.string().optional(),
});

/**
 * PATCH /api/integrations/labcastarr/[id] - Update an integration
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

        const db = await getDatabase();
        const integrationService = new IntegrationService(db);

        // Verify ownership/existence
        const existing = await (await getDatabase()).get('SELECT user_id FROM labcastarr_integrations WHERE id = ?', id);
        if (!existing || existing.user_id !== userId) {
            return NextResponse.json({ error: 'Not found' }, { status: 404 });
        }

        const body = await request.json();
        const data = updateIntegrationSchema.parse(body);

        const updated = await integrationService.updateIntegration(id, data);
        return NextResponse.json(updated);
    } catch (error) {
        console.error('Error updating integration:', error);
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: 'Invalid request data', details: error.issues }, { status: 400 });
        }
        return NextResponse.json({ error: 'Failed to update integration' }, { status: 500 });
    }
}

/**
 * DELETE /api/integrations/labcastarr/[id] - Delete an integration
 */
export async function DELETE(
    _request: NextRequest,
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
        const integrationService = new IntegrationService(db);

        // Verify ownership
        const existing = await (await getDatabase()).get('SELECT user_id FROM labcastarr_integrations WHERE id = ?', id);
        if (!existing || existing.user_id !== userId) {
            return NextResponse.json({ error: 'Not found' }, { status: 404 });
        }

        await integrationService.deleteIntegration(id);
        return new NextResponse(null, { status: 204 });
    } catch (error) {
        console.error('Error deleting integration:', error);
        return NextResponse.json({ error: 'Failed to delete integration' }, { status: 500 });
    }
}
