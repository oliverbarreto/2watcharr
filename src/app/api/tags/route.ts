import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { getDatabase } from '@/lib/db/database';
import { TagRepository } from '@/lib/repositories';
import { z } from 'zod';

// Request validation schema
const createTagSchema = z.object({
    name: z.string().min(1, 'Tag name is required'),
    color: z.string().optional(),
});

/**
 * POST /api/tags - Create a new tag
 */
export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        const userId = (session.user as { id: string }).id;

        const body = await request.json();
        const data = createTagSchema.parse(body);

        const db = await getDatabase();
        const tagRepo = new TagRepository(db);

        // Check if tag already exists for THIS user
        const existing = await tagRepo.findByName(data.name, userId);
        if (existing) {
            return NextResponse.json(
                { error: 'Tag with this name already exists' },
                { status: 400 }
            );
        }

        const tag = await tagRepo.create({
            ...data,
            userId,
        });

        return NextResponse.json(tag, { status: 201 });
    } catch (error) {
        console.error('Error creating tag:', error);

        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: 'Invalid request data', details: error.issues },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { error: 'Failed to create tag' },
            { status: 500 }
        );
    }
}

/**
 * GET /api/tags - List all tags with episode counts
 */
export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        const userId = (session.user as { id: string }).id;

        const { searchParams } = new URL(request.url);
        const sort = (searchParams.get('sort') || 'alphabetical') as 'alphabetical' | 'usage' | 'recent';

        if (!['alphabetical', 'usage', 'recent'].includes(sort)) {
            return NextResponse.json({ error: 'Invalid sort parameter' }, { status: 400 });
        }

        const db = await getDatabase();
        const tagRepo = new TagRepository(db);

        const tags = await tagRepo.getTagsWithEpisodeCount(userId, sort);

        return NextResponse.json({ tags });
    } catch (error) {
        console.error('Error listing tags:', error);
        return NextResponse.json(
            { error: 'Failed to list tags' },
            { status: 500 }
        );
    }
}
