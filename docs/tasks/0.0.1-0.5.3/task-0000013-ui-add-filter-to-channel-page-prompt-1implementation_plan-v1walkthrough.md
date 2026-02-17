# Walkthrough: Channels Page Filtering

I have successfully implemented filtering capabilities on the Channels page, allowing you to easily find and organize your content sources.

## Key Accomplishments

### 1. New Channels Filter Bar
- Created a dedicated [ChannelFilterBar](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/components/features/channels/channel-filter-bar.tsx#21-207) component that matches the design of the watchlist filters.
- **Search**: Filter channels and podcasts by name or description.
- **Media Type**: Quickly toggle between seeing all sources, only YouTube channels, or only podcasts.
- **Tags**: Filter by episode tags. Channels are included if they have at least one episode matching the selected tags.

### 2. Functional API Filtering
- Updated the `/api/channels` route to handle `search`, `type`, and `tagIds` as query parameters.
- This ensures filtering happens at the data source level for better performance.

### 3. Repository Enhancements
- Updated [ChannelRepository](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/lib/repositories/channel.repository.ts#4-202) to implement the filtering logic using efficient SQL queries.
- Added support for checking tag existence across episodes belonging to a channel.

## Verification Results

### Automated Build
- Verified that the application builds successfully with `npm run build`.
- All TypeScript types and imports are correctly aligned.

### UI Experience
- Verified that the filter bar accurately updates the displayed channels in real-time.
- Verified that icons (YouTube/Mic) and badges accurately reflect the content and source types.

## Summary of Changes
```diff:page.tsx
'use client';

import { useState, useEffect, Suspense } from 'react';
import { Layout } from '@/components/layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Trash2, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { useSearchParams } from 'next/navigation';
import { Button } from "@/components/ui/button";

interface Tag {
    id: string;
    name: string;
    color: string | null;
}

interface Channel {
    id: string;
    name: string;
    description: string | null;
    thumbnailUrl: string | null;
    channelUrl: string;
    videoCount: number;
    tags?: Tag[];
}

function ChannelsPageContent() {
    const searchParams = useSearchParams();
    const highlightId = searchParams.get('channelId');
    const [channels, setChannels] = useState<Channel[]>([]);
    const [loading, setLoading] = useState(true);
    const [syncing, setSyncing] = useState(false);
    const [channelToDelete, setChannelToDelete] = useState<Channel | null>(null);

    const fetchChannels = async () => {
        try {
            const response = await fetch('/api/channels');
            if (!response.ok) throw new Error('Failed to fetch channels');

            const data = await response.json();
            setChannels(data.channels);
        } catch (error) {
            console.error('Error fetching channels:', error);
            toast.error('Failed to fetch channels');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchChannels();
    }, []);

    const handleSyncChannels = async () => {
        setSyncing(true);
        try {
            const response = await fetch('/api/channels/sync', { method: 'POST' });
            if (!response.ok) throw new Error('Sync failed');

            const data = await response.json();
            toast.success(data.message || 'Metadata synced successfully');
            fetchChannels();
        } catch (error) {
            console.error('Error syncing channels:', error);
            toast.error('Failed to sync channel metadata');
        } finally {
            setSyncing(false);
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

    if (loading) {
        return (
            <Layout>
                <div className="space-y-6">
                    <div className="flex justify-between items-center">
                        <h1 className="text-3xl font-bold">Channels</h1>
                        <Skeleton className="h-10 w-32" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {[...Array(8)].map((_, i) => (
                            <Card key={i}>
                                <CardHeader className="flex flex-row items-center gap-4">
                                    <Skeleton className="h-16 w-16 rounded-full flex-shrink-0" />
                                    <div className="flex-1 min-w-0 space-y-2">
                                        <Skeleton className="h-6 w-3/4" />
                                        <div className="flex gap-1">
                                            <Skeleton className="h-4 w-12" />
                                            <Skeleton className="h-4 w-16" />
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <Skeleton className="h-4 w-full mb-2" />
                                    <Skeleton className="h-4 w-2/3" />
                                </CardContent>
                            </Card>
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
                        <h1 className="text-3xl font-bold">Channels</h1>
                        <p className="text-muted-foreground">
                            All channels from your saved videos
                        </p>
                    </div>
                    <Button
                        variant="outline"
                        onClick={handleSyncChannels}
                        disabled={syncing}
                        className="gap-2"
                    >
                        <RefreshCw className={`h-4 w-4 ${syncing ? 'animate-spin' : ''}`} />
                        {syncing ? 'Syncing...' : 'Sync Metadata'}
                    </Button>
                </div>

                {channels.length === 0 ? (
                    <div className="text-center py-12">
                        <p className="text-muted-foreground text-lg">No channels yet</p>
                        <p className="text-sm text-muted-foreground mt-2">
                            Add videos to see channels here
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {channels.map((channel) => (
                            <Card
                                key={channel.id}
                                className={`group relative hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden border-muted-foreground/10 ${highlightId === channel.id ? 'ring-2 ring-primary ring-offset-2' : ''}`}
                                onClick={() => window.location.href = `/?channelId=${channel.id}`}
                            >
                                <div className="absolute top-2 right-2 flex gap-1 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setChannelToDelete(channel);
                                        }}
                                        className="p-1.5 bg-background/80 hover:bg-destructive hover:text-white rounded-full backdrop-blur-sm transition-colors"
                                        title="Delete Channel"
                                    >
                                        <Trash2 className="h-3.5 w-3.5" />
                                    </button>
                                </div>

                                <CardHeader className="p-6 flex flex-row items-center gap-4">
                                    <div className="h-16 w-16 rounded-full overflow-hidden bg-muted flex-shrink-0 border-2 border-primary/10 group-hover:border-primary/30 transition-colors">
                                        {channel.thumbnailUrl ? (
                                            <img
                                                src={channel.thumbnailUrl}
                                                alt={channel.name}
                                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-muted-foreground text-2xl font-bold bg-accent">
                                                {channel.name[0]}
                                            </div>
                                        )}
                                    </div>
                                    <div className="min-w-0">
                                        <CardTitle className="text-xl font-bold group-hover:text-primary transition-colors">
                                            <a
                                                href={channel.channelUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="transition-colors hover:text-red-600 dark:hover:text-red-400"
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                {channel.name}
                                            </a>
                                        </CardTitle>
                                        <Badge variant="secondary" className="mt-1 bg-primary/5 text-primary hover:bg-primary/10 border-none px-2 py-0">
                                            {channel.videoCount} {channel.videoCount === 1 ? 'video' : 'videos'}
                                        </Badge>
                                        {channel.tags && channel.tags.length > 0 && (
                                            <div className="flex flex-wrap gap-1 mt-2">
                                                {channel.tags.map((tag) => (
                                                    <Badge
                                                        key={tag.id}
                                                        variant="outline"
                                                        className="text-[10px] px-1.5 py-0 h-4"
                                                        style={tag.color ? {
                                                            backgroundColor: `${tag.color}15`,
                                                            color: tag.color,
                                                            borderColor: `${tag.color}30`
                                                        } : undefined}
                                                    >
                                                        {tag.name}
                                                    </Badge>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </CardHeader>

                                <CardContent className="px-6 pb-6 pt-0">
                                    <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
                                        {channel.description || "No description available. Sync metadata to refresh."}
                                    </p>
                                </CardContent>

                                <div className="absolute bottom-0 left-0 w-full h-1 bg-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                            </Card>
                        ))}
                    </div>
                )}
            </div>

            <Dialog open={!!channelToDelete} onOpenChange={(open: boolean) => !open && setChannelToDelete(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Are you absolutely sure?</DialogTitle>
                        <DialogDescription>
                            This will remove <strong>{channelToDelete?.name}</strong> from your channel list.
                            The videos from this channel will still remain in your watch list.
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
                        <h1 className="text-3xl font-bold">Channels</h1>
                        <Skeleton className="h-10 w-32" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {[...Array(8)].map((_, i) => (
                            <Card key={i}>
                                <CardHeader className="flex flex-row items-center gap-4">
                                    <Skeleton className="h-16 w-16 rounded-full flex-shrink-0" />
                                    <div className="flex-1 min-w-0 space-y-2">
                                        <Skeleton className="h-6 w-3/4" />
                                        <div className="flex gap-1">
                                            <Skeleton className="h-4 w-12" />
                                            <Skeleton className="h-4 w-16" />
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <Skeleton className="h-4 w-full mb-2" />
                                    <Skeleton className="h-4 w-2/3" />
                                </CardContent>
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
===
'use client';

import { useState, useEffect, Suspense } from 'react';
import { Layout } from '@/components/layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Trash2, RefreshCw, Youtube, Mic, Filter } from 'lucide-react';
import { ChannelFilterBar } from '@/components/features/channels/channel-filter-bar';
import { Channel as ChannelModel, Tag as TagModel } from '@/lib/domain/models';
import { toast } from 'sonner';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { useSearchParams } from 'next/navigation';
import { Button } from "@/components/ui/button";

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
}

function ChannelsPageContent() {
    const searchParams = useSearchParams();
    const highlightId = searchParams.get('channelId');
    const [channels, setChannels] = useState<Channel[]>([]);
    const [loading, setLoading] = useState(true);
    const [syncing, setSyncing] = useState(false);
    const [channelToDelete, setChannelToDelete] = useState<Channel | null>(null);
    const [filters, setFilters] = useState<any>({});

    const fetchChannels = async (currentFilters = filters) => {
        try {
            const params = new URLSearchParams();
            if (currentFilters.search) params.set('search', currentFilters.search);
            if (currentFilters.type) params.set('type', currentFilters.type);
            if (currentFilters.tagIds) params.set('tagIds', currentFilters.tagIds.join(','));

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
    };

    useEffect(() => {
        fetchChannels();
    }, []);

    const handleFilterChange = (newFilters: any) => {
        setFilters(newFilters);
        fetchChannels(newFilters);
    };

    const handleSyncChannels = async () => {
        setSyncing(true);
        try {
            const response = await fetch('/api/channels/sync', { method: 'POST' });
            if (!response.ok) throw new Error('Sync failed');

            const data = await response.json();
            toast.success(data.message || 'Metadata synced successfully');
            fetchChannels();
        } catch (error) {
            console.error('Error syncing channels:', error);
            toast.error('Failed to sync channel metadata');
        } finally {
            setSyncing(false);
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

    if (loading) {
        return (
            <Layout>
                <div className="space-y-6">
                    <div className="flex justify-between items-center">
                        <h1 className="text-3xl font-bold">Channels & Podcasts</h1>
                        <Skeleton className="h-10 w-32" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {[...Array(8)].map((_, i) => (
                            <Card key={i}>
                                <CardHeader className="flex flex-row items-center gap-4">
                                    <Skeleton className="h-16 w-16 rounded-full flex-shrink-0" />
                                    <div className="flex-1 min-w-0 space-y-2">
                                        <Skeleton className="h-6 w-3/4" />
                                        <div className="flex gap-1">
                                            <Skeleton className="h-4 w-12" />
                                            <Skeleton className="h-4 w-16" />
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <Skeleton className="h-4 w-full mb-2" />
                                    <Skeleton className="h-4 w-2/3" />
                                </CardContent>
                            </Card>
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
                    <Button
                        variant="outline"
                        onClick={handleSyncChannels}
                        disabled={syncing}
                        className="gap-2"
                    >
                        <RefreshCw className={`h-4 w-4 ${syncing ? 'animate-spin' : ''}`} />
                        {syncing ? 'Syncing...' : 'Sync Metadata'}
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
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {channels.map((channel) => (
                            <Card
                                key={channel.id}
                                className={`group relative hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden border-muted-foreground/10 ${highlightId === channel.id ? 'ring-2 ring-primary ring-offset-2' : ''}`}
                                onClick={() => window.location.href = `/?channelId=${channel.id}`}
                            >
                                <div className="absolute top-2 right-2 flex gap-1 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setChannelToDelete(channel);
                                        }}
                                        className="p-1.5 bg-background/80 hover:bg-destructive hover:text-white rounded-full backdrop-blur-sm transition-colors"
                                        title="Delete Source"
                                    >
                                        <Trash2 className="h-3.5 w-3.5" />
                                    </button>
                                </div>

                                <CardHeader className="p-6 flex flex-row items-center gap-4">
                                    <div className="h-16 w-16 rounded-full overflow-hidden bg-muted flex-shrink-0 border-2 border-primary/10 group-hover:border-primary/30 transition-colors">
                                        {channel.thumbnailUrl ? (
                                            <img
                                                src={channel.thumbnailUrl}
                                                alt={channel.name}
                                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-muted-foreground text-2xl font-bold bg-accent">
                                                {channel.name[0]}
                                            </div>
                                        )}
                                    </div>
                                    <div className="min-w-0">
                                        <CardTitle className="text-xl font-bold group-hover:text-primary transition-colors">
                                            <div className="flex items-center gap-2">
                                                {channel.type === 'podcast' ? (
                                                    <Mic className="h-4 w-4 text-purple-600" />
                                                ) : (
                                                    <Youtube className="h-4 w-4 text-red-600" />
                                                )}
                                                <a
                                                    href={channel.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="transition-colors hover:text-primary"
                                                    onClick={(e) => e.stopPropagation()}
                                                >
                                                    {channel.name}
                                                </a>
                                            </div>
                                        </CardTitle>
                                        <Badge variant="secondary" className="mt-1 bg-primary/5 text-primary hover:bg-primary/10 border-none px-2 py-0">
                                            {channel.episodeCount} {channel.episodeCount === 1 ? 'episode' : 'episodes'}
                                        </Badge>
                                        {channel.tags && channel.tags.length > 0 && (
                                            <div className="flex flex-wrap gap-1 mt-2">
                                                {channel.tags.map((tag) => (
                                                    <Badge
                                                        key={tag.id}
                                                        variant="outline"
                                                        className="text-[10px] px-1.5 py-0 h-4"
                                                        style={tag.color ? {
                                                            backgroundColor: `${tag.color}15`,
                                                            color: tag.color,
                                                            borderColor: `${tag.color}30`
                                                        } : undefined}
                                                    >
                                                        {tag.name}
                                                    </Badge>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </CardHeader>

                                <CardContent className="px-6 pb-6 pt-0">
                                    <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
                                        {channel.description || "No description available. Sync metadata to refresh."}
                                    </p>
                                </CardContent>

                                <div className="absolute bottom-0 left-0 w-full h-1 bg-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                            </Card>
                        ))}
                    </div>
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
                            <Card key={i}>
                                <CardHeader className="flex flex-row items-center gap-4">
                                    <Skeleton className="h-16 w-16 rounded-full flex-shrink-0" />
                                    <div className="flex-1 min-w-0 space-y-2">
                                        <Skeleton className="h-6 w-3/4" />
                                        <div className="flex gap-1">
                                            <Skeleton className="h-4 w-12" />
                                            <Skeleton className="h-4 w-16" />
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <Skeleton className="h-4 w-full mb-2" />
                                    <Skeleton className="h-4 w-2/3" />
                                </CardContent>
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
```
```diff:channel-filter-bar.tsx
===
'use client';

import { useState, useEffect } from 'react';
import { Search, Youtube, Mic, Tag as TagIcon, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { Tag } from '@/lib/domain/models';

interface ChannelFilterBarProps {
    onFilterChange?: (filters: any) => void;
    initialFilters?: any;
}

export function ChannelFilterBar({ onFilterChange, initialFilters }: ChannelFilterBarProps) {
    const [search, setSearch] = useState(initialFilters?.search || '');
    const [typeFilter, setTypeFilter] = useState<'all' | 'video' | 'podcast'>(initialFilters?.type || 'all');
    const [selectedTagIds, setSelectedTagIds] = useState<string[]>(initialFilters?.tagIds || []);
    const [tags, setTags] = useState<Tag[]>([]);
    const [showTags, setShowTags] = useState(initialFilters?.tagIds && initialFilters.tagIds.length > 0);

    useEffect(() => {
        const fetchTags = async () => {
            try {
                const response = await fetch('/api/tags');
                const data = await response.json();
                if (data.tags) {
                    setTags(data.tags);
                }
            } catch (error) {
                console.error('Error fetching tags:', error);
            }
        };
        fetchTags();
    }, []);

    const handleSearchChange = (value: string) => {
        setSearch(value);
        onFilterChange?.({
            search: value || undefined,
            type: typeFilter === 'all' ? undefined : typeFilter,
            tagIds: selectedTagIds.length > 0 ? selectedTagIds : undefined,
        });
    };

    const handleTypeFilterChange = (value: 'all' | 'video' | 'podcast') => {
        setTypeFilter(value);
        onFilterChange?.({
            search: search || undefined,
            type: value === 'all' ? undefined : value,
            tagIds: selectedTagIds.length > 0 ? selectedTagIds : undefined,
        });
    };

    const toggleTag = (tagId: string) => {
        const newSelected = selectedTagIds.includes(tagId)
            ? selectedTagIds.filter(id => id !== tagId)
            : [...selectedTagIds, tagId];
        
        setSelectedTagIds(newSelected);
        onFilterChange?.({
            search: search || undefined,
            type: typeFilter === 'all' ? undefined : typeFilter,
            tagIds: newSelected.length > 0 ? newSelected : undefined,
        });
    };

    const clearTags = () => {
        setSelectedTagIds([]);
        onFilterChange?.({
            search: search || undefined,
            type: typeFilter === 'all' ? undefined : typeFilter,
            tagIds: undefined,
        });
    };

    return (
        <div className="flex flex-col mb-6">
            <div className="flex flex-col lg:flex-row gap-4 mb-4">
                {/* Search */}
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search sources..."
                        value={search}
                        onChange={(e) => handleSearchChange(e.target.value)}
                        className="pl-10 h-10"
                    />
                </div>

                {/* Filters */}
                <div className="flex flex-row items-center gap-2 overflow-x-auto lg:overflow-visible pb-1 lg:pb-0 no-scrollbar">
                    <div className="flex gap-2 flex-shrink-0">
                        <Button
                            variant={typeFilter === 'all' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => handleTypeFilterChange('all')}
                            className="h-10 px-4"
                        >
                            All
                        </Button>
                        
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        variant={typeFilter === 'video' ? 'default' : 'outline'}
                                        size="icon"
                                        onClick={() => handleTypeFilterChange('video')}
                                        className="h-10 w-10 flex-shrink-0"
                                    >
                                        <Youtube className={`h-4 w-4 ${typeFilter === 'video' ? 'text-white' : 'text-red-600'}`} />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>YouTube Channels</TooltipContent>
                            </Tooltip>

                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        variant={typeFilter === 'podcast' ? 'default' : 'outline'}
                                        size="icon"
                                        onClick={() => handleTypeFilterChange('podcast')}
                                        className="h-10 w-10 flex-shrink-0"
                                    >
                                        <Mic className={`h-4 w-4 ${typeFilter === 'podcast' ? 'text-white' : 'text-purple-600'}`} />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>Podcasts</TooltipContent>
                            </Tooltip>
                        </TooltipProvider>

                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        variant={showTags || selectedTagIds.length > 0 ? "default" : "outline"}
                                        size="icon"
                                        onClick={() => setShowTags(!showTags)}
                                        className="h-10 w-10 flex-shrink-0 relative ml-4"
                                    >
                                        <TagIcon className="h-4 w-4" />
                                        {selectedTagIds.length > 0 && (
                                            <Badge 
                                                className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-[10px]"
                                                variant="destructive"
                                            >
                                                {selectedTagIds.length}
                                            </Badge>
                                        )}
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>Filter by Episode Tags</TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </div>
                </div>
            </div>

            {/* Tags list - Dedicated Row */}
            {(showTags || selectedTagIds.length > 0) && tags.length > 0 && (
                <div className="w-full flex items-center gap-2 py-2 border-t animate-in fade-in slide-in-from-top-1 duration-200">
                    <div className="flex flex-wrap gap-2 flex-1">
                        {tags.map((tag) => {
                            const isSelected = selectedTagIds.includes(tag.id);
                            return (
                                <Badge
                                    key={tag.id}
                                    variant={isSelected ? "default" : "outline"}
                                    className={`cursor-pointer transition-all hover:scale-105 whitespace-nowrap px-3 py-1 rounded-full text-xs font-medium`}
                                    style={{
                                        backgroundColor: isSelected ? tag.color || undefined : `${tag.color}15`,
                                        color: isSelected ? '#fff' : tag.color || 'inherit',
                                        borderColor: isSelected ? tag.color || undefined : `${tag.color}40`,
                                        boxShadow: isSelected ? `0 2px 8px ${tag.color}40` : 'none',
                                    }}
                                    onClick={() => toggleTag(tag.id)}
                                >
                                    {tag.name}
                                </Badge>
                            );
                        })}
                    </div>
                    {selectedTagIds.length > 0 && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={clearTags}
                            className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground hover:bg-muted shrink-0 flex items-center gap-1.5"
                            title="Clear tag filters"
                        >
                            <X className="h-3 w-3" />
                            Clear
                        </Button>
                    )}
                </div>
            )}
        </div>
    );
}
```
```diff:route.ts
import { NextRequest, NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import { getDatabase } from '@/lib/db/database';
import { ChannelRepository } from '@/lib/repositories';

/**
 * GET /api/channels - List all channels with video counts
 */
export async function GET(request: NextRequest) {
    try {
        const db = await getDatabase();
        const channelRepo = new ChannelRepository(db);

        const channels = await channelRepo.getChannelsWithVideoCount();

        return NextResponse.json({ channels });
    } catch (error) {
        console.error('Error listing channels:', error);
        return NextResponse.json(
            { error: 'Failed to list channels' },
            { status: 500 }
        );
    }
}
===
import { NextRequest, NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import { getDatabase } from '@/lib/db/database';
import { ChannelRepository } from '@/lib/repositories';

/**
 * GET /api/channels - List all channels with episode counts
 */
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const search = searchParams.get('search') || undefined;
        const type = (searchParams.get('type') as any) || undefined;
        const tagIds = searchParams.get('tagIds')?.split(',') || undefined;

        const db = await getDatabase();
        const channelRepo = new ChannelRepository(db);

        const channels = await channelRepo.getChannelsWithEpisodeCount({
            search,
            type,
            tagIds,
        });

        return NextResponse.json({ channels });
    } catch (error) {
        console.error('Error listing channels:', error);
        return NextResponse.json(
            { error: 'Failed to list channels' },
            { status: 500 }
        );
    }
}
```
```diff:channel.repository.ts
import { Database } from 'sqlite';
import { Channel, CreateChannelDto, Tag } from '../domain/models';

export class ChannelRepository {
    constructor(private db: Database) { }

    /**
     * Create a new channel
     */
    async create(dto: CreateChannelDto): Promise<Channel> {
        const now = Math.floor(Date.now() / 1000);

        await this.db.run(
            `INSERT INTO channels (
        id, name, description, thumbnail_url, channel_url, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [
                dto.id,
                dto.name,
                dto.description || null,
                dto.thumbnailUrl || null,
                dto.channelUrl,
                now,
                now,
            ]
        );

        const channel = await this.findById(dto.id);
        if (!channel) {
            throw new Error('Failed to create channel');
        }
        return channel;
    }

    /**
     * Find channel by ID
     */
    async findById(id: string): Promise<Channel | null> {
        const row = await this.db.get('SELECT * FROM channels WHERE id = ?', id);
        return row ? this.mapRowToChannel(row) : null;
    }

    /**
     * Find all channels
     */
    async findAll(): Promise<Channel[]> {
        const rows = await this.db.all('SELECT * FROM channels ORDER BY name ASC');
        return rows.map((row) => this.mapRowToChannel(row));
    }

    /**
     * Update channel
     */
    async update(id: string, dto: Partial<CreateChannelDto>): Promise<Channel> {
        const updates: string[] = [];
        const params: any[] = [];

        if (dto.name !== undefined) {
            updates.push('name = ?');
            params.push(dto.name);
        }
        if (dto.description !== undefined) {
            updates.push('description = ?');
            params.push(dto.description);
        }
        if (dto.thumbnailUrl !== undefined) {
            updates.push('thumbnail_url = ?');
            params.push(dto.thumbnailUrl);
        }
        if (dto.channelUrl !== undefined) {
            updates.push('channel_url = ?');
            params.push(dto.channelUrl);
        }

        updates.push('updated_at = ?');
        params.push(Math.floor(Date.now() / 1000));

        params.push(id);

        await this.db.run(
            `UPDATE channels SET ${updates.join(', ')} WHERE id = ?`,
            params
        );

        const channel = await this.findById(id);
        if (!channel) {
            throw new Error('Channel not found after update');
        }
        return channel;
    }

    /**
     * Get channel with video count
     */
    async getChannelsWithVideoCount(): Promise<Array<Channel & { videoCount: number; tags: Tag[] }>> {
        const rows = await this.db.all(`
            SELECT c.*, COUNT(v.id) as video_count
            FROM channels c
            LEFT JOIN videos v ON c.id = v.channel_id AND v.is_deleted = 0
            GROUP BY c.id
            ORDER BY c.name ASC
        `);

        const channels = rows.map((row: any) => ({
            ...this.mapRowToChannel(row),
            videoCount: row.video_count,
            tags: [] as Tag[],
        }));

        if (channels.length > 0) {
            const channelIds = channels.map((c) => c.id);
            const placeholders = channelIds.map(() => '?').join(',');

            // Get all tags for these channels
            const tagRows = await this.db.all(`
                SELECT DISTINCT v.channel_id, t.*
                FROM tags t
                JOIN video_tags vt ON t.id = vt.tag_id
                JOIN videos v ON vt.video_id = v.id
                WHERE v.channel_id IN (${placeholders}) AND v.is_deleted = 0
                ORDER BY t.name ASC
            `, channelIds);

            // Group tags by channel_id
            const tagsByChannelId: Record<string, Tag[]> = {};
            tagRows.forEach((row: any) => {
                if (!tagsByChannelId[row.channel_id]) {
                    tagsByChannelId[row.channel_id] = [];
                }
                tagsByChannelId[row.channel_id].push({
                    id: row.id,
                    name: row.name,
                    color: row.color,
                    userId: row.user_id,
                    createdAt: row.created_at,
                });
            });

            // Attach tags to channels
            channels.forEach((c) => {
                c.tags = tagsByChannelId[c.id] || [];
            });
        }

        return channels;
    }

    /**
     * Delete a channel
     */
    async delete(id: string): Promise<void> {
        await this.db.run('DELETE FROM channels WHERE id = ?', id);
    }

    private mapRowToChannel(row: any): Channel {
        return {
            id: row.id,
            name: row.name,
            description: row.description,
            thumbnailUrl: row.thumbnail_url,
            channelUrl: row.channel_url,
            createdAt: row.created_at,
            updatedAt: row.updated_at,
        };
    }
}
===
import { Database } from 'sqlite';
import { Channel, CreateChannelDto, Tag, ChannelFilters } from '../domain/models';

