'use client';

import { useState, useEffect, useCallback, use } from 'react';
import Image from 'next/image';
import { Layout } from '@/components/layout';
import { EpisodeList } from '@/components/features/episodes';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { 
    Trash2, 
    RefreshCw, 
    Youtube, 
    Mic, 
    MoreVertical, 
    CheckCircle2, 
    Circle,
    ArrowLeft,
    ExternalLink
} from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

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

export default function ChannelDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const [channel, setChannel] = useState<Channel | null>(null);
    const [loading, setLoading] = useState(true);
    const [isSyncing, setIsSyncing] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [refreshEpisodesKey, setRefreshEpisodesKey] = useState(0);
    const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);

    const fetchChannel = useCallback(async () => {
        try {
            const response = await fetch(`/api/channels/${id}`);
            if (!response.ok) throw new Error('Failed to fetch channel');
            const data = await response.json();
            setChannel(data.channel);
        } catch (error) {
            console.error('Error fetching channel:', error);
            toast.error('Failed to fetch channel details');
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        fetchChannel();
    }, [fetchChannel]);

    const handleSync = async () => {
        if (!channel) return;
        setIsSyncing(true);
        try {
            const response = await fetch(`/api/channels/${channel.id}/sync`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url: channel.url })
            });

            if (!response.ok) throw new Error('Sync failed');
            toast.success('Channel metadata synced');
            fetchChannel();
        } catch (error) {
            console.error('Error syncing:', error);
            toast.error('Failed to sync metadata');
        } finally {
            setIsSyncing(false);
        }
    };

    const handleDelete = async () => {
        if (!channel) return;
        try {
            const response = await fetch(`/api/channels/${channel.id}`, {
                method: 'DELETE',
            });
            if (!response.ok) throw new Error('Delete failed');
            toast.success('Channel deleted');
            router.push('/channels');
        } catch (error) {
            console.error('Error deleting:', error);
            toast.error('Failed to delete channel');
        } finally {
            setShowDeleteDialog(false);
        }
    };

    const handleBulkWatchStatus = async (watched: boolean) => {
        if (!channel) return;
        try {
            const response = await fetch(`/api/channels/${channel.id}/watch-status`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ watched })
            });
            if (!response.ok) throw new Error('Update failed');
            toast.success(watched ? 'All episodes marked as watched' : 'All episodes marked as unwatched');
            setRefreshEpisodesKey(prev => prev + 1);
        } catch (error) {
            console.error('Error updating watch status:', error);
            toast.error('Failed to update episodes');
        }
    };

    const toggleTag = (tagId: string) => {
        setSelectedTagIds(prev => 
            prev.includes(tagId) 
                ? prev.filter(id => id !== tagId) 
                : [...prev, tagId]
        );
    };

    if (loading) {
        return (
            <Layout>
                <div className="space-y-8">
                    <Skeleton className="h-[300px] w-full rounded-xl" />
                    <div className="space-y-4">
                        <Skeleton className="h-10 w-1/3" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-2/3" />
                    </div>
                </div>
            </Layout>
        );
    }

    if (!channel) {
        return (
            <Layout>
                <div className="text-center py-12">
                    <h1 className="text-2xl font-bold">Channel not found</h1>
                    <Button variant="link" onClick={() => router.push('/channels')}>
                        Back to channels
                    </Button>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="space-y-8">
                {/* Back Button */}
                <Button 
                    variant="ghost" 
                    size="sm" 
                    className="gap-2 -ml-2 text-muted-foreground hover:text-foreground"
                    onClick={() => router.push('/channels')}
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back to Channels
                </Button>

                {/* Header Section */}
                <div className="relative rounded-2xl overflow-hidden border bg-card shadow-lg">
                    {/* Banner Image */}
                    <div className="relative h-48 md:h-64 lg:h-80 w-full">
                        {channel.thumbnailUrl ? (
                            <Image
                                src={channel.thumbnailUrl}
                                alt={channel.name}
                                fill
                                className="object-cover opacity-50 blur-sm brightness-50"
                                unoptimized
                            />
                        ) : (
                            <div className="w-full h-full bg-accent/20" />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
                        
                        {/* Profile Info Overlay */}
                        <div className="absolute inset-x-0 bottom-0 p-6 md:p-8 flex flex-col md:flex-row items-end md:items-center gap-6">
                            {/* Large Thumbnail */}
                            <div className="relative w-24 h-24 md:w-32 md:h-32 rounded-xl overflow-hidden shadow-2xl border-4 border-background flex-shrink-0 animate-in zoom-in duration-300">
                                {channel.thumbnailUrl ? (
                                    <Image
                                        src={channel.thumbnailUrl}
                                        alt={channel.name}
                                        fill
                                        className="object-cover"
                                        unoptimized
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-4xl font-bold bg-accent">
                                        {channel.name[0]}
                                    </div>
                                )}
                            </div>

                            {/* Text Info */}
                            <div className="flex-1 space-y-2 text-left">
                                <div className="flex items-center gap-3">
                                    <h1 className="text-3xl md:text-4xl font-black tracking-tight">{channel.name}</h1>
                                    <a 
                                        href={channel.url} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="p-2 bg-primary/10 hover:bg-primary/20 rounded-full transition-colors text-primary"
                                        title="Open on Platform"
                                    >
                                        <ExternalLink className="h-5 w-5" />
                                    </a>
                                </div>
                                
                                <div className="flex flex-wrap items-center gap-4 text-sm font-medium">
                                    <div className="flex items-center gap-2 px-3 py-1 bg-background/50 backdrop-blur-md rounded-full border">
                                        {channel.type === 'podcast' ? (
                                            <Mic className="h-4 w-4 text-purple-500" />
                                        ) : (
                                            <div className="bg-red-600 rounded-sm p-0.5 flex items-center justify-center">
                                                <Youtube className="h-3 w-3 text-white fill-current" />
                                            </div>
                                        )}
                                        <span className="capitalize">{channel.type}</span>
                                    </div>
                                    <div className="flex items-center gap-2 px-3 py-1 bg-background/50 backdrop-blur-md rounded-full border">
                                        <span className="text-primary font-bold">{channel.episodeCount}</span>
                                        <span className="text-muted-foreground">{channel.episodeCount === 1 ? 'episode' : 'episodes'}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Actions Dropdown */}
                            <div className="flex items-center gap-2">
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="secondary" size="icon" className="h-12 w-12 rounded-full shadow-lg">
                                            <MoreVertical className="h-6 w-6" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="w-56">
                                        <DropdownMenuItem onClick={handleSync} disabled={isSyncing}>
                                            <RefreshCw className={`mr-2 h-4 w-4 ${isSyncing ? 'animate-spin' : ''}`} />
                                            Sync Metadata
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => handleBulkWatchStatus(true)}>
                                            <CheckCircle2 className="mr-2 h-4 w-4 text-green-500" />
                                            Mark all as watched
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => handleBulkWatchStatus(false)}>
                                            <Circle className="mr-2 h-4 w-4 text-muted-foreground" />
                                            Mark all as unwatched
                                        </DropdownMenuItem>
                                        <DropdownMenuItem 
                                            onClick={() => setShowDeleteDialog(true)}
                                            className="text-destructive focus:bg-destructive focus:text-destructive-foreground"
                                        >
                                            <Trash2 className="mr-2 h-4 w-4" />
                                            Delete Source
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        </div>
                    </div>

                    {/* Description & Tags */}
                    <div className="p-6 md:p-8 pt-0 space-y-6">
                        {channel.description && channel.description !== "No description available. Sync metadata to refresh." && (
                            <div>
                                <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                                    {channel.description}
                                </p>
                            </div>
                        )}

                        {channel.tags && channel.tags.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                                {channel.tags.map((tag) => {
                                    const isSelected = selectedTagIds.includes(tag.id);
                                    return (
                                        <Badge
                                            key={tag.id}
                                            variant={isSelected ? "default" : "outline"}
                                            className="text-xs px-3 py-1 rounded-full font-medium cursor-pointer transition-all hover:scale-105"
                                            style={{
                                                backgroundColor: isSelected ? tag.color || undefined : `${tag.color}20`,
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
                        )}
                    </div>
                </div>

                {/* Episodes Section */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-bold tracking-tight">Episodes</h2>
                    </div>
                    <EpisodeList 
                        key={`${refreshEpisodesKey}-${id}`}
                        filters={{ channelId: id, tagIds: selectedTagIds }} 
                        viewMode="grid" 
                    />
                </div>
            </div>

            {/* Delete Confirmation Dialog */}
            <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Are you absolutely sure?</DialogTitle>
                        <DialogDescription>
                            This will remove <strong>{channel.name}</strong> from your list.
                            The episodes from this source will still remain in your list.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={handleDelete}>
                            Delete
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </Layout>
    );
}
