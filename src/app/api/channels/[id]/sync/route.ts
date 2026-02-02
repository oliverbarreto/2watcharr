import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { getDatabase } from '@/lib/db/database';
import { MediaService } from '@/lib/services';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { url } = await request.json();
    const db = await getDatabase();
    const mediaService = new MediaService(db);
    // Sync single channel metadata
    await mediaService.syncChannelMetadata(resolvedParams.id, url);

    return NextResponse.json({
      success: true,
      message: 'Channel metadata synced successfully',
    });
  } catch (error) {
    console.error('Error syncing channel:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to sync channel' },
      { status: 500 }
    );
  }
}
