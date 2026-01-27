'use client';

import { useState, useEffect } from 'react';
import { Video } from '@/lib/domain/models';
import { VideoCard } from './video-card';
import { VideoListRow } from './video-list-row';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { LayoutGrid, List } from 'lucide-react';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    rectSortingStrategy,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { toast } from 'sonner';

interface VideoListProps {
    filters?: {
        search?: string;
        watched?: boolean;
        favorite?: boolean;
        channelId?: string;
        tagIds?: string[];
    };
    sort?: {
        field: string;
        order: 'asc' | 'desc';
    };
    viewMode: 'grid' | 'list';
}

export function VideoList({ filters, sort, viewMode }: VideoListProps) {
    const [videos, setVideos] = useState<Video[]>([]);
    const [loading, setLoading] = useState(true);

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const fetchVideos = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();

            if (filters?.search) params.append('search', filters.search);
            if (filters?.watched !== undefined) params.append('watched', String(filters.watched));
            if (filters?.favorite !== undefined) params.append('favorite', String(filters.favorite));
            if (filters?.channelId) params.append('channelId', filters.channelId);
            if (filters?.tagIds && filters.tagIds.length > 0) {
                params.append('tags', filters.tagIds.join(','));
            }
            if (sort?.field) params.append('sort', sort.field);
            if (sort?.order) params.append('order', sort.order);

            const response = await fetch(`/api/videos?${params.toString()}`);
            if (!response.ok) throw new Error('Failed to fetch videos');

            const data = await response.json();
            setVideos(data.videos);
        } catch (error) {
            console.error('Error fetching videos:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchVideos();
    }, [filters, sort]);

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;

        if (active.id !== over?.id) {
            setVideos((items) => {
                const oldIndex = items.findIndex((i) => i.id === active.id);
                const newIndex = items.findIndex((i) => i.id === over?.id);

                const newItems = arrayMove(items, oldIndex, newIndex);

                // Persist the new order
                const videoIds = newItems.map(v => v.id);
                fetch('/api/videos/reorder', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ videoIds }),
                }).catch(() => {
                    toast.error('Failed to save order');
                });

                return newItems;
            });
        }
    };

    if (loading) {
        return (
            <div className={viewMode === 'grid'
                ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
                : "flex flex-col gap-2"
            }>
                {[...Array(8)].map((_, i) => (
                    <div key={i} className={viewMode === 'grid' ? "space-y-3" : "flex gap-3 py-2"}>
                        <Skeleton className={viewMode === 'grid' ? "aspect-video w-full" : "w-40 aspect-video flex-shrink-0"} />
                        <div className="flex-1 space-y-2">
                            <Skeleton className="h-4 w-3/4" />
                            <Skeleton className="h-4 w-1/2" />
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    if (videos.length === 0) {
        return (
            <div className="text-center py-12">
                <p className="text-muted-foreground text-lg">No videos found</p>
                <p className="text-sm text-muted-foreground mt-2">
                    Add your first video to get started
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
            >
                <SortableContext
                    items={videos.map(v => v.id)}
                    strategy={viewMode === 'grid' ? rectSortingStrategy : verticalListSortingStrategy}
                >
                    <div className={viewMode === 'grid'
                        ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
                        : "flex flex-col border rounded-md overflow-hidden bg-card/50"
                    }>
                        {videos.map((video) => (
                            viewMode === 'grid' ? (
                                <VideoCard
                                    key={video.id}
                                    video={video}
                                    onUpdate={fetchVideos}
                                    onDelete={fetchVideos}
                                />
                            ) : (
                                <VideoListRow
                                    key={video.id}
                                    video={video}
                                    onUpdate={fetchVideos}
                                    onDelete={fetchVideos}
                                />
                            )
                        ))}
                    </div>
                </SortableContext>
            </DndContext>
        </div>
    );
}