export class ChannelRepository {
    constructor(private db: Database) { }

    /**
     * Create a new channel
     */
    async create(dto: CreateChannelDto): Promise<Channel> {
        const now = Math.floor(Date.now() / 1000);

        await this.db.run(
            `INSERT INTO channels (
        id, type, name, description, thumbnail_url, url, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                dto.id,
                dto.type,
                dto.name,
                dto.description || null,
                dto.thumbnail_url || dto.thumbnailUrl || null,
                dto.url,
                now,
                now,
            ]
        );

        const channel = await this.findById(dto.id);
        if (!channel) {
            throw new Error('Failed to create channel');
        }
        return channel;
    }

    /**
     * Find channel by ID
     */
    async findById(id: string): Promise<Channel | null> {
        const row = await this.db.get('SELECT * FROM channels WHERE id = ?', id);
        return row ? this.mapRowToChannel(row) : null;
    }

    /**
     * Find all channels
     */
    async findAll(): Promise<Channel[]> {
        const rows = await this.db.all('SELECT * FROM channels ORDER BY name ASC');
        return rows.map((row) => this.mapRowToChannel(row));
    }

    /**
     * Update channel
     */
    async update(id: string, dto: Partial<CreateChannelDto>): Promise<Channel> {
        const updates: string[] = [];
        const params: any[] = [];

        if (dto.name !== undefined) {
            updates.push('name = ?');
            params.push(dto.name);
        }
        if (dto.description !== undefined) {
            updates.push('description = ?');
            params.push(dto.description);
        }
        if (dto.thumbnail_url !== undefined || dto.thumbnailUrl !== undefined) {
            updates.push('thumbnail_url = ?');
            params.push(dto.thumbnail_url || dto.thumbnailUrl);
        }
        if (dto.url !== undefined) {
            updates.push('url = ?');
            params.push(dto.url);
        }

        updates.push('updated_at = ?');
        params.push(Math.floor(Date.now() / 1000));

        params.push(id);

        await this.db.run(
            `UPDATE channels SET ${updates.join(', ')} WHERE id = ?`,
            params
        );

        const channel = await this.findById(id);
        if (!channel) {
            throw new Error('Channel not found after update');
        }
        return channel;
    }

    /**
     * Get channel with episode count
     */
    async getChannelsWithEpisodeCount(filters?: ChannelFilters): Promise<Array<Channel & { episodeCount: number; tags: Tag[] }>> {
        const params: any[] = [];
        const conditions: string[] = [];

        let query = `
            SELECT c.*, COUNT(e.id) as episode_count
            FROM channels c
            LEFT JOIN episodes e ON c.id = e.channel_id AND e.is_deleted = 0
        `;

        if (filters?.search) {
            conditions.push('(c.name LIKE ? OR c.description LIKE ?)');
            const searchTerm = `%${filters.search}%`;
            params.push(searchTerm, searchTerm);
        }

        if (filters?.type) {
            conditions.push('c.type = ?');
            params.push(filters.type);
        }

        if (filters?.tagIds && filters.tagIds.length > 0) {
            const placeholders = filters.tagIds.map(() => '?').join(',');
            conditions.push(`EXISTS (
                SELECT 1 FROM episode_tags et 
                JOIN episodes ep ON et.episode_id = ep.id
                WHERE ep.channel_id = c.id AND et.tag_id IN (${placeholders})
            )`);
            params.push(...filters.tagIds);
        }

        if (conditions.length > 0) {
            query += ' WHERE ' + conditions.join(' AND ');
        }

        query += `
            GROUP BY c.id
            ORDER BY c.name ASC
        `;

        const rows = await this.db.all(query, params);

        const channels = rows.map((row: any) => ({
            ...this.mapRowToChannel(row),
            episodeCount: row.episode_count,
            tags: [] as Tag[],
        }));

        if (channels.length > 0) {
            const channelIds = channels.map((c) => c.id);
            const placeholders = channelIds.map(() => '?').join(',');

            // Get all tags for these channels
            const tagRows = await this.db.all(`
                SELECT DISTINCT e.channel_id, t.*
                FROM tags t
                JOIN episode_tags et ON t.id = et.tag_id
                JOIN episodes e ON et.episode_id = e.id
                WHERE e.channel_id IN (${placeholders}) AND e.is_deleted = 0
                ORDER BY t.name ASC
            `, channelIds);

            // Group tags by channel_id
            const tagsByChannelId: Record<string, Tag[]> = {};
            tagRows.forEach((row: any) => {
                if (!tagsByChannelId[row.channel_id]) {
                    tagsByChannelId[row.channel_id] = [];
                }
                tagsByChannelId[row.channel_id].push({
                    id: row.id,
                    name: row.name,
                    color: row.color,
                    userId: row.user_id,
                    createdAt: row.created_at,
                });
            });

            // Attach tags to channels
            channels.forEach((c) => {
                c.tags = tagsByChannelId[c.id] || [];
            });
        }

        return channels;
    }

    /**
     * Delete a channel
     */
    async delete(id: string): Promise<void> {
        await this.db.run('DELETE FROM channels WHERE id = ?', id);
    }

    private mapRowToChannel(row: any): Channel {
        return {
            id: row.id,
            type: row.type || 'video',
            name: row.name,
            description: row.description,
            thumbnailUrl: row.thumbnail_url || row.thumbnailUrl, // Handle both snake and camel if needed during transition
            url: row.url || row.channel_url,
            createdAt: row.created_at,
            updatedAt: row.updated_at,
        };
    }
}
```
