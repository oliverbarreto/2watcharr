import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/db/database';
import { VideoService } from '@/lib/services';
import { z } from 'zod';

const reorderSchema = z.object({
    position: z.enum(['beginning', 'end']),
});

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const body = await request.json();
        const { position } = reorderSchema.parse(body);
        const { id } = await params;

        const db = await getDatabase();
        const videoService = new VideoService(db);

        if (position === 'beginning') {
            await videoService.moveToBeginning(id);
        } else {
            await videoService.moveToEnd(id);
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error reordering video:', error);

        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: 'Invalid request data', details: error.issues },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { error: 'Failed to reorder video' },
            { status: 500 }
        );
    }
}
