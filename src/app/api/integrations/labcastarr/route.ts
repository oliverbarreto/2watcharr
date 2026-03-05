import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { getDatabase } from '@/lib/db/database';
import { IntegrationService } from '@/lib/services/integration.service';
import { z } from 'zod';

const createIntegrationSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    apiUrl: z.string().url('Invalid API URL'),
    apiToken: z.string().min(1, 'API Token is required'),
    channelId: z.string().min(1, 'Channel ID is required'),
    autoTag: z.string().optional(),
    audioQuality: z.string().optional(),
    audioLanguage: z.string().optional(),
});

/**
 * GET /api/integrations/labcastarr - List all LabcastARR integrations for user
 */
export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        const userId = (session.user as { id: string }).id;

        const db = await getDatabase();
        const integrationService = new IntegrationService(db);
        const integrations = await integrationService.getIntegrations(userId);

        return NextResponse.json({ integrations });
    } catch (error) {
        console.error('Error listing integrations:', error);
        return NextResponse.json({ error: 'Failed to list integrations' }, { status: 500 });
    }
}

/**
 * POST /api/integrations/labcastarr - Create a new integration
 */
export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        const userId = (session.user as { id: string }).id;

        const body = await request.json();
        const data = createIntegrationSchema.parse(body);

        const db = await getDatabase();
        const integrationService = new IntegrationService(db);
        const integration = await integrationService.createIntegration({
            ...data,
            userId,
        });

        return NextResponse.json(integration, { status: 201 });
    } catch (error) {
        console.error('Error creating integration:', error);
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: 'Invalid request data', details: error.issues }, { status: 400 });
        }
        return NextResponse.json({ error: 'Failed to create integration' }, { status: 500 });
    }
}
