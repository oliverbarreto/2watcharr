import { NextRequest, NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { getDatabase } from '@/lib/db/database';
import { ChannelRepository } from '@/lib/repositories';

/**
 * GET /api/channels - List all channels with episode counts
 */
export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        const userId = (session.user as { id: string }).id;

        const { searchParams } = new URL(request.url);
        const search = searchParams.get('search') || undefined;
        const type = (searchParams.get('type') as 'video' | 'podcast') || undefined;
        const tagIds = searchParams.get('tagIds')?.split(',') || undefined;

        const db = await getDatabase();
        const channelRepo = new ChannelRepository(db);

        const channels = await channelRepo.getChannelsWithEpisodeCount({
            search,
            type,
            tagIds,
            userId,
        });

        return NextResponse.json({ channels });
    } catch (error) {
        console.error('Error listing channels:', error);
        return NextResponse.json(
            { error: 'Failed to list channels' },
            { status: 500 }
        );
    }
}
