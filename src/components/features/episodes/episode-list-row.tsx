'use client';

import { useState } from 'react';
import Image from 'next/image';
import { MediaEpisode, Tag } from '@/lib/domain/models';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
    Check,
    Star,
    MoreVertical,
    Trash2,
    GripVertical,
    ArrowUp,
    ArrowDown,
    Tag as TagIcon,
    Plus,
    Youtube,
    Mic,
} from 'lucide-react';
import {
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

interface EpisodeListRowProps {
    episode: MediaEpisode;
    onUpdate?: () => void;
    onDelete?: () => void;
}

export function EpisodeListRow({ episode, onUpdate, onDelete }: EpisodeListRowProps) {
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
    } = useSortable({ id: episode.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 50 : 'auto',
    };

    const handleToggleWatched = async (e: React.MouseEvent) => {
        e.stopPropagation();
        try {
            const response = await fetch(`/api/episodes/${episode.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ watched: !episode.watched }),
            });

            if (!response.ok) throw new Error('Failed to update episode');

            toast.success(episode.watched ? 'Marked as unwatched' : 'Marked as watched');
            onUpdate?.();
        } catch {
            toast.error('Failed to update episode');
        }
    };

    const handleToggleFavorite = async (e: React.MouseEvent) => {
        e.stopPropagation();
        try {
            const response = await fetch(`/api/episodes/${episode.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ favorite: !episode.favorite }),
            });

            if (!response.ok) throw new Error('Failed to update episode');

            toast.success(episode.favorite ? 'Removed from favorites' : 'Added to favorites');
            onUpdate?.();
        } catch {
            toast.error('Failed to update episode');
        }
    };

    const handleDelete = async () => {
        try {
            const response = await fetch(`/api/episodes/${episode.id}`, {
                method: 'DELETE',
            });

            if (!response.ok) throw new Error('Failed to delete episode');

            toast.success(`${episode.type === 'podcast' ? 'Podcast' : 'Video'} removed from list`);
            onDelete?.();
        } catch {
            toast.error('Failed to remove episode');
        }
    };

    const handleHardDelete = async () => {
        try {
            const response = await fetch(`/api/episodes/${episode.id}?permanent=true`, {
                method: 'DELETE',
            });

            if (!response.ok) throw new Error('Failed to permanently delete episode');

            toast.success(`${episode.type === 'podcast' ? 'Podcast' : 'Video'} permanently deleted`);
            onDelete?.();
        } catch {
            toast.error('Failed to permanently delete episode');
        }
    };

    const handleRestore = async () => {
        try {
            const response = await fetch(`/api/episodes/${episode.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ isDeleted: false }),
            });

            if (!response.ok) throw new Error('Failed to restore episode');

            toast.success(`${episode.type === 'podcast' ? 'Podcast' : 'Video'} restored to watch list`);
            window.dispatchEvent(new Event('episode-restored'));
            onUpdate?.();
        } catch {
            toast.error('Failed to restore episode');
        }
    };

    const handleReorder = async (position: 'beginning' | 'end') => {
        try {
            const response = await fetch(`/api/episodes/${episode.id}/reorder`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ position }),
            });

            if (!response.ok) throw new Error('Failed to reorder');

            toast.success(`Moved to ${position}`);
            onUpdate?.();
        } catch {
            toast.error('Failed to reorder episode');
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
            const currentTagIds = episode.tags?.map(t => t.id) || [];
            const isTagSelected = currentTagIds.includes(tagId);
            const newTagIds = isTagSelected
                ? currentTagIds.filter(id => id !== tagId)
                : [...currentTagIds, tagId];

            const response = await fetch(`/api/episodes/${episode.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ tagIds: newTagIds }),
            });

            if (!response.ok) throw new Error('Failed to update tags');

            toast.success('Tags updated');
            onUpdate?.();
        } catch {
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

    const handlePlay = async () => {
        window.open(episode.url, '_blank');
        
        const watchAction = localStorage.getItem('watchAction') || 'pending';
        if (watchAction === 'watched' && episode.watchStatus === 'unwatched') {
            try {
                const response = await fetch(`/api/episodes/${episode.id}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ watched: true, watchStatus: 'watched' }),
                });
                if (response.ok) {
                    toast.success('Marked as watched');
                    onUpdate?.();
                }
            } catch (error) {
                console.error('Failed to mark as watched:', error);
            }
        } else if (watchAction === 'pending' && episode.watchStatus === 'unwatched') {
            try {
                const response = await fetch(`/api/episodes/${episode.id}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ watchStatus: 'pending' }),
                });
                if (response.ok) {
                    toast.success('Marked as pending confirmation');
                    onUpdate?.();
                }
            } catch (error) {
                console.error('Failed to set pending status:', error);
            }
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
        } catch {
            return dateStr;
        }
    };

    const formatEventDate = () => {
        if (episode.lastRemovedAt && episode.isDeleted) {
            return `Removed ${formatDistanceToNow(new Date(episode.lastRemovedAt * 1000), { addSuffix: true })}`;
        }
        
        // Find the latest significant event
        const events = [
            { type: 'Watched', date: episode.lastWatchedAt },
            { type: 'Restored', date: episode.lastAddedAt && episode.lastAddedAt > (episode.createdAt + 10) ? episode.lastAddedAt : null },
            { type: 'Added', date: episode.lastAddedAt || episode.createdAt }
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
            className={`group relative w-full border-b last:border-b-0 hover:bg-accent/30 transition-colors ${isDragging ? 'opacity-50 z-50' : ''} ${episode.watched ? 'opacity-60' : ''}`}
        >
            <div className="flex flex-col sm:flex-row w-full">
                <div className="flex items-center gap-2 sm:gap-3 p-2 cursor-default flex-1 min-w-0">
                    {/* Drag Handle */}
                    <div
                        {...attributes}
                        {...listeners}
                        className="flex-shrink-0 cursor-grab active:cursor-grabbing p-1 text-muted-foreground/50 hover:text-muted-foreground transition-colors"
                    >
                        <GripVertical className="h-4 w-4 sm:h-5 sm:w-5" />
                    </div>

                    {/* Clickable Area (Thumbnail + Metadata) */}
                    <div
                        className="flex-1 min-w-0 flex items-center gap-2 sm:gap-3 cursor-pointer"
                        onClick={handlePlay}
                    >
                        {/* Thumbnail */}
                        <div className="relative w-28 xs:w-32 sm:w-48 aspect-video flex-shrink-0 rounded-md overflow-hidden bg-muted">
                            {episode.thumbnailUrl && (
                                <Image
                                    src={episode.thumbnailUrl}
                                    alt={episode.title}
                                    fill
                                    className="object-cover"
                                    unoptimized
                                />
                            )}
                            {episode.duration && (
                                <Badge className="absolute bottom-1 right-1 bg-black/80 text-white text-[10px] px-1 py-0 h-4 border-none">
                                    {formatDuration(episode.duration)}
                                </Badge>
                            )}
                            {episode.watched && (
                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                    <Check className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
                                </div>
                            )}
                            {/* Media Type Icon */}
                            <div className="absolute top-1 right-1">
                                {episode.type === 'podcast' ? (
                                    <Mic className="h-3 w-3 text-white drop-shadow-md" />
                                ) : (
                                    <Youtube className="h-3 w-3 text-white drop-shadow-md" />
                                )}
                            </div>
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0 flex flex-col gap-0.5 sm:gap-1">
                            <h3 className="font-semibold text-xs sm:text-sm line-clamp-2 leading-tight hover:text-primary transition-colors" title={episode.title}>
                                {episode.title}
                            </h3>
                            <div className="flex flex-wrap items-center gap-x-1 sm:gap-x-2 gap-y-0.5 text-[10px] sm:text-xs text-muted-foreground">
                                <span
                                    className="font-medium hover:text-foreground truncate"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        window.location.href = `/channels?channelId=${episode.channelId}`;
                                    }}
                                >
                                    {episode.channelName || 'Unknown Channel'}
                                </span>
                                <span>•</span>
                                {episode.viewCount !== null && episode.type === 'video' && (
                                    <>
                                        <span>{formatViews(episode.viewCount)}</span>
                                        <span>•</span>
                                    </>
                                )}
                                <span>{formatPublishedDate(episode.publishedDate)}</span>
                                {formatEventDate() && (
                                    <>
                                        <span>•</span>
                                        <span className="text-primary/80 font-medium">{formatEventDate()}</span>
                                    </>
                                )}
                            </div>

                            {/* Tags Badges (Only on desktop, mobile has them in the info row or we can keep them here) */}
                            {episode.tags && episode.tags.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-0.5 sm:mt-1">
                                    {episode.tags.map((tag) => (
                                        <Badge
                                            key={tag.id}
                                            variant="outline"
                                            style={{
                                                backgroundColor: `${tag.color}15`,
                                                color: tag.color || 'inherit',
                                                borderColor: `${tag.color}40`,
                                            }}
                                            className="text-[9px] sm:text-[10px] px-1 sm:px-1.5 py-0 h-3.5 sm:h-4 font-medium"
                                        >
                                            {tag.name}
                                        </Badge>
                                    ))}
                                </div>
                            )}

                            {/* Status Icons */}
                            <div className="flex items-center gap-2 mt-0.5">
                                {episode.favorite && (
                                    <Star className="h-3 w-3 sm:h-3.5 sm:w-3.5 fill-primary text-primary" />
                                )}
                                {episode.priority !== 'none' && (
                                    <Badge variant="outline" className="text-[9px] sm:text-[10px] px-1 py-0 h-3.5 sm:h-4 border-primary/30 text-primary">
                                        {episode.priority}
                                    </Badge>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Actions (Outside the clickable play area) */}
                    <div className="flex items-center gap-1 pr-1">
                        <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 flex"
                            onClick={(e) => {
                                e.stopPropagation();
                                handleToggleWatched(e);
                            }}
                            title={episode.watched ? "Mark as unwatched" : "Mark as watched"}
                        >
                            <Check className={`h-4 w-4 ${episode.watched ? 'text-primary' : ''}`} />
                        </Button>
                        <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 flex"
                            onClick={(e) => {
                                e.stopPropagation();
                                handleToggleFavorite(e);
                            }}
                            title={episode.favorite ? "Remove from favorites" : "Add to favorites"}
                        >
                            <Star className={`h-4 w-4 ${episode.favorite ? 'fill-primary text-primary' : ''}`} />
                        </Button>

                        <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 flex"
                            onClick={(e) => {
                                e.stopPropagation();
                                setIsTagPopoverOpen(true);
                                fetchTags();
                            }}
                            title="Manage Tags"
                        >
                            <TagIcon className="h-4 w-4" />
                        </Button>

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
                                
                                <DropdownMenuSeparator />
                                
                                <DropdownMenuItem onSelect={(e) => {
                                    e.preventDefault();
                                    handleToggleWatched(e as any);
                                }}>
                                    <Check className={`mr-2 h-4 w-4 ${episode.watched ? 'text-primary' : ''}`} />
                                    {episode.watched ? 'Mark unwatched' : 'Mark watched'}
                                </DropdownMenuItem>
                                <DropdownMenuItem onSelect={(e) => {
                                    e.preventDefault();
                                    setIsTagPopoverOpen(true);
                                    fetchTags();
                                }}>
                                    <TagIcon className="mr-2 h-4 w-4" />
                                    Add tags
                                </DropdownMenuItem>
                                <DropdownMenuItem onSelect={(e) => {
                                    e.preventDefault();
                                    handleToggleFavorite(e as any);
                                }}>
                                    <Star className={`mr-2 h-4 w-4 ${episode.favorite ? 'fill-primary text-primary' : ''}`} />
                                    {episode.favorite ? 'Remove favorite' : 'Add favorite'}
                                </DropdownMenuItem>

                                <DropdownMenuSeparator />

                                {episode.isDeleted ? (
                                    <>
                                        <DropdownMenuItem onSelect={(e) => {
                                            e.preventDefault();
                                            handleRestore();
                                        }} className="text-green-600 font-medium">
                                            <Check className="mr-2 h-4 w-4" />
                                            Restore to watch list
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onSelect={(e) => {
                                            e.preventDefault();
                                            handleHardDelete();
                                        }} className="text-destructive font-medium">
                                            <Trash2 className="mr-2 h-4 w-4" />
                                            Remove permanently
                                        </DropdownMenuItem>
                                    </>
                                ) : (
                                    <DropdownMenuItem onSelect={(e) => {
                                        e.preventDefault();
                                        handleDelete();
                                    }} className="text-destructive">
                                        <Trash2 className="mr-2 h-4 w-4" />
                                        Remove from list
                                    </DropdownMenuItem>
                                )}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>

                {/* Mobile Specific Actions Row */}
                <div className="flex sm:hidden items-center border-t border-border/40 bg-accent/5 px-4 py-1 gap-1">
                    <Button
                        variant="ghost"
                        size="sm"
                        className="flex-1 h-8 text-[10px] gap-2 font-medium"
                        onClick={(e) => {
                            e.stopPropagation();
                            handleToggleWatched(e);
                        }}
                    >
                        <Check className={`h-3.5 w-3.5 ${episode.watched ? 'text-primary' : ''}`} />
                        {episode.watched ? 'Watched' : 'Mark Watched'}
                    </Button>
                    <div className="w-px h-4 bg-border/40" />
                    <Button
                        variant="ghost"
                        size="sm"
                        className="flex-1 h-8 text-[10px] gap-2 font-medium"
                        onClick={(e) => {
                            e.stopPropagation();
                            handleToggleFavorite(e);
                        }}
                    >
                        <Star className={`h-3.5 w-3.5 ${episode.favorite ? 'fill-primary text-primary' : ''}`} />
                        {episode.favorite ? 'Favorited' : 'Favorite'}
                    </Button>
                    <div className="w-px h-4 bg-border/40" />
                    <Button
                        variant="ghost"
                        size="sm"
                        className="flex-1 h-8 text-[10px] gap-2 font-medium"
                        onClick={(e) => {
                            e.stopPropagation();
                            setIsTagPopoverOpen(true);
                            fetchTags();
                        }}
                    >
                        <TagIcon className="h-3.5 w-3.5" />
                        Tags
                    </Button>
                </div>
            </div>

            <CommandDialog 
                open={isTagPopoverOpen} 
                onOpenChange={setIsTagPopoverOpen}
                title="Manage Tags"
                description="Search or create tags for this episode"
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
                                Create &quot;{searchQuery}&quot;
                            </Button>
                        )}
                        {!searchQuery.trim() && "No tags found."}
                    </CommandEmpty>
                    <CommandGroup heading="Recent Tags">
                        {availableTags.map((tag) => {
                            const isSelected = episode.tags?.some(t => t.id === tag.id);
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
        </div>
    );
}
