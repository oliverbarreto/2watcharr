import { NextRequest, NextResponse } from 'next/server';
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
        const body = await request.json();
        const { position } = reorderSchema.parse(body);
        const { id } = await params;

        const db = await getDatabase();
        const mediaService = new MediaService(db);

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
