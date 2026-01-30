import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { getDatabase } from '@/lib/db/database';
import { MediaService } from '@/lib/services';
import { z } from 'zod';

const reorderSchema = z.object({
    position: z.enum(['beginning', 'end']),
});

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        const userId = (session.user as any).id;

        const body = await request.json();
        const { position } = reorderSchema.parse(body);
        const { id } = await params;

        const db = await getDatabase();
        const mediaService = new MediaService(db);

        // Check ownership
        const episode = await mediaService.getEpisode(id);
        if (!episode || episode.userId !== userId) {
            return NextResponse.json({ error: 'Episode not found' }, { status: 404 });
        }

        if (position === 'beginning') {
            await mediaService.moveToBeginning(id);
        } else {
            await mediaService.moveToEnd(id);
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error reordering episode:', error);

        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: 'Invalid request data', details: error.issues },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { error: 'Failed to reorder episode' },
            { status: 500 }
        );
    }
}
