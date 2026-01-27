import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/db/database';
import { ChannelRepository } from '@/lib/repositories';

/**
 * DELETE /api/channels/[id] - Delete a channel
 */
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
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
