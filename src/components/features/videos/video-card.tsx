'use client';

import { Video } from '@/lib/domain/models';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Play,
    Check,
    Star,
    MoreVertical,
    Trash2,
    GripVertical,
} from 'lucide-react';
import { toast } from 'sonner';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface VideoCardProps {
    video: Video;
    onUpdate?: () => void;
    onDelete?: () => void;
}

export function VideoCard({ video, onUpdate, onDelete }: VideoCardProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
    } = useSortable({ id: video.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    const handleToggleWatched = async () => {
        try {
            const response = await fetch(`/api/videos/${video.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ watched: !video.watched }),
            });

            if (!response.ok) throw new Error('Failed to update video');

            toast.success(video.watched ? 'Marked as unwatched' : 'Marked as watched');
            onUpdate?.();
        } catch (error) {
            toast.error('Failed to update video');
        }
    };

    const handleToggleFavorite = async () => {
        try {
            const response = await fetch(`/api/videos/${video.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ favorite: !video.favorite }),
            });

            if (!response.ok) throw new Error('Failed to update video');

            toast.success(video.favorite ? 'Removed from favorites' : 'Added to favorites');
            onUpdate?.();
        } catch (error) {
            toast.error('Failed to update video');
        }
    };

    const handleDelete = async () => {
        if (!confirm('Are you sure you want to delete this video?')) return;

        try {
            const response = await fetch(`/api/videos/${video.id}`, {
                method: 'DELETE',
            });

            if (!response.ok) throw new Error('Failed to delete video');

            toast.success('Video deleted');
            onDelete?.();
        } catch (error) {
            toast.error('Failed to delete video');
        }
    };

    const handlePlay = () => {
        window.open(video.videoUrl, '_blank');
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'high':
                return 'bg-red-500';
            case 'medium':
                return 'bg-yellow-500';
            case 'low':
                return 'bg-blue-500';
            default:
                return 'bg-gray-500';
        }
    };

    const formatDuration = (seconds: number | null) => {
        if (!seconds) return '';
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;

        if (hours > 0) {
            return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        }
        return `${minutes}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div ref={setNodeRef} style={style} className="h-full">
            <Card className={`group relative h-full flex flex-col ${video.watched ? 'opacity-60' : ''}`}>
                <CardContent className="p-4 flex-1 flex flex-col">
                    {/* Drag Handle */}
                    <div
                        {...attributes}
                        {...listeners}
                        className="absolute left-2 top-2 cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity z-10 bg-black/50 p-1 rounded-sm"
                    >
                        <GripVertical className="h-4 w-4 text-white" />
                    </div>

                    {/* Thumbnail */}
                    <div className="relative aspect-video mb-3 rounded-md overflow-hidden bg-muted">
                        {video.thumbnailUrl && (
                            <img
                                src={video.thumbnailUrl}
                                alt={video.title}
                                className="w-full h-full object-cover"
                            />
                        )}

                        {/* Duration Badge */}
                        {video.duration && (
                            <Badge className="absolute bottom-2 right-2 bg-black/80 text-white">
                                {formatDuration(video.duration)}
                            </Badge>
                        )}

                        {/* Watched Overlay */}
                        {video.watched && (
                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                <Check className="h-12 w-12 text-white" />
                            </div>
                        )}
                    </div>

                    {/* Title and Channel */}
                    <div className="mb-2">
                        <h3 className="font-semibold line-clamp-2 mb-1" title={video.title}>{video.title}</h3>
                        <p className="text-sm text-muted-foreground">Channel ID: {video.channelId}</p>
                    </div>

                    {/* Badges */}
                    <div className="flex flex-wrap gap-2 mb-auto pb-3">
                        {video.favorite && (
                            <Badge variant="secondary" className="gap-1">
                                <Star className="h-3 w-3 fill-current" />
                                Favorite
                            </Badge>
                        )}
                        {video.priority !== 'none' && (
                            <Badge className={getPriorityColor(video.priority)}>
                                {video.priority.charAt(0).toUpperCase() + video.priority.slice(1)}
                            </Badge>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 mt-2">
                        <Button size="sm" onClick={handlePlay} className="flex-1">
                            <Play className="mr-2 h-4 w-4" />
                            Play
                        </Button>

                        <Button
                            size="sm"
                            variant={video.watched ? 'default' : 'outline'}
                            onClick={handleToggleWatched}
                        >
                            <Check className="h-4 w-4" />
                        </Button>

                        <Button
                            size="sm"
                            variant={video.favorite ? 'default' : 'outline'}
                            onClick={handleToggleFavorite}
                        >
                            <Star className={`h-4 w-4 ${video.favorite ? 'fill-current' : ''}`} />
                        </Button>

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button size="sm" variant="ghost">
                                    <MoreVertical className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={handleDelete} className="text-destructive">
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Delete
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
