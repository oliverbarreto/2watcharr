import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/db/database';
import { ChannelRepository } from '@/lib/repositories';

/**
 * GET /api/channels - List all channels with video counts
 */
export async function GET(request: NextRequest) {
    try {
        const db = await getDatabase();
        const channelRepo = new ChannelRepository(db);

        const channels = await channelRepo.getChannelsWithVideoCount();

        return NextResponse.json({ channels });
    } catch (error) {
        console.error('Error listing channels:', error);
        return NextResponse.json(
            { error: 'Failed to list channels' },
            { status: 500 }
        );
    }
}
