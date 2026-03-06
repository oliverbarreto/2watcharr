'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Notification, NotificationType } from '@/lib/domain/models';
import { getNotificationTypeLabel } from '@/lib/utils/notification-helpers';

export function NotificationBell() {
    const [unreadCount, setUnreadCount] = useState(0);
    const [lastNotificationId, setLastNotificationId] = useState<string | null>(null);
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

                // If this is a new notification and not the one we saw last
                if (latest.id !== lastNotificationId) {
                    // Don't toast on initial mount to avoid spam
                    if (!isInitialMount.current) {
                        triggerToast(latest);
                    }
                    setLastNotificationId(latest.id);
                }
            }

            isInitialMount.current = false;
        } catch (error) {
            console.error('Error fetching notifications for bell:', error);
        }
    }, [lastNotificationId, triggerToast]);

    useEffect(() => {
        // Initial fetch
        fetchUnreadCount();


        // Listen for episode-added event for immediate update
        const handleEpisodeAdded = () => {
            fetchUnreadCount();
        };

        window.addEventListener('episode-added', handleEpisodeAdded);
        return () => window.removeEventListener('episode-added', handleEpisodeAdded);
    }, [fetchUnreadCount]);


    useEffect(() => {
        // Set up polling interval (every 5 seconds for V2)
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

