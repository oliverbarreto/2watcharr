import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/db/database';
import { VideoService } from '@/lib/services';

/**
 * POST /api/channels/sync - Sync metadata for all channels
 */
export async function POST(request: NextRequest) {
    try {
        const db = await getDatabase();
        const videoService = new VideoService(db);

        const result = await videoService.syncAllChannelsMetadata();

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
