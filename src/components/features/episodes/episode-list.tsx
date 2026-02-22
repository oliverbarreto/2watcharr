'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { MediaEpisode } from '@/lib/domain/models';
import { EpisodeCard } from './episode-card';
import { EpisodeListRow } from './episode-list-row';
import { GroupedEpisodeList } from './grouped-episode-list';
import { isDateBasedSort } from '@/lib/utils/date-grouping';
import { Skeleton } from '@/components/ui/skeleton';
import { Loader2 } from 'lucide-react';
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

const PAGE_SIZE = 100;

interface EpisodeListProps {
    filters?: {
        search?: string;
        watched?: boolean;
        favorite?: boolean;
        channelId?: string;
        channelIds?: string[];
        tagIds?: string[];
        watchStatus?: 'unwatched' | 'pending' | 'watched';
        isDeleted?: boolean;
        hasNotes?: boolean;
        type?: 'video' | 'podcast';
        isShort?: boolean;
        likeStatus?: 'none' | 'like' | 'dislike';
        priority?: 'none' | 'low' | 'medium' | 'high';
    };
    sort?: {
        field: string;
        order: 'asc' | 'desc';
    };
    viewMode: 'grid' | 'list';
    onCountChange?: (current: number, total: number) => void;
    onChannelsChange?: (channels: { id: string; name: string }[] | ((prev: { id: string; name: string }[]) => { id: string; name: string }[])) => void;
    showReorderOptions?: boolean;
}

