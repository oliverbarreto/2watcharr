import { useState } from 'react';
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
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    Play,
    Check,
    Star,
    MoreVertical,
    Trash2,
    GripVertical,
    ArrowUp,
    ArrowDown,
} from 'lucide-react';
import { toast } from 'sonner';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { formatDistanceToNow } from 'date-fns';

interface VideoCardProps {
    video: Video;
    onUpdate?: () => void;
    onDelete?: () => void;
}

export function VideoCard({ video, onUpdate, onDelete }: VideoCardProps) {
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
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
        try {
            const response = await fetch(`/api/videos/${video.id}`, {
                method: 'DELETE',
            });

            if (!response.ok) throw new Error('Failed to delete video');

            toast.success('Video removed from watch later list');
            setIsDeleteDialogOpen(false);
            onDelete?.();
        } catch (error) {
            toast.error('Failed to delete video');
        }
    };

    const handleReorder = async (position: 'beginning' | 'end') => {
        try {
            const response = await fetch(`/api/videos/${video.id}/reorder`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ position }),
            });

            if (!response.ok) throw new Error('Failed to reorder');

            toast.success(`Moved to ${position}`);
            onUpdate?.();
        } catch (error) {
            toast.error('Failed to reorder video');
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

    const formatViews = (views: number | null) => {
        if (views === null || views === undefined) return '';
        if (views >= 1000000) return `${(views / 1000000).toFixed(1)}M views`;
        if (views >= 1000) return `${(views / 1000).toFixed(1)}K views`;
        return `${views} views`;
    };

    const formatPublishedDate = (dateStr: string | null) => {
        if (!dateStr) return '';
        try {
            return formatDistanceToNow(new Date(dateStr), { addSuffix: true });
        } catch (e) {
            return dateStr;
        }
    };

    return (
        <div ref={setNodeRef} style={style} className="h-full">
            <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
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
                        <div className="relative aspect-video mb-3 rounded-md overflow-hidden bg-muted cursor-pointer" onClick={handlePlay}>
                            {video.thumbnailUrl && (
                                <img
                                    src={video.thumbnailUrl}
                                    alt={video.title}
                                    className="w-full h-full object-cover"
                                />
                            )}

                            {/* Duration Badge */}
                            {video.duration && (
                                <Badge className="absolute bottom-2 right-2 bg-black/80 text-white border-none">
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
                            <h3
                                className="font-semibold line-clamp-2 mb-1 cursor-pointer hover:text-primary transition-colors"
                                title={video.title}
                                onClick={handlePlay}
                            >
                                {video.title}
                            </h3>
                            <div className="flex flex-wrap items-center gap-x-1 gap-y-0 text-xs text-muted-foreground">
                                <span
                                    className="hover:text-foreground cursor-pointer font-medium"
                                    onClick={() => window.location.href = `/channels?channelId=${video.channelId}`}
                                >
                                    {video.channelName || 'Unknown Channel'}
                                </span>
                                {video.viewCount !== null && (
                                    <>
                                        <span>•</span>
                                        <span>{formatViews(video.viewCount)}</span>
                                    </>
                                )}
                                {video.publishedDate && (
                                    <>
                                        <span>•</span>
                                        <span>{formatPublishedDate(video.publishedDate)}</span>
                                    </>
                                )}
                            </div>
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
                                variant={video.watched ? 'secondary' : 'outline'}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleToggleWatched();
                                }}
                                title={video.watched ? "Mark as unwatched" : "Mark as watched"}
                            >
                                <Check className={`h-4 w-4 ${video.watched ? 'text-primary' : ''}`} />
                            </Button>

                            <Button
                                size="sm"
                                variant={video.favorite ? 'secondary' : 'outline'}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleToggleFavorite();
                                }}
                                title={video.favorite ? "Remove from favorites" : "Add to favorites"}
                            >
                                <Star className={`h-4 w-4 ${video.favorite ? 'fill-primary text-primary' : ''}`} />
                            </Button>

                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        <MoreVertical className="h-4 w-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                                    <DropdownMenuItem onSelect={(e) => {
                                        e.preventDefault();
                                        handleReorder('beginning');
                                    }}>
                                        <ArrowUp className="mr-2 h-4 w-4" />
                                        Move to beginning
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onSelect={(e) => {
                                        e.preventDefault();
                                        handleReorder('end');
                                    }}>
                                        <ArrowDown className="mr-2 h-4 w-4" />
                                        Move to end
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onSelect={(e) => {
                                        e.preventDefault();
                                        setIsDeleteDialogOpen(true);
                                    }} className="text-destructive font-medium">
                                        <Trash2 className="mr-2 h-4 w-4" />
                                        Remove from watch later list
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </CardContent>
                </Card>

                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Remove from watch later list</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to remove "{video.title}"? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={handleDelete}>
                            Remove
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
