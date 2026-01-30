import { NextRequest, NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import { getDatabase } from '@/lib/db/database';
import { MediaService } from '@/lib/services';

/**
 * POST /api/channels/sync - Sync metadata for all channels
 */
export async function POST(request: NextRequest) {
    try {
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
            { error: 'Failed to sync channels' },
            { status: 500 }
        );
    }
}
