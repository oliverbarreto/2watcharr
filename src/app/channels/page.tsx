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

interface Channel {
    id: string;
    name: string;
    description: string | null;
    thumbnailUrl: string | null;
    channelUrl: string;
    videoCount: number;
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
                                    <Skeleton className="h-12 w-12 rounded-full" />
                                    <Skeleton className="h-6 w-3/4" />
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
                                    <Skeleton className="h-12 w-12 rounded-full" />
                                    <Skeleton className="h-6 w-3/4" />
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
