import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { getDatabase } from '@/lib/db/database';
import { IntegrationService } from '@/lib/services/integration.service';
import { z } from 'zod';

const testSchema = z.object({
    apiUrl: z.string().url(),
    apiToken: z.string().min(1),
});

/**
 * POST /api/integrations/labcastarr/test - Test connection to LabcastARR
 */
export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const data = testSchema.parse(body);

        const db = await getDatabase();
        const integrationService = new IntegrationService(db);

        // Use a mock integration object for testing
        const success = await integrationService.testConnection({
            apiUrl: data.apiUrl,
            apiToken: data.apiToken,
        });

        return NextResponse.json({ success });
    } catch (_error) {
        console.error('Error testing LabcastARR connection:', _error);
        return NextResponse.json({ error: 'Failed to test connection', success: false }, { status: 500 });
    }

}
