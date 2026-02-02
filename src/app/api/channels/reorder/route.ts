import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { getDatabase } from '@/lib/db/database';

/**
 * POST /api/channels/reorder - Reorder channels
 */
export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { channelIds } = await request.json();
        if (!Array.isArray(channelIds)) {
            return NextResponse.json({ error: 'channelIds array is required' }, { status: 400 });
        }

        const db = await getDatabase();
        
        // Update custom_order for each channel
        // Note: Using a transaction for efficiency
        await db.run('BEGIN TRANSACTION');
        try {
            for (let i = 0; i < channelIds.length; i++) {
                await db.run(
                    'UPDATE channels SET custom_order = ? WHERE id = ?',
                    [i, channelIds[i]]
                );
            }
            await db.run('COMMIT');
        } catch (error) {
            await db.run('ROLLBACK');
            throw error;
        }

        return NextResponse.json({ message: 'Order updated successfully' });
    } catch (error) {
        console.error('Error reordering channels:', error);
        return NextResponse.json(
            { error: 'Failed to reorder channels' },
            { status: 500 }
        );
    }
}
