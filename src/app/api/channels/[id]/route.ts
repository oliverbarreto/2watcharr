import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { getDatabase } from '@/lib/db/database';
import { ChannelRepository } from '@/lib/repositories';

/**
 * GET /api/channels/[id] - Get a channel's details
 */
export async function GET(
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

        const db = await getDatabase();
        const channelRepo = new ChannelRepository(db);

        const channels = await channelRepo.getChannelsWithEpisodeCount({ 
            id, 
            userId: (session.user as { id: string }).id 
        });

        if (channels.length === 0) {
            return NextResponse.json({ error: 'Channel not found' }, { status: 404 });
        }

        return NextResponse.json({ channel: channels[0] });
    } catch (error) {
        console.error('Error fetching channel:', error);
        return NextResponse.json(
            { error: 'Failed to fetch channel' },
            { status: 500 }
        );
    }
}

/**
 * DELETE /api/channels/[id] - Delete a channel
 */
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user || !(session.user as { isAdmin?: boolean }).isAdmin) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;
        if (!id) {
            return NextResponse.json({ error: 'Channel ID is required' }, { status: 400 });
        }

        const db = await getDatabase();
        const channelRepo = new ChannelRepository(db);

        await channelRepo.delete(id);

        return new NextResponse(null, { status: 204 });
    } catch (error) {
        console.error('Error deleting channel:', error);
        return NextResponse.json(
            { error: 'Failed to delete channel' },
            { status: 500 }
        );
    }
}
