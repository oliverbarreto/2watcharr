import { NextRequest, NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { getDatabase } from '@/lib/db/database';
import { NotificationService } from '@/lib/services/notification.service';
import { NotificationType } from '@/lib/domain/models';

/**
 * GET /api/notifications - List notifications with optional filters and pagination
 */
export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        const userId = (session.user as { id: string }).id;

        const { searchParams } = new URL(request.url);
        const type = searchParams.get('type') as NotificationType | undefined;
        const isRead = searchParams.get('isRead') === 'true' ? true : (searchParams.get('isRead') === 'false' ? false : undefined);
        const search = searchParams.get('search') || undefined;
        const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined;
        const offset = searchParams.get('offset') ? parseInt(searchParams.get('offset')!) : undefined;

        const db = await getDatabase();
        const notificationService = new NotificationService(db);

        const { items, total } = await notificationService.getNotifications(
            userId,
            { type, isRead, search },
            { limit, offset }
        );

        return NextResponse.json({ items, total });
    } catch (error) {
        console.error('Error listing notifications:', error);
        return NextResponse.json(
            { error: 'Failed to list notifications' },
            { status: 500 }
        );
    }
}

/**
 * PATCH /api/notifications - Bulk mark as read/unread
 */
export async function PATCH(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        const userId = (session.user as { id: string }).id;

        const body = await request.json();
        const { ids, isRead, all } = body;

        const db = await getDatabase();
        const notificationService = new NotificationService(db);

        if (all) {
            await notificationService.markAllAsRead(userId);
        } else if (ids && Array.isArray(ids)) {
            if (isRead) {
                await notificationService.markAsRead(ids, userId);
            } else {
                await notificationService.markAsUnread(ids, userId);
            }
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error updating notifications:', error);
        return NextResponse.json(
            { error: 'Failed to update notifications' },
            { status: 500 }
        );
    }
}

/**
 * DELETE /api/notifications - Bulk delete
 */
export async function DELETE(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        const userId = (session.user as { id: string }).id;

        const { searchParams } = new URL(request.url);
        const deleteRead = searchParams.get('read') === 'true';
        const deleteAll = searchParams.get('all') === 'true';

        const db = await getDatabase();
        const notificationService = new NotificationService(db);

        if (deleteAll) {
            await notificationService.deleteAllNotifications(userId);
        } else if (deleteRead) {
            await notificationService.deleteReadNotifications(userId);
        } else {
            const body = await request.json().catch(() => ({}));
            const { ids } = body;
            if (ids && Array.isArray(ids)) {
                await notificationService.deleteNotifications(ids, userId);
            }
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting notifications:', error);
        return NextResponse.json(
            { error: 'Failed to delete notifications' },
            { status: 500 }
        );
    }
}
