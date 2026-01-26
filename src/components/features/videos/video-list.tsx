'use client';

import { useState, useEffect } from 'react';
import { Video } from '@/lib/domain/models';
import { VideoCard } from './video-card';
import { Skeleton } from '@/components/ui/skeleton';
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
} from '@dnd-kit/sortable';
import { toast } from 'sonner';

interface VideoListProps {
    filters?: {
        search?: string;
        watched?: boolean;
        favorite?: boolean;
    };
    sort?: {
        field: string;
        order: 'asc' | 'desc';
    };
}

export function VideoList({ filters, sort }: VideoListProps) {
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {[...Array(8)].map((_, i) => (
                    <div key={i} className="space-y-3">
                        <Skeleton className="aspect-video w-full" />
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-4 w-1/2" />
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
        <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
        >
            <SortableContext
                items={videos.map(v => v.id)}
                strategy={rectSortingStrategy}
            >
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {videos.map((video) => (
                        <VideoCard
                            key={video.id}
                            video={video}
                            onUpdate={fetchVideos}
                            onDelete={fetchVideos}
                        />
                    ))}
                </div>
            </SortableContext>
        </DndContext>
    );
}
