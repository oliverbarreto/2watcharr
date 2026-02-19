'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import Image from 'next/image';
import { Layout } from '@/components/layout';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Trash2, RefreshCw, Youtube, Mic, ChevronUp, ChevronDown, List, LayoutGrid } from 'lucide-react';
import { ChannelFilterBar } from '@/components/features/channels/channel-filter-bar';
import { ChannelListRow } from '@/components/features/channels/channel-list-row';
import { toast } from 'sonner';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
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
    useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface Tag {
    id: string;
    name: string;
    color: string | null;
}

interface Channel {
    id: string;
    type: 'video' | 'podcast';
    name: string;
    description: string | null;
    thumbnailUrl: string | null;
    url: string;
    episodeCount: number;
    tags?: Tag[];
    customOrder: number | null;
}

interface Filters {
    search?: string;
    type?: 'video' | 'podcast';
    tagIds?: string[];
}

interface ChannelCardProps {
    channel: Channel;
    highlightId: string | null;
    isSyncing: boolean;
    onDelete: (channel: Channel) => void;
    onSync: (channelId: string, channelUrl: string) => void;
}

function SortableChannelCard({ channel, highlightId, isSyncing, onDelete, onSync }: ChannelCardProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: channel.id });

    const [isExpanded, setIsExpanded] = useState(false);

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 50 : 0,
    };

    return (
        <Card
            ref={setNodeRef}
            style={style}
            className={`group relative hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden border-muted-foreground/10 aspect-square min-h-[280px] ${highlightId === channel.id ? 'ring-2 ring-primary ring-offset-2' : ''} ${isDragging ? 'opacity-50' : ''}`}
            onClick={(e) => {
                // If the click was on the channel link or a button, don't navigate
                if ((e.target as HTMLElement).closest('a') || (e.target as HTMLElement).closest('button')) {
                    return;
                }
                window.location.href = `/channels/${channel.id}`;
            }}
        >
            {/* Background Image */}
            <div className="absolute inset-0 z-0">
                {channel.thumbnailUrl ? (
                    <Image
                        src={channel.thumbnailUrl}
                        alt={channel.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                        unoptimized
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground text-4xl font-bold bg-accent/20">
                        {channel.name[0]}
                    </div>
                )}
                {/* Subtle vignette */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80" />
            </div>

            {/* Top Buttons (Delete & Sync) */}
            <div className="absolute top-2 right-2 left-2 z-30 flex justify-between opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onSync(channel.id, channel.url);
                    }}
                    disabled={isSyncing}
                    className={`p-2 bg-black/60 hover:bg-primary hover:text-white rounded-full backdrop-blur-md transition-colors text-white/90 border border-white/10 shadow-lg ${isSyncing ? 'cursor-not-allowed opacity-50' : ''}`}
                    title="Sync Metadata"
                >
                    <RefreshCw className={`h-4 w-4 ${isSyncing ? 'animate-spin' : ''}`} />
                </button>

                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onDelete(channel);
                    }}
                    className="p-2 bg-black/60 hover:bg-destructive hover:text-white rounded-full backdrop-blur-md transition-colors text-white/90 border border-white/10 shadow-lg"
                    title="Delete Source"
                >
                    <Trash2 className="h-4 w-4" />
                </button>
            </div>

            {/* Channel Info Overlay - Full Screen on Hover/Expanded */}
            <div className={`absolute inset-x-0 bottom-0 z-20 p-5 bg-black/40 backdrop-blur-md border border-white/10 transition-all duration-300 flex flex-col ${isExpanded ? 'h-full bg-black/70' : 'h-[40%] group-hover:h-full group-hover:bg-black/70'}`}>
                <div className={`flex-1 overflow-hidden transition-all duration-300 ${isExpanded ? 'pt-12' : 'group-hover:pt-12'}`}>
                    <div className="flex justify-between items-start">
                        <a
                            href={channel.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xl font-bold text-red-600 hover:text-red-500 transition-colors line-clamp-1 block mb-1 leading-none relative z-10 flex-1"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {channel.name}
                        </a>
                    </div>
                    <div className="flex items-center gap-2 mb-2">
                        {channel.type === 'podcast' ? (
                            <Mic className="h-4 w-4 text-purple-500" />
                        ) : (
                            <div className="bg-red-600 rounded-sm p-0.5 flex items-center justify-center">
                                <Youtube className="h-3 w-3 text-white fill-current" />
                            </div>
                        )}
                        <span className="text-sm font-bold text-red-600">
                            {channel.episodeCount} {channel.episodeCount === 1 ? 'episode' : 'episodes'}
                        </span>
                    </div>

                    {channel.description && channel.description !== "No description available. Sync metadata to refresh." && (
                        <p className={`text-[12px] text-white/90 leading-tight transition-all duration-300 ${isExpanded ? 'line-clamp-none' : 'line-clamp-2 md:group-hover:line-clamp-none group-active:line-clamp-none'}`}>
                            {channel.description}
                        </p>
                    )}
                </div>

                {channel.tags && channel.tags.length > 0 && (
                    <div className={`flex flex-wrap gap-2 mt-2 transition-all duration-300 ${isExpanded ? 'mt-4' : 'group-hover:mt-4'}`}>
                        {channel.tags.map((tag, idx) => (
                            <Badge
                                key={tag.id}
                                variant="outline"
                                className={`text-[10px] px-3 py-0.5 h-6 rounded-full border-none font-medium bg-[#3d2b1f] text-[#f59e0b] border border-[#f59e0b]/20 ${idx >= 2 ? (isExpanded ? 'flex' : 'hidden group-hover:flex') : ''}`}
                                style={tag.color ? {
                                    backgroundColor: `${tag.color}20`,
                                    color: tag.color,
                                    borderColor: `${tag.color}40`,
                                    borderWidth: '1px'
                                } : undefined}
                            >
                                {tag.name}
                            </Badge>
                        ))}
                    </div>
                )}

                {/* Mobile Toggle Button - Bottom Right */}
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        setIsExpanded(!isExpanded);
                    }}
                    className="md:hidden absolute bottom-5 right-5 z-30 w-6 h-6 flex items-center justify-center bg-black/60 hover:bg-black/80 rounded-full transition-all text-white shadow-lg active:scale-90"
                    aria-label={isExpanded ? "Collapse" : "Expand"}
                >
                    {isExpanded ? (
                        <ChevronDown className="h-4 w-4 stroke-[3]" />
                    ) : (
                        <ChevronUp className="h-4 w-4 stroke-[3]" />
                    )}
                </button>
            </div>

            {/* Drag Handle - Bottom as requested, visible only on hover */}
            <div
                {...attributes}
                {...listeners}
                className="absolute bottom-0 left-0 w-full h-1.5 bg-red-600 opacity-0 group-hover:opacity-100 transition-all duration-300 z-40 cursor-grab active:cursor-grabbing"
            />
        </Card>
    );
}

function ChannelsPageContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const highlightId = searchParams.get('channelId');
    const [channels, setChannels] = useState<Channel[]>([]);
    const [loading, setLoading] = useState(true);
    const [syncingChannelId, setSyncingChannelId] = useState<string | null>(null);
    const [channelToDelete, setChannelToDelete] = useState<Channel | null>(null);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>(() => {
        if (typeof window !== 'undefined') {
            return (localStorage.getItem('channelViewMode') as 'grid' | 'list') || 'grid';
        }
        return 'grid';
    });

    const toggleViewMode = () => {
        const newMode = viewMode === 'grid' ? 'list' : 'grid';
        setViewMode(newMode);
        localStorage.setItem('channelViewMode', newMode);
    };

    // Derive filters from searchParams
    const filters: Filters = {
        search: searchParams.get('search') || undefined,
        type: (searchParams.get('type') as Filters['type']) || undefined,
        tagIds: searchParams.get('tagIds')?.split(',').filter(Boolean) || undefined,
    };

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const fetchChannels = useCallback(async () => {
        try {
            const params = new URLSearchParams();
            if (filters.search) params.set('search', filters.search);
            if (filters.type) params.set('type', filters.type);
            if (filters.tagIds) params.set('tagIds', filters.tagIds.join(','));

            const response = await fetch(`/api/channels?${params.toString()}`);
            if (!response.ok) throw new Error('Failed to fetch channels');

            const data = await response.json();
            setChannels(data.channels);
        } catch (error) {
            console.error('Error fetching channels:', error);
            toast.error('Failed to fetch channels');
        } finally {
            setLoading(false);
        }
    }, [filters.search, filters.type, filters.tagIds?.join(',')]); // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        fetchChannels();
    }, [fetchChannels]);

    const handleFilterChange = (newFilters: Filters) => {
        const params = new URLSearchParams(searchParams.toString());
        
        if (newFilters.search) params.set('search', newFilters.search); else params.delete('search');
        if (newFilters.type) params.set('type', newFilters.type); else params.delete('type');
        if (newFilters.tagIds?.length) params.set('tagIds', newFilters.tagIds.join(',')); else params.delete('tagIds');

        router.push(`/channels?${params.toString()}`);
    };

    const handleSyncChannel = async (channelId: string, channelUrl: string) => {
        setSyncingChannelId(channelId);
        try {
            const response = await fetch(`/api/channels/${channelId}/sync`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url: channelUrl })
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || 'Sync failed');
            }

            toast.success('Channel metadata synced successfully');
            fetchChannels();
        } catch (error) {
            console.error('Error syncing channel:', error);
            toast.error(error instanceof Error ? error.message : 'Failed to sync channel metadata');
        } finally {
            setSyncingChannelId(null);
        }
    };

    const handleDeleteChannel = async () => {
        if (!channelToDelete) return;

        try {
            const response = await fetch(`/api/channels/${channelToDelete.id}`, {
                method: 'DELETE',
            });

            if (!response.ok) throw new Error('Failed to delete channel');

            toast.success('Channel deleted successfully');
            fetchChannels();
        } catch (error) {
            console.error('Error deleting channel:', error);
            toast.error('Failed to delete channel');
        } finally {
            setChannelToDelete(null);
        }
    };

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;

        if (active.id !== over?.id) {
            setChannels((items) => {
                const oldIndex = items.findIndex((i) => i.id === active.id);
                const newIndex = items.findIndex((i) => i.id === over?.id);

                const newItems = arrayMove(items, oldIndex, newIndex);

                // Persist the new order
                const channelIds = newItems.map(c => c.id);
                fetch('/api/channels/reorder', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ channelIds }),
                }).catch(() => {
                    toast.error('Failed to save order');
                });

                return newItems;
            });
        }
    };

    if (loading) {
        return (
            <Layout>
                <div className="space-y-6">
                    <div className="flex justify-between items-center">
                        <h1 className="text-3xl font-bold">Channels & Podcasts</h1>
                        <Skeleton className="h-10 w-32" />
                    </div>
                    <div className={viewMode === 'grid' 
                        ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
                        : "flex flex-col gap-2"
                    }>
                        {[...Array(8)].map((_, i) => (
                            <div key={i} className={viewMode === 'grid' ? "" : "flex gap-3 py-2 border-b last:border-0"}>
                                <Card className={viewMode === 'grid' 
                                    ? "aspect-square min-h-[280px] relative overflow-hidden" 
                                    : "h-20 w-full flex items-center gap-4 px-4 border-none bg-transparent"
                                }>
                                    {viewMode === 'grid' ? (
                                        <>
                                            <div className="absolute inset-x-0 bottom-0 h-1/3 p-4 bg-muted/20 backdrop-blur-sm border-t border-white/5">
                                                <div className="flex items-start gap-3 h-full items-center">
                                                    <Skeleton className="h-8 w-8 rounded-lg" />
                                                    <div className="flex-1 space-y-2">
                                                        <Skeleton className="h-5 w-3/4" />
                                                        <Skeleton className="h-4 w-1/2" />
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="absolute bottom-0 left-0 w-full h-1.5 bg-muted/30 z-30" />
                                        </>
                                    ) : (
                                        <>
                                            <Skeleton className="h-14 w-14 rounded-md flex-shrink-0" />
                                            <div className="flex-1 space-y-2">
                                                <Skeleton className="h-4 w-1/4" />
                                                <Skeleton className="h-3 w-1/2" />
                                            </div>
                                            <div className="flex gap-2">
                                                <Skeleton className="h-8 w-8 rounded-md" />
                                                <Skeleton className="h-8 w-8 rounded-md" />
                                            </div>
                                        </>
                                    )}
                                </Card>
                            </div>
                        ))}
                    </div>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold">Channels & Podcasts</h1>
                        <p className="text-muted-foreground">
                            All sources from your saved content
                        </p>
                    </div>
                    <Button variant="ghost" size="sm" onClick={toggleViewMode} className="gap-2 hidden md:flex">
                        {viewMode === 'grid' ? (
                            <>
                                <List className="h-4 w-4" />
                                List View
                            </>
                        ) : (
                            <>
                                <LayoutGrid className="h-4 w-4" />
                                Grid View
                            </>
                        )}
                    </Button>
                </div>

                <ChannelFilterBar onFilterChange={handleFilterChange} initialFilters={filters} />

                {channels.length === 0 ? (
                    <div className="text-center py-12">
                        <p className="text-muted-foreground text-lg">No content yet</p>
                        <p className="text-sm text-muted-foreground mt-2">
                            Add videos or podcasts to see sources here
                        </p>
                    </div>
                ) : (
                    <DndContext
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragEnd={handleDragEnd}
                    >
                        <SortableContext
                            items={channels.map(c => c.id)}
                            strategy={viewMode === 'grid' ? rectSortingStrategy : verticalListSortingStrategy}
                        >
                            <div className={viewMode === 'grid' 
                                ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                                : "flex flex-col border rounded-md overflow-hidden bg-card/50"
                            }>
                                {channels.map((channel) => (
                                    viewMode === 'grid' ? (
                                        <SortableChannelCard
                                            key={channel.id}
                                            channel={channel}
                                            highlightId={highlightId}
                                            isSyncing={syncingChannelId === channel.id}
                                            onDelete={setChannelToDelete}
                                            onSync={handleSyncChannel}
                                        />
                                    ) : (
                                        <ChannelListRow
                                            key={channel.id}
                                            channel={channel}
                                            isSyncing={syncingChannelId === channel.id}
                                            onDelete={setChannelToDelete}
                                            onSync={handleSyncChannel}
                                        />
                                    )
                                ))}
                            </div>
                        </SortableContext>
                    </DndContext>
                )}
            </div>

            <Dialog open={!!channelToDelete} onOpenChange={(open: boolean) => !open && setChannelToDelete(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Are you absolutely sure?</DialogTitle>
                        <DialogDescription>
                            This will remove <strong>{channelToDelete?.name}</strong> from your list.
                            The episodes from this source will still remain in your list.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setChannelToDelete(null)}>
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={handleDeleteChannel}>
                            Delete
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </Layout>
    );
}

export default function ChannelsPage() {
    return (
        <Suspense fallback={
            <Layout>
                <div className="space-y-6">
                    <div className="flex justify-between items-center">
                        <h1 className="text-3xl font-bold">Channels & Podcasts</h1>
                        <Skeleton className="h-10 w-32" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {[...Array(8)].map((_, i) => (
                            <Card key={i} className="aspect-square min-h-[280px] relative overflow-hidden">
                                <div className="absolute inset-x-0 bottom-0 h-1/3 p-4 bg-muted/20 backdrop-blur-sm border-t border-white/5">
                                    <div className="flex items-start gap-3 h-full items-center">
                                        <Skeleton className="h-8 w-8 rounded-lg" />
                                        <div className="flex-1 space-y-2">
                                            <Skeleton className="h-5 w-3/4" />
                                            <Skeleton className="h-4 w-1/2" />
                                        </div>
                                    </div>
                                </div>
                                <div className="absolute bottom-0 left-0 w-full h-1.5 bg-muted/30 z-30" />
                            </Card>
                        ))}
                    </div>
                </div>
            </Layout>
        }>
            <ChannelsPageContent />
        </Suspense>
    );
}
