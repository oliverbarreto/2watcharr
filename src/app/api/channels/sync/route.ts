import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { getDatabase } from '@/lib/db/database';
import { MediaService } from '@/lib/services';

/**
 * POST /api/channels/sync - Sync metadata for all channels
 */
export async function POST() {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user || !(session.user as { isAdmin?: boolean }).isAdmin) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const db = await getDatabase();
        const mediaService = new MediaService(db);

        const result = await mediaService.syncAllChannelsMetadata();

        return NextResponse.json({
            success: true,
            message: `Synced ${result.synced} of ${result.total} channels`,
            result,
        });
    } catch (error) {
        console.error('Error syncing channels:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Failed to sync channels' },
            { status: 500 }
        );
    }
}