export function EpisodeList({ filters, sort, viewMode: initialViewMode, onCountChange, onChannelsChange, showReorderOptions = true }: EpisodeListProps) {
    const [episodes, setEpisodes] = useState<MediaEpisode[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [totalCount, setTotalCount] = useState(0);
    const [offset, setOffset] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [isMobile, setIsMobile] = useState(false);
    
    const observerTarget = useRef<HTMLDivElement>(null);
    const [showBubble, setShowBubble] = useState(false);
    const bubbleTimeoutRef = useRef<NodeJS.Timeout>(null);

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

    const fetchEpisodes = useCallback(async (currentOffset: number = 0, append: boolean = false, silent: boolean = false) => {
        if (!silent) {
            if (currentOffset === 0) {
                setLoading(true);
            } else {
                setLoadingMore(true);
            }
        }

        try {
            const params = new URLSearchParams();

            if (filters?.search) params.append('search', filters.search);
            if (filters?.watched !== undefined) params.append('watched', String(filters.watched));
            if (filters?.favorite !== undefined) params.append('favorite', String(filters.favorite));
            if (filters?.channelId) params.append('channelId', filters.channelId);
            if (filters?.channelIds && filters.channelIds.length > 0) {
                params.append('channels', filters.channelIds.join(','));
            }
            if (filters?.tagIds && filters.tagIds.length > 0) {
                params.append('tags', filters.tagIds.join(','));
            }
            if (filters?.watchStatus) params.append('watchStatus', filters.watchStatus);
            if (filters?.isDeleted !== undefined) params.append('isDeleted', String(filters.isDeleted));
            if (filters?.hasNotes !== undefined) params.append('hasNotes', String(filters.hasNotes));
            if (filters?.type) params.append('type', filters.type);
            if (filters?.isShort !== undefined) params.append('isShort', String(filters.isShort));
            if (filters?.likeStatus !== undefined) params.append('likeStatus', filters.likeStatus);
            if (filters?.priority !== undefined) params.append('priority', filters.priority);
            if (sort?.field) params.append('sort', sort.field);
            if (sort?.order) params.append('order', sort.order);
            
            // Add pagination params
            params.append('limit', String(PAGE_SIZE));
            params.append('offset', String(currentOffset));

            const response = await fetch(`/api/episodes?${params.toString()}`);
            if (!response.ok) throw new Error('Failed to fetch episodes');

            const data = await response.json();
            
            if (append) {
                setEpisodes(prev => [...prev, ...data.episodes]);
            } else {
                setEpisodes(data.episodes);
                
                // Extract unique channels for the filter menu
                if (onChannelsChange) {
                    const channelsMap = new Map<string, {id: string, name: string}>();
                    data.episodes.forEach((ep: MediaEpisode) => {
                        if (ep.channelId && ep.channelName) {
                            channelsMap.set(ep.channelId, { id: ep.channelId, name: ep.channelName });
                        }
                    });
                    const newChannels = Array.from(channelsMap.values());
                    
                    // Only trigger update if channels have actually changed (shallow comparison is enough for IDs)
                    onChannelsChange((prev: { id: string; name: string }[]) => {
                        const prevIds = (prev || []).map((c: { id: string; name: string }) => c.id).sort().join(',');
                        const nextIds = newChannels.map((c: { id: string; name: string }) => c.id).sort().join(',');
                        if (prevIds === nextIds) return prev;
                        return newChannels;
                    });
                }
            }
            
            setTotalCount(data.total);
            setHasMore(data.episodes.length === PAGE_SIZE && (currentOffset + data.episodes.length) < data.total);
            setOffset(currentOffset);

            // Show floating bubble when loading more
            if (append) {
                setShowBubble(true);
                if (bubbleTimeoutRef.current) clearTimeout(bubbleTimeoutRef.current);
                bubbleTimeoutRef.current = setTimeout(() => {
                    setShowBubble(false);
                }, 5000);
            }
        } catch (error) {
            console.error('Error fetching episodes:', error);
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    }, [JSON.stringify(filters), JSON.stringify(sort), onChannelsChange]); // eslint-disable-line react-hooks/exhaustive-deps

    // Reset pagination when filters or sort change
    const channelIdsStr = filters?.channelIds?.join(',');
    const tagIdsStr = filters?.tagIds?.join(',');
    useEffect(() => {
        fetchEpisodes(0, false);
    }, [filters?.search, filters?.watched, filters?.favorite, filters?.hasNotes, filters?.type, filters?.isShort, filters?.likeStatus, filters?.priority, filters?.channelId, channelIdsStr, tagIdsStr, filters?.watchStatus, filters?.isDeleted, sort?.field, sort?.order, fetchEpisodes]);

    // Intersection Observer for infinite scroll
    useEffect(() => {
        const observer = new IntersectionObserver(
            entries => {
                if (entries[0].isIntersecting && hasMore && !loadingMore && !loading) {
                    fetchEpisodes(offset + PAGE_SIZE, true);
                }
            },
            { threshold: 1.0 }
        );

        if (observerTarget.current) {
            observer.observe(observerTarget.current);
        }

        return () => observer.disconnect();
    }, [hasMore, loadingMore, loading, offset, fetchEpisodes]);

    useEffect(() => {
        if (onCountChange) {
            onCountChange(episodes.length, totalCount);
        }
    }, [episodes.length, totalCount, onCountChange]);

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

    const handleUpdate = () => fetchEpisodes(0, false, true);

    if (loading && offset === 0) {
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

    if (episodes.length === 0 && !loading) {
        return (
            <div className="text-center py-12">
                <p className="text-muted-foreground text-lg">No episodes found</p>
                <p className="text-sm text-muted-foreground mt-2">
                    Add your first video or podcast to get started
                </p>
            </div>
        );
    }

    // Combine episodes rendering to avoid duplication
    const renderEpisodes = () => {
        if (sort && isDateBasedSort(sort.field)) {
            return (
                <div className="space-y-4">
                    <GroupedEpisodeList
                        episodes={episodes}
                        sortField={sort.field}
                        sortOrder={sort.order}
                        viewMode={viewMode}
                        onUpdate={handleUpdate}
                        onDelete={handleUpdate}
                    />
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
                                    onUpdate={handleUpdate}
                                    onDelete={handleUpdate}
                                    isDraggable={showReorderOptions && sort?.field === 'custom'}
                                    showReorderOptions={showReorderOptions}
                                />
                            ) : (
                                <EpisodeListRow
                                    key={episode.id}
                                    episode={episode}
                                    onUpdate={handleUpdate}
                                    onDelete={handleUpdate}
                                    isDraggable={showReorderOptions && sort?.field === 'custom'}
                                    showReorderOptions={showReorderOptions}
                                />
                            )
                        )}
                    </div>
                </SortableContext>
            </DndContext>
        );
    };

    return (
        <div className="space-y-4">
            {renderEpisodes()}
            
            {/* Infinite Scroll Trigger & Loading More Indicator */}
            <div ref={observerTarget} className="h-10 flex items-center justify-center">
                {loadingMore && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Loading more...</span>
                    </div>
                )}
            </div>

            {/* Floating Count Bubble */}
            <div className={`fixed bottom-6 left-6 z-50 transition-all duration-500 transform ${
                showBubble ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0 pointer-events-none'
            }`}>
                <div className="bg-primary text-primary-foreground px-4 py-2 rounded-full shadow-lg border border-primary/20 flex items-center gap-2 backdrop-blur-sm bg-primary/90">
                    <span className="text-sm font-medium">
                        Showing {episodes.length} of {totalCount} episodes
                    </span>
                </div>
            </div>
        </div>
    );
}
