'use client';

import { useState, useEffect, useCallback } from 'react';
import { MediaEpisode } from '@/lib/domain/models';
import { EpisodeCard } from './episode-card';
import { EpisodeListRow } from './episode-list-row';
import { GroupedEpisodeList } from './grouped-episode-list';
import { isDateBasedSort } from '@/lib/utils/date-grouping';
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
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { toast } from 'sonner';

interface EpisodeListProps {
    filters?: {
        search?: string;
        watched?: boolean;
        favorite?: boolean;
        channelId?: string;
        tagIds?: string[];
        watchStatus?: 'unwatched' | 'pending' | 'watched';
        isDeleted?: boolean;
    };
    sort?: {
        field: string;
        order: 'asc' | 'desc';
    };
    viewMode: 'grid' | 'list';
}

export function EpisodeList({ filters, sort, viewMode: initialViewMode }: EpisodeListProps) {
    const [episodes, setEpisodes] = useState<MediaEpisode[]>([]);
    const [loading, setLoading] = useState(true);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };
        
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    const viewMode = isMobile ? 'grid' : initialViewMode;


    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const fetchEpisodes = useCallback(async () => {
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
            if (filters?.watchStatus) params.append('watchStatus', filters.watchStatus);
            if (filters?.isDeleted !== undefined) params.append('isDeleted', String(filters.isDeleted));
            if (sort?.field) params.append('sort', sort.field);
            if (sort?.order) params.append('order', sort.order);

            const response = await fetch(`/api/episodes?${params.toString()}`);
            if (!response.ok) throw new Error('Failed to fetch episodes');

            const data = await response.json();
            setEpisodes(data.episodes);
        } catch (error) {
            console.error('Error fetching episodes:', error);
        } finally {
            setLoading(false);
        }
    }, [filters, sort]);

    useEffect(() => {
        fetchEpisodes();
    }, [fetchEpisodes]);

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;

        if (active.id !== over?.id) {
            setEpisodes((items) => {
                const oldIndex = items.findIndex((i) => i.id === active.id);
                const newIndex = items.findIndex((i) => i.id === over?.id);

                const newItems = arrayMove(items, oldIndex, newIndex);

                // Persist the new order
                const episodeIds = newItems.map(v => v.id);
                fetch('/api/episodes/reorder', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ episodeIds }),
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

    if (episodes.length === 0) {
        return (
            <div className="text-center py-12">
                <p className="text-muted-foreground text-lg">No episodes found</p>
                <p className="text-sm text-muted-foreground mt-2">
                    Add your first video or podcast to get started
                </p>
            </div>
        );
    }

    // If it's a date-based sort, use the grouped rendering
    if (sort && isDateBasedSort(sort.field)) {
        return (
            <div className="space-y-4">
                <GroupedEpisodeList
                    episodes={episodes}
                    sortField={sort.field}
                    sortOrder={sort.order}
                    viewMode={viewMode}
                    onUpdate={fetchEpisodes}
                    onDelete={fetchEpisodes}
                />
            </div>
        );
    }

    // Default: Flat list with drag-and-drop (for manual/custom order)
    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
        >
            <SortableContext
                items={episodes.map((e) => e.id)}
                strategy={
                    viewMode === 'grid'
                        ? rectSortingStrategy
                        : verticalListSortingStrategy
                }
            >
                <div
                    className={
                        viewMode === 'grid'
                            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'
                            : 'flex flex-col border rounded-md overflow-hidden bg-card/50'
                    }
                >
                    {episodes.map((episode) =>
                        viewMode === 'grid' ? (
                            <EpisodeCard
                                key={episode.id}
                                episode={episode}
                                onUpdate={fetchEpisodes}
                                onDelete={fetchEpisodes}
                            />
                        ) : (
                            <EpisodeListRow
                                key={episode.id}
                                episode={episode}
                                onUpdate={fetchEpisodes}
                                onDelete={fetchEpisodes}
                            />
                        )
                    )}
                </div>
            </SortableContext>
        </DndContext>
    );
}
