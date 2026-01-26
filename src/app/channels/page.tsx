'use client';

import { useState, useEffect } from 'react';
import { Layout } from '@/components/layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

interface Channel {
    id: string;
    name: string;
    thumbnailUrl: string | null;
    videoCount: number;
}

export default function ChannelsPage() {
    const [channels, setChannels] = useState<Channel[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchChannels = async () => {
            try {
                const response = await fetch('/api/channels');
                if (!response.ok) throw new Error('Failed to fetch channels');

                const data = await response.json();
                setChannels(data.channels);
            } catch (error) {
                console.error('Error fetching channels:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchChannels();
    }, []);

    if (loading) {
        return (
            <Layout>
                <div className="space-y-6">
                    <h1 className="text-3xl font-bold">Channels</h1>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {[...Array(8)].map((_, i) => (
                            <Card key={i}>
                                <CardHeader>
                                    <Skeleton className="h-6 w-3/4" />
                                </CardHeader>
                                <CardContent>
                                    <Skeleton className="h-4 w-1/2" />
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </Layout>
        );
    }

    if (channels.length === 0) {
        return (
            <Layout>
                <div className="space-y-6">
                    <h1 className="text-3xl font-bold">Channels</h1>
                    <div className="text-center py-12">
                        <p className="text-muted-foreground text-lg">No channels yet</p>
                        <p className="text-sm text-muted-foreground mt-2">
                            Add videos to see channels here
                        </p>
                    </div>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold">Channels</h1>
                    <p className="text-muted-foreground">
                        All channels from your saved videos
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {channels.map((channel) => (
                        <Card key={channel.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                            <CardHeader>
                                <CardTitle className="line-clamp-1">{channel.name}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-muted-foreground">
                                        {channel.videoCount} {channel.videoCount === 1 ? 'video' : 'videos'}
                                    </span>
                                    <Badge variant="secondary">{channel.videoCount}</Badge>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </Layout>
    );
}
