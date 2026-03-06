import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { getDatabase } from '@/lib/db/database';
import { ChannelRepository } from '@/lib/repositories';

/**
 * POST /api/channels/[id]/favorite - Toggle a channel's favorite status
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

        const { id } = await params;
        if (!id) {
            return NextResponse.json({ error: 'Channel ID is required' }, { status: 400 });
        }

        const { favorite } = await request.json();
        if (favorite === undefined) {
            return NextResponse.json({ error: 'Favorite status is required' }, { status: 400 });
        }

        const db = await getDatabase();
        const channelRepo = new ChannelRepository(db);

        // Verify channel exists
        const channel = await channelRepo.findById(id);
        if (!channel) {
            return NextResponse.json({ error: 'Channel not found' }, { status: 404 });
        }

        // Update favorite status
        const updatedChannel = await channelRepo.update(id, { favorite });

        return NextResponse.json({ channel: updatedChannel });
    } catch (error) {
        console.error('Error toggling channel favorite:', error);
        return NextResponse.json(
            { error: 'Failed to toggle channel favorite' },
            { status: 500 }
        );
    }
}
