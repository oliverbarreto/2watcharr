import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { getDatabase } from '@/lib/db/database';
import { TagRepository } from '@/lib/repositories';

import { z } from 'zod';

const updateTagSchema = z.object({
    name: z.string().min(1).optional(),
    color: z.string().optional(),
});

/**
 * PATCH /api/tags/[id] - Update a tag
 */
export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        const userId = (session.user as { id: string }).id;

        const { id } = await params;
        const body = await request.json();
        const data = updateTagSchema.parse(body);

        const db = await getDatabase();
        const tagRepo = new TagRepository(db);

        // Check ownership
        const existing = await tagRepo.findById(id);
        if (!existing || existing.userId !== userId) {
            return NextResponse.json({ error: 'Tag not found' }, { status: 404 });
        }

        const tag = await tagRepo.update(id, data);

        return NextResponse.json(tag);
    } catch (error) {
        console.error('Error updating tag:', error);
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: 'Invalid request data', details: error.issues },
                { status: 400 }
            );
        }
        return NextResponse.json(
            { error: 'Failed to update tag' },
            { status: 500 }
        );
    }
}

/**
 * DELETE /api/tags/[id] - Delete a tag
 */
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        const userId = (session.user as { id: string }).id;

        const { id } = await params;
        const db = await getDatabase();
        const tagRepo = new TagRepository(db);

        // Check ownership
        const existing = await tagRepo.findById(id);
        if (!existing || existing.userId !== userId) {
            return NextResponse.json({ error: 'Tag not found' }, { status: 404 });
        }

        await tagRepo.delete(id);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting tag:', error);
        return NextResponse.json(
            { error: 'Failed to delete tag' },
            { status: 500 }
        );
    }
}
