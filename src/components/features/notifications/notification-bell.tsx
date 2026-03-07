'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Notification, NotificationType } from '@/lib/domain/models';
import { getNotificationTypeLabel } from '@/lib/utils/notification-helpers';

const SHOWN_TOAST_IDS_KEY = 'shownNotificationToastIds';
const MAX_STORED_IDS = 100; // Prevent localStorage bloat

function getShownToastIds(): Set<string> {
    try {
        const stored = localStorage.getItem(SHOWN_TOAST_IDS_KEY);
        if (stored) return new Set(JSON.parse(stored));
    } catch {
        // Ignore
    }
    return new Set();
}

function addShownToastId(id: string): void {
    try {
        const ids = getShownToastIds();
        ids.add(id);
        // Keep only the most recent IDs to prevent bloat
        const trimmed = Array.from(ids).slice(-MAX_STORED_IDS);
        localStorage.setItem(SHOWN_TOAST_IDS_KEY, JSON.stringify(trimmed));
    } catch {
        // Ignore
    }
}

export function NotificationBell() {
    const [unreadCount, setUnreadCount] = useState(0);
    const isInitialMount = useRef(true);
    const router = useRouter();

    const triggerToast = useCallback((notification: Notification) => {
        const title = getNotificationTypeLabel(notification.type);
        const description = notification.description;

        // Custom toasts based on type
        switch (notification.type) {
            case NotificationType.EPISODE_CREATION_FINALIZED:
                toast.success(title, {
                    description: `${notification.channelName}: ${description}`,
                    action: {
                        label: 'View',
                        onClick: () => router.push('/activity')
                    }
                });
                break;
            case NotificationType.EPISODE_CREATION_FAILED:
            case NotificationType.EPISODE_SENT_TO_LABCASTARR_FAILED:
                toast.error(title, {
                    description: description,
                    action: {
                        label: 'Details',
                        onClick: () => router.push('/activity')
                    }
                });
                break;
            case NotificationType.EPISODE_SENT_TO_LABCASTARR_COMPLETED:
                toast.success(title, {
                    description: description,
                    action: {
                        label: 'View',
                        onClick: () => router.push('/activity')
                    }
                });
                break;
            case NotificationType.EPISODE_SENT_TO_LABCASTARR_INITIATED:
            case NotificationType.EPISODE_INITIATED:
                // Optional: show info toast for starting background tasks
                toast.info(title, {
                    description: description
                });
                break;
        }
    }, [router]);


    const fetchUnreadCount = useCallback(async () => {
        try {
            const response = await fetch('/api/notifications?isRead=false&limit=1');
            if (!response.ok) return;
            const data = await response.json();
            setUnreadCount(data.total || 0);

            // If we have new notifications, check if we should trigger toasts
            if (data.items && data.items.length > 0) {
                const latest = data.items[0] as Notification;

                // Check against localStorage-persisted IDs to survive page navigations
                if (!isInitialMount.current) {
                    const shownIds = getShownToastIds();
                    if (!shownIds.has(latest.id)) {
                        triggerToast(latest);
                        addShownToastId(latest.id);
                    }
                } else {
                    // On initial mount, mark all unread notifications as "already seen"
                    // to avoid showing stale toasts when the user navigates to a new page.
                    addShownToastId(latest.id);
                }
            }

            isInitialMount.current = false;
        } catch (error) {
            console.error('Error fetching notifications for bell:', error);
        }
    }, [triggerToast]);

    useEffect(() => {
        // Initial fetch
        fetchUnreadCount();

        // Listen for episode-added and notification-updated events for immediate update
        const handleUpdate = () => {
            // Allow the next poll to show toasts for new notifications
            isInitialMount.current = false;
            fetchUnreadCount();
        };

        window.addEventListener('episode-added', handleUpdate);
        window.addEventListener('notification-updated', handleUpdate);
        return () => {
            window.removeEventListener('episode-added', handleUpdate);
            window.removeEventListener('notification-updated', handleUpdate);
        };
    }, [fetchUnreadCount]);


    useEffect(() => {
        // Set up polling interval (every 5 seconds)
        const intervalId = setInterval(fetchUnreadCount, 5000);
        return () => clearInterval(intervalId);
    }, [fetchUnreadCount]);

    const handleClick = async () => {
        // Clear badge immediately for better UX
        const currentUnread = unreadCount;
        setUnreadCount(0);

        try {
            // Mark all as read in background
            if (currentUnread > 0) {
                await fetch('/api/notifications', {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ all: true, isRead: true }),
                });
            }
        } catch (error) {
            console.error('Error marking notifications as read:', error);
        } finally {
            // Navigate to activity log
            router.push('/activity');
        }
    };


    return (
        <Button
            variant="ghost"
            size="icon"
            className="relative"
            onClick={handleClick}
            title="View Activity Log"
        >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
                <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-[10px] font-medium text-white ring-2 ring-background">
                    {unreadCount > 9 ? '9+' : unreadCount}
                </span>
            )}
        </Button>
    );
}

