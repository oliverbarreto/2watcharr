'use client';

import { useState } from 'react';
import { Video, Tag } from '@/lib/domain/models';
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
    ArrowUp,
    ArrowDown,
    Tag as TagIcon,
    Plus,
} from 'lucide-react';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import {
    Command,
    CommandDialog,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from '@/components/ui/command';
import { toast } from 'sonner';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { formatDistanceToNow } from 'date-fns';

interface VideoListRowProps {
    video: Video;
    onUpdate?: () => void;
    onDelete?: () => void;
}

export function VideoListRow({ video, onUpdate, onDelete }: VideoListRowProps) {
    const [isTagPopoverOpen, setIsTagPopoverOpen] = useState(false);
    const [availableTags, setAvailableTags] = useState<Tag[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [isUpdatingTags, setIsUpdatingTags] = useState(false);

    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: video.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 50 : 'auto',
    };

    const handleToggleWatched = async (e: React.MouseEvent) => {
        e.stopPropagation();
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

    const handleToggleFavorite = async (e: React.MouseEvent) => {
        e.stopPropagation();
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
            onDelete?.();
        } catch (error) {
            toast.error('Failed to remove video');
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

    const fetchTags = async () => {
        try {
            const response = await fetch('/api/tags');
            const data = await response.json();
            if (data.tags) {
                setAvailableTags(data.tags);
            }
        } catch (error) {
            console.error('Error fetching tags:', error);
        }
    };

    const handleToggleTag = async (tagId: string) => {
        setIsUpdatingTags(true);
        try {
            const currentTagIds = video.tags?.map(t => t.id) || [];
            const isTagSelected = currentTagIds.includes(tagId);
            const newTagIds = isTagSelected
                ? currentTagIds.filter(id => id !== tagId)
                : [...currentTagIds, tagId];

            const response = await fetch(`/api/videos/${video.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ tagIds: newTagIds }),
            });

            if (!response.ok) throw new Error('Failed to update tags');

            toast.success('Tags updated');
            onUpdate?.();
        } catch (error) {
            toast.error('Failed to update tags');
        } finally {
            setIsUpdatingTags(false);
        }
    };

    const getRandomColor = () => {
        const colors = [
            '#ef4444', '#f97316', '#f59e0b', '#10b981', '#06b6d4',
            '#3b82f6', '#6366f1', '#8b5cf6', '#d946ef', '#ec4899'
        ];
        return colors[Math.floor(Math.random() * colors.length)];
    };

    const handleCreateTag = async (name: string) => {
        setIsUpdatingTags(true);
        try {
            const createResponse = await fetch('/api/tags', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, color: getRandomColor() }),
            });

            if (!createResponse.ok) {
                const error = await createResponse.json();
                throw new Error(error.error || 'Failed to create tag');
            }

            const newTag = await createResponse.json();
            await handleToggleTag(newTag.id);

            setSearchQuery('');
            fetchTags();
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Failed to create tag');
        } finally {
            setIsUpdatingTags(false);
        }
    };

    const handlePlay = () => {
        window.open(video.videoUrl, '_blank');
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

    const formatEventDate = () => {
        if (video.lastRemovedAt && video.isDeleted) {
            return `Removed ${formatDistanceToNow(new Date(video.lastRemovedAt * 1000), { addSuffix: true })}`;
        }
        
        // Find the latest significant event
        const events = [
            { type: 'Watched', date: video.lastWatchedAt },
            { type: 'Restored', date: video.lastAddedAt && video.lastAddedAt > (video.createdAt + 10) ? video.lastAddedAt : null },
            { type: 'Added', date: video.lastAddedAt || video.createdAt }
        ].filter(e => e.date).sort((a, b) => (b.date || 0) - (a.date || 0));

        if (events.length > 0 && events[0].date) {
            return `${events[0].type} ${formatDistanceToNow(new Date(events[0].date * 1000), { addSuffix: true })}`;
        }
        
        return '';
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`group relative w-full border-b last:border-b-0 hover:bg-accent/30 transition-colors ${isDragging ? 'opacity-50 z-50' : ''} ${video.watched ? 'opacity-60' : ''}`}
        >
            <div className="flex items-center gap-3 p-2 cursor-default">
                {/* Drag Handle */}
                <div
                    {...attributes}
                    {...listeners}
                    className="flex-shrink-0 cursor-grab active:cursor-grabbing p-1 text-muted-foreground/50 hover:text-muted-foreground transition-colors"
                >
                    <GripVertical className="h-5 w-5" />
                </div>

                {/* Clickable Area (Thumbnail + Metadata) */}
                <div
                    className="flex-1 min-w-0 flex items-center gap-3 cursor-pointer"
                    onClick={handlePlay}
                >
                    {/* Thumbnail */}
                    <div className="relative w-48 aspect-video flex-shrink-0 rounded-md overflow-hidden bg-muted">
                        {video.thumbnailUrl && (
                            <img
                                src={video.thumbnailUrl}
                                alt={video.title}
                                className="w-full h-full object-cover"
                            />
                        )}
                        {video.duration && (
                            <Badge className="absolute bottom-1 right-1 bg-black/80 text-white text-[10px] px-1 py-0 h-4 border-none">
                                {formatDuration(video.duration)}
                            </Badge>
                        )}
                        {video.watched && (
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                <Check className="h-8 w-8 text-white" />
                            </div>
                        )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0 flex flex-col gap-1">
                        <h3 className="font-semibold text-sm line-clamp-2 leading-tight hover:text-primary transition-colors" title={video.title}>
                            {video.title}
                        </h3>
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-muted-foreground">
                            <span
                                className="font-medium hover:text-foreground truncate"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    window.location.href = `/channels?channelId=${video.channelId}`;
                                }}
                            >
                                {video.channelName || 'Unknown Channel'}
                            </span>
                            <span>•</span>
                            {video.viewCount !== null && (
                                <>
                                    <span>{formatViews(video.viewCount)}</span>
                                    <span>•</span>
                                </>
                            )}
                            <span>{formatPublishedDate(video.publishedDate)}</span>
                            {formatEventDate() && (
                                <>
                                    <span>•</span>
                                    <span className="text-primary/80 font-medium">{formatEventDate()}</span>
                                </>
                            )}
                        </div>

                        {/* Tags Badges */}
                        {video.tags && video.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1">
                                {video.tags.map((tag) => (
                                    <Badge
                                        key={tag.id}
                                        variant="outline"
                                        style={{
                                            backgroundColor: `${tag.color}15`,
                                            color: tag.color || 'inherit',
                                            borderColor: `${tag.color}40`,
                                        }}
                                        className="text-[10px] px-1.5 py-0 h-4 font-medium"
                                    >
                                        {tag.name}
                                    </Badge>
                                ))}
                            </div>
                        )}

                        {/* Status Icons */}
                        <div className="flex items-center gap-2 mt-0.5">
                            {video.favorite && (
                                <Star className="h-3.5 w-3.5 fill-primary text-primary" />
                            )}
                            {video.priority !== 'none' && (
                                <Badge variant="outline" className="text-[10px] px-1 py-0 h-4 border-primary/30 text-primary">
                                    {video.priority}
                                </Badge>
                            )}
                        </div>
                    </div>
                </div>

                {/* Actions (Outside the clickable play area) */}
                <div className="flex items-center gap-1">
                    <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 hidden group-hover:flex"
                        onClick={(e) => {
                            e.stopPropagation();
                            handleToggleWatched(e);
                        }}
                        title={video.watched ? "Mark as unwatched" : "Mark as watched"}
                    >
                        <Check className={`h-4 w-4 ${video.watched ? 'text-primary' : ''}`} />
                    </Button>
                    <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 hidden group-hover:flex"
                        onClick={(e) => {
                            e.stopPropagation();
                            handleToggleFavorite(e);
                        }}
                        title={video.favorite ? "Remove from favorites" : "Add to favorites"}
                    >
                        <Star className={`h-4 w-4 ${video.favorite ? 'fill-primary text-primary' : ''}`} />
                    </Button>

                    <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 hidden group-hover:flex"
                        onClick={(e) => {
                            e.stopPropagation();
                            setIsTagPopoverOpen(true);
                            fetchTags();
                        }}
                        title="Manage Tags"
                    >
                        <TagIcon className="h-4 w-4" />
                    </Button>

                    <CommandDialog 
                        open={isTagPopoverOpen} 
                        onOpenChange={setIsTagPopoverOpen}
                        title="Manage Tags"
                        description="Search or create tags for this video"
                    >
                        <CommandInput
                            placeholder="Search or create tag..."
                            value={searchQuery}
                            onValueChange={setSearchQuery}
                        />
                        <CommandList>
                            <CommandEmpty>
                                {searchQuery.trim() && (
                                    <Button
                                        variant="ghost"
                                        className="w-full justify-start text-xs h-8"
                                        onClick={() => handleCreateTag(searchQuery)}
                                        disabled={isUpdatingTags}
                                    >
                                        <Plus className="h-3 w-3 mr-2" />
                                        Create "{searchQuery}"
                                    </Button>
                                )}
                                {!searchQuery.trim() && "No tags found."}
                            </CommandEmpty>
                            <CommandGroup heading="Recent Tags">
                                {availableTags.map((tag) => {
                                    const isSelected = video.tags?.some(t => t.id === tag.id);
                                    return (
                                        <CommandItem
                                            key={tag.id}
                                            onSelect={() => handleToggleTag(tag.id)}
                                            className="flex items-center justify-between"
                                        >
                                            <div className="flex items-center gap-2">
                                                <div
                                                    className="w-2 h-2 rounded-full"
                                                    style={{ backgroundColor: tag.color || '#94a3b8' }}
                                                />
                                                <span>{tag.name}</span>
                                            </div>
                                            {isSelected && <Check className="h-3 w-3" />}
                                        </CommandItem>
                                    );
                                })}
                            </CommandGroup>
                        </CommandList>
                    </CommandDialog>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                size="icon"
                                variant="ghost"
                                className="h-8 w-8"
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
                                handleDelete();
                            }} className="text-destructive">
                                <Trash2 className="mr-2 h-4 w-4" />
                                Remove from watch later list
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        </div>
    );
}
