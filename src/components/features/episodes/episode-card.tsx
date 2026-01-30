import { useState } from 'react';
import { MediaEpisode, Tag } from '@/lib/domain/models';
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
    Tag as TagIcon,
    Plus,
    Youtube,
    Mic,
    Clock,
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

interface EpisodeCardProps {
    episode: MediaEpisode;
    onUpdate?: () => void;
    onDelete?: () => void;
}

export function EpisodeCard({ episode, onUpdate, onDelete }: EpisodeCardProps) {
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
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
    } = useSortable({ id: episode.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    const handleToggleWatched = async () => {
        try {
            const response = await fetch(`/api/episodes/${episode.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ watched: !episode.watched }),
            });

            if (!response.ok) throw new Error('Failed to update episode');

            toast.success(episode.watched ? 'Marked as unwatched' : 'Marked as watched');
            onUpdate?.();
        } catch (error) {
            toast.error('Failed to update episode');
        }
    };

    const handleToggleFavorite = async () => {
        try {
            const response = await fetch(`/api/episodes/${episode.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ favorite: !episode.favorite }),
            });

            if (!response.ok) throw new Error('Failed to update episode');

            toast.success(episode.favorite ? 'Removed from favorites' : 'Added to favorites');
            onUpdate?.();
        } catch (error) {
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
            setIsDeleteDialogOpen(false);
            onDelete?.();
        } catch (error) {
            toast.error('Failed to delete episode');
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
        } catch (error) {
            toast.error('Failed to reorder episode');
        }
    };

    const handlePlay = async () => {
        window.open(episode.url, '_blank');
        
        const watchAction = localStorage.getItem('watchAction') || 'pending';
        if (watchAction === 'watched' && episode.watchStatus === 'unwatched') {
            handleToggleWatched();
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
            // 1. Create the tag
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

            // 2. Add tag to episode
            await handleToggleTag(newTag.id);

            setSearchQuery('');
            fetchTags(); // Refresh local list
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Failed to create tag');
        } finally {
            setIsUpdatingTags(false);
        }
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

    const formatEventDate = () => {
        if (episode.lastRemovedAt && episode.isDeleted) {
            return `Removed ${formatDistanceToNow(new Date(episode.lastRemovedAt * 1000), { addSuffix: true })}`;
        }
        
        // Find the latest significant event
        const events = [
            { type: 'Watched', date: episode.lastWatchedAt },
            { type: 'Status updated', date: episode.lastPendingAt },
            { type: 'Restored', date: episode.lastAddedAt && episode.lastAddedAt > (episode.createdAt + 10) ? episode.lastAddedAt : null },
            { type: 'Added', date: episode.lastAddedAt || episode.createdAt }
        ].filter(e => e.date).sort((a, b) => (b.date || 0) - (a.date || 0));

        if (events.length > 0 && events[0].date) {
            return `${events[0].type} ${formatDistanceToNow(new Date(events[0].date * 1000), { addSuffix: true })}`;
        }
        
        return '';
    };

    return (
        <div ref={setNodeRef} style={style} className="h-full">
            <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <Card className={`group relative h-full flex flex-col overflow-hidden ${episode.watched ? 'opacity-60' : ''} ${episode.watchStatus === 'pending' ? 'ring-2 ring-primary ring-offset-2 ring-offset-background' : ''}`}>
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
                            {episode.thumbnailUrl && (
                                <img
                                    src={episode.thumbnailUrl}
                                    alt={episode.title}
                                    className="w-full h-full object-cover"
                                />
                            )}

                            {/* Media Type Icon */}
                            <div className="absolute top-2 right-2">
                                {episode.type === 'podcast' ? (
                                    <Badge className="bg-purple-600 text-white border-none px-1.5 py-0.5">
                                        <Mic className="h-3 w-3 mr-1" />
                                        Podcast
                                    </Badge>
                                ) : (
                                    <Badge className="bg-red-600 text-white border-none px-1.5 py-0.5">
                                        <Youtube className="h-3 w-3 mr-1" />
                                        Video
                                    </Badge>
                                )}
                            </div>

                            {/* Duration Badge */}
                            {episode.duration && (
                                <Badge className="absolute bottom-2 right-2 bg-black/80 text-white border-none">
                                    {formatDuration(episode.duration)}
                                </Badge>
                            )}

                            {/* Watched Overlay */}
                            {episode.watched && (
                                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                    <Check className="h-12 w-12 text-white" />
                                </div>
                            )}

                            {/* Pending Overlay */}
                            {episode.watchStatus === 'pending' && !episode.watched && (
                                <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center backdrop-blur-[1px] group/pending">
                                    <div className="bg-primary text-primary-foreground px-3 py-1.5 rounded-full flex items-center gap-2 font-semibold shadow-lg animate-pulse mb-3">
                                        <Clock className="h-4 w-4" />
                                        Watched?
                                    </div>
                                    <Button 
                                        size="sm" 
                                        variant="default" 
                                        className="h-8 shadow-md opacity-0 group-hover/pending:opacity-100 transition-opacity"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleToggleWatched();
                                        }}
                                    >
                                        <Check className="h-4 w-4 mr-2" />
                                        Confirm
                                    </Button>
                                </div>
                            )}
                        </div>

                        {/* Title and Channel */}
                        <div className="mb-2">
                            <h3
                                className="font-semibold line-clamp-2 mb-1 cursor-pointer hover:text-primary transition-colors"
                                title={episode.title}
                                onClick={handlePlay}
                            >
                                {episode.title}
                            </h3>
                            <div className="flex flex-wrap items-center gap-x-1 gap-y-0 text-xs text-muted-foreground">
                                <span
                                    className="hover:text-foreground cursor-pointer font-medium"
                                    onClick={() => window.location.href = `/channels?channelId=${episode.channelId}`}
                                >
                                    {episode.channelName || 'Unknown Channel'}
                                </span>
                                {episode.viewCount !== null && episode.type === 'video' && (
                                    <>
                                        <span>•</span>
                                        <span>{formatViews(episode.viewCount)}</span>
                                    </>
                                )}
                                {episode.publishedDate && (
                                    <>
                                        <span>•</span>
                                        <span>{formatPublishedDate(episode.publishedDate)}</span>
                                    </>
                                )}
                                {formatEventDate() && (
                                    <>
                                        <span>•</span>
                                        <span className="text-primary/80 font-medium">{formatEventDate()}</span>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Badges */}
                        <div className="flex flex-wrap gap-2 mb-auto pb-3">
                            {episode.favorite && (
                                <Badge variant="secondary" className="gap-1">
                                    <Star className="h-3 w-3 fill-current" />
                                    Favorite
                                </Badge>
                            )}
                            {episode.priority !== 'none' && (
                                <Badge className={getPriorityColor(episode.priority)}>
                                    {episode.priority.charAt(0).toUpperCase() + episode.priority.slice(1)}
                                </Badge>
                            )}
                            {episode.watchStatus === 'pending' && (
                                <Badge variant="default" className="gap-1">
                                    <Clock className="h-3 w-3" />
                                    Pending Confirmation
                                </Badge>
                            )}
                            {episode.tags?.map((tag) => (
                                <Badge
                                    key={tag.id}
                                    variant="outline"
                                    style={{
                                        backgroundColor: `${tag.color}15`,
                                        color: tag.color || 'inherit',
                                        borderColor: `${tag.color}40`,
                                    }}
                                    className="font-medium"
                                >
                                    {tag.name}
                                </Badge>
                            ))}
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2 mt-2">
                            <Button
                                size="sm"
                                variant={episode.watchStatus === 'pending' ? 'default' : (episode.watched ? 'secondary' : 'outline')}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleToggleWatched();
                                }}
                                className="flex-1"
                                title={episode.watchStatus === 'pending' ? "Confirm watched" : (episode.watched ? "Mark as unwatched" : "Mark as watched")}
                            >
                                {episode.watchStatus === 'pending' ? (
                                    <>
                                        <Check className="h-4 w-4 mr-2" />
                                        Confirm Watched
                                    </>
                                ) : (
                                    <>
                                        <Check className={`h-4 w-4 mr-2 ${episode.watched ? 'text-primary' : ''}`} />
                                        {episode.watched ? 'Watched' : 'Mark Watched'}
                                    </>
                                )}
                            </Button>

                            <Button
                                size="sm"
                                variant={episode.favorite ? 'secondary' : 'outline'}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleToggleFavorite();
                                }}
                                title={episode.favorite ? "Remove from favorites" : "Add to favorites"}
                            >
                                <Star className={`h-4 w-4 ${episode.favorite ? 'fill-primary text-primary' : ''}`} />
                            </Button>

                            <Button
                                size="sm"
                                variant="outline"
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
                                                Create "{searchQuery}"
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
                                        Remove from list
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </CardContent>

                    {/* Bottom Drag Handle Line */}
                    <div
                        {...attributes}
                        {...listeners}
                        className="absolute bottom-0 left-0 w-full h-1.5 bg-primary opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing z-20"
                    />
                </Card>

                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Remove from list</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to remove "{episode.title}"? This action cannot be undone.
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
