'use client';

import { useState } from 'react';
import { Search, Play, Tag as TagIcon, X, Clock, Star, Gem, Tv, Check, StickyNote, XCircle, Video, Youtube, Mic, ThumbsUp, ThumbsDown } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import {
    CommandDialog,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import { Tag } from '@/lib/domain/models';
import { useEffect } from 'react';

interface FilterBarProps {
    onFilterChange?: (filters: {
        search?: string;
        watched?: boolean;
        watchStatus?: 'unwatched' | 'pending' | 'watched';
        tagIds?: string[];
        channelIds?: string[];
        favorite?: boolean;
        hasNotes?: boolean;
        type?: 'video' | 'podcast';
        isShort?: boolean;
        likeStatus?: 'none' | 'like' | 'dislike';
        priority?: 'none' | 'low' | 'medium' | 'high';
    }) => void;
    onSortChange?: (sort: { field: string; order: 'asc' | 'desc' }) => void;
    initialFilters?: {
        search?: string;
        watched?: boolean;
        watchStatus?: 'unwatched' | 'pending' | 'watched';
        tagIds?: string[];
        channelIds?: string[];
        favorite?: boolean;
        hasNotes?: boolean;
        type?: 'video' | 'podcast';
        isShort?: boolean;
        likeStatus?: 'none' | 'like' | 'dislike';
        priority?: 'none' | 'low' | 'medium' | 'high';
    };
    initialSort?: {
        field: string;
        order: 'asc' | 'desc';
    };
    availableChannels?: { id: string; name: string }[];
    showManualSort?: boolean;
}

export function FilterBar({ onFilterChange, onSortChange, initialFilters, initialSort, availableChannels, showManualSort = true }: FilterBarProps) {
    const [search, setSearch] = useState(initialFilters?.search || '');
    const [watchedFilter, setWatchedFilter] = useState<string>(
        initialFilters?.watchStatus === 'pending' ? 'pending' : 
        (initialFilters?.watched === undefined ? 'all' : (initialFilters.watched ? 'watched' : 'unwatched'))
    );
    const [selectedTagIds, setSelectedTagIds] = useState<string[]>(initialFilters?.tagIds || []);
    const [selectedChannelIds, setSelectedChannelIds] = useState<string[]>(initialFilters?.channelIds || []);
    const [tags, setTags] = useState<Tag[]>([]);
    const [sortField, setSortField] = useState(initialSort?.field || 'created_at');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>(initialSort?.order || 'desc');
    const [showTags, setShowTags] = useState(initialFilters?.tagIds && initialFilters.tagIds.length > 0);
    const [priorityFilter, setPriorityFilter] = useState(initialFilters?.priority === 'high');
    const [favoriteFilter, setFavoriteFilter] = useState(initialFilters?.favorite || false);
    const [hasNotesFilter, setHasNotesFilter] = useState(initialFilters?.hasNotes || false);
    const [likeFilter, setLikeFilter] = useState<'all' | 'like' | 'dislike'>(initialFilters?.likeStatus === 'like' ? 'like' : (initialFilters?.likeStatus === 'dislike' ? 'dislike' : 'all'));
    const [typeFilter, setTypeFilter] = useState<'all' | 'video' | 'shorts' | 'podcast'>(
        initialFilters?.isShort ? 'shorts' : 
        (initialFilters?.type === 'podcast' ? 'podcast' : 
        (initialFilters?.type === 'video' && initialFilters?.isShort === false ? 'video' : 'all'))
    );
    const [isChannelMenuOpen, setIsChannelMenuOpen] = useState(false);

    // Track previous props to sync state in render
    const [prevInitialFilters, setPrevInitialFilters] = useState(initialFilters);
    const [prevInitialSort, setPrevInitialSort] = useState(initialSort);

    // Sync local state when initialFilters changes (URL changes)
    if (initialFilters !== prevInitialFilters) {
        setPrevInitialFilters(initialFilters);
        if (initialFilters) {
            const newSearch = initialFilters.search || '';
            if (search !== newSearch) setSearch(newSearch);
            
            const status = initialFilters.watchStatus || 
                         (initialFilters.watched === undefined ? 'all' : (initialFilters.watched ? 'watched' : 'unwatched'));
            if (watchedFilter !== status) setWatchedFilter(status);
            
            if (JSON.stringify(initialFilters.tagIds) !== JSON.stringify(selectedTagIds)) {
                setSelectedTagIds(initialFilters.tagIds || []);
            }
            if (JSON.stringify(initialFilters.channelIds) !== JSON.stringify(selectedChannelIds)) {
                setSelectedChannelIds(initialFilters.channelIds || []);
            }
            
            if (favoriteFilter !== (initialFilters.favorite || false)) {
                setFavoriteFilter(initialFilters.favorite || false);
            }
            if (hasNotesFilter !== (initialFilters.hasNotes || false)) {
                setHasNotesFilter(initialFilters.hasNotes || false);
            }
            
            if (priorityFilter !== (initialFilters.priority === 'high')) {
                setPriorityFilter(initialFilters.priority === 'high');
            }
            
            const newLike = initialFilters.likeStatus === 'like' ? 'like' : (initialFilters.likeStatus === 'dislike' ? 'dislike' : 'all');
            if (likeFilter !== newLike) setLikeFilter(newLike);
            
            const newType = initialFilters.isShort ? 'shorts' : 
                           (initialFilters.type === 'podcast' ? 'podcast' : 
                           (initialFilters.type === 'video' && initialFilters.isShort === false ? 'video' : 'all'));
            if (typeFilter !== newType) setTypeFilter(newType);
        }
    }

    // Sync local state when initialSort changes
    if (initialSort !== prevInitialSort) {
        setPrevInitialSort(initialSort);
        if (initialSort) {
            if (sortField !== initialSort.field) setSortField(initialSort.field);
            if (sortOrder !== initialSort.order) setSortOrder(initialSort.order);
        }
    }

    useEffect(() => {
        const fetchTags = async () => {
            try {
                const response = await fetch('/api/tags?sort=usage');
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

    const triggerFilterChange = (overrides: Partial<{
        search: string;
        watchedFilter: string;
        tagIds: string[];
        channelIds: string[];
        favorite: boolean;
        hasNotes: boolean;
        likeStatus: 'all' | 'like' | 'dislike';
        typeFilter: 'all' | 'video' | 'shorts' | 'podcast';
        priorityFilter: boolean;
    }> = {}) => {
        const currentSearch = overrides.search !== undefined ? overrides.search : search;
        const currentWatched = overrides.watchedFilter !== undefined ? overrides.watchedFilter : watchedFilter;
        const currentTagIds = overrides.tagIds !== undefined ? overrides.tagIds : selectedTagIds;
        const currentChannelIds = overrides.channelIds !== undefined ? overrides.channelIds : selectedChannelIds;
        const currentFavorite = overrides.favorite !== undefined ? overrides.favorite : favoriteFilter;
        const currentHasNotes = overrides.hasNotes !== undefined ? overrides.hasNotes : hasNotesFilter;
        const currentLikeStatus = overrides.likeStatus !== undefined ? overrides.likeStatus : likeFilter;
        const currentTypeFilter = overrides.typeFilter !== undefined ? overrides.typeFilter : typeFilter;
        const currentPriority = overrides.priorityFilter !== undefined ? overrides.priorityFilter : priorityFilter;

        onFilterChange?.({
            search: currentSearch || undefined,
            watched: currentWatched === 'watched' ? true : (currentWatched === 'all' ? undefined : false),
            watchStatus: (currentWatched === 'all' ? undefined : (currentWatched === 'watched' ? 'watched' : currentWatched)) as 'unwatched' | 'pending' | 'watched' | undefined,
            tagIds: currentTagIds.length > 0 ? currentTagIds : undefined,
            channelIds: currentChannelIds.length > 0 ? currentChannelIds : undefined,
            favorite: currentFavorite ? true : undefined,
            hasNotes: currentHasNotes ? true : undefined,
            likeStatus: currentLikeStatus === 'all' ? undefined : (currentLikeStatus as 'none' | 'like' | 'dislike'),
            type: currentTypeFilter === 'video' || currentTypeFilter === 'podcast' ? currentTypeFilter : undefined,
            isShort: currentTypeFilter === 'shorts' ? true : (currentTypeFilter === 'video' ? false : undefined),
            priority: currentPriority ? 'high' : undefined,
        });
    };

    const handleSearchChange = (value: string) => {
        setSearch(value);
        triggerFilterChange({ search: value });
    };

    const handleWatchedFilterChange = (value: string) => {
        setWatchedFilter(value);
        triggerFilterChange({ watchedFilter: value });
    };

    const handleTypeFilterChange = (type: 'video' | 'shorts' | 'podcast') => {
        const newValue = typeFilter === type ? 'all' : type;
        setTypeFilter(newValue);
        triggerFilterChange({ typeFilter: newValue });
    };

    const toggleTag = (tagId: string) => {
        const newSelected = selectedTagIds.includes(tagId)
            ? selectedTagIds.filter(id => id !== tagId)
            : [...selectedTagIds, tagId];
        
        setSelectedTagIds(newSelected);
        triggerFilterChange({ tagIds: newSelected });
    };

    const toggleChannel = (channelId: string) => {
        const newSelected = selectedChannelIds.includes(channelId)
            ? selectedChannelIds.filter(id => id !== channelId)
            : [...selectedChannelIds, channelId];
        
        setSelectedChannelIds(newSelected);
        triggerFilterChange({ channelIds: newSelected });
    };

    const clearTags = () => {
        setSelectedTagIds([]);
        setShowTags(false);
        triggerFilterChange({ tagIds: [] });
    };

    const handleSortChange = (field: string) => {
        setSortField(field);
        let defaultOrder: 'asc' | 'desc' = 'desc';
        if (field === 'title') {
            defaultOrder = 'asc';
        }
        setSortOrder(defaultOrder);
        onSortChange?.({ field, order: defaultOrder });
    };

    const handleOrderChange = () => {
        const newOrder = sortOrder === 'asc' ? 'desc' : 'asc';
        setSortOrder(newOrder);
        onSortChange?.({ field: sortField, order: newOrder });
    };

    const clearAllFilters = () => {
        setSearch('');
        setWatchedFilter('all');
        setSelectedTagIds([]);
        setSelectedChannelIds([]);
        setFavoriteFilter(false);
        setHasNotesFilter(false);
        setPriorityFilter(false);
        setLikeFilter('all');
        setTypeFilter('all');
        setShowTags(false);
        
        onFilterChange?.({
            search: undefined,
            watched: undefined,
            watchStatus: undefined,
            tagIds: undefined,
            channelIds: undefined,
            favorite: undefined,
            hasNotes: undefined,
            likeStatus: undefined,
            type: undefined,
            isShort: undefined,
            priority: undefined,
        });
    };

    const hasAnyFilter = search !== '' || 
                         watchedFilter !== 'all' || 
                         selectedTagIds.length > 0 || 
                         selectedChannelIds.length > 0 || 
                         favoriteFilter || 
                         hasNotesFilter || 
                         priorityFilter ||
                         likeFilter !== 'all' ||
                         typeFilter !== 'all';

    return (
        <div className="flex flex-col">
            <div className="flex flex-col xl:flex-row gap-4 mb-4">
                {/* Search */}
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search episodes..."
                        value={search}
                        onChange={(e) => handleSearchChange(e.target.value)}
                        className="pl-10 pr-10 h-10 xl:h-9"
                    />
                    {search && (
                        <button
                            onClick={() => handleSearchChange('')}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                            <XCircle className="h-4 w-4" />
                        </button>
                    )}
                </div>

                {/* Filters & Sort */}
                <div className="flex flex-row items-center gap-2 overflow-x-auto xl:overflow-visible pb-1 xl:pb-0 no-scrollbar">
                    <div className="flex gap-2 flex-shrink-0">
                        <Button
                            variant={watchedFilter === 'all' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => handleWatchedFilterChange('all')}
                            className="h-9"
                        >
                            All
                        </Button>
                        
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        variant={watchedFilter === 'unwatched' ? 'default' : 'outline'}
                                        size="icon"
                                        onClick={() => handleWatchedFilterChange('unwatched')}
                                        className="h-9 w-9 flex-shrink-0"
                                    >
                                        <Play className="h-4 w-4" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>Unwatched</TooltipContent>
                            </Tooltip>

                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        variant={watchedFilter === 'pending' ? 'default' : 'outline'}
                                        size="icon"
                                        onClick={() => handleWatchedFilterChange('pending')}
                                        className="h-9 w-9 flex-shrink-0"
                                    >
                                        <Clock className="h-4 w-4" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>Pending Confirmation</TooltipContent>
                            </Tooltip>

                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        variant={watchedFilter === 'watched' ? 'default' : 'outline'}
                                        size="icon"
                                        onClick={() => handleWatchedFilterChange('watched')}
                                        className="h-9 w-9 flex-shrink-0"
                                    >
                                        <Play className="h-4 w-4 fill-current" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>Watched</TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </div>

                    <div className="flex gap-2 xl:flex-none flex-1 min-w-[120px]">
                        <Select value={sortField} onValueChange={handleSortChange}>
                            <SelectTrigger className="h-9 xl:w-[180px] flex-1">
                                <SelectValue placeholder="Sort by" />
                            </SelectTrigger>
                            <SelectContent>
                                {showManualSort && <SelectItem value="custom">Manual</SelectItem>}
                                <SelectItem value="date_added">Date Added</SelectItem>
                                <SelectItem value="date_watched">Date Watched</SelectItem>
                                <SelectItem value="date_favorited">Date Favorited</SelectItem>
                                <SelectItem value="date_removed">Date Removed</SelectItem>
                            </SelectContent>
                        </Select>

                        <Button variant="outline" size="icon" onClick={handleOrderChange} className="h-9 w-9 flex-shrink-0">
                            {sortOrder === 'desc' ? '↓' : '↑'}
                        </Button>

                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        variant={priorityFilter ? 'default' : 'outline'}
                                        size="icon"
                                        onClick={() => {
                                            const newValue = !priorityFilter;
                                            setPriorityFilter(newValue);
                                            triggerFilterChange({ priorityFilter: newValue });
                                        }}
                                        className="h-9 w-9 flex-shrink-0"
                                    >
                                        <Gem className="h-4 w-4" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>Priority</TooltipContent>
                            </Tooltip>
                        </TooltipProvider>

                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        variant={likeFilter === 'like' ? 'default' : 'outline'}
                                        size="icon"
                                        onClick={() => {
                                            const newValue = likeFilter === 'like' ? 'all' : 'like';
                                            setLikeFilter(newValue);
                                            triggerFilterChange({ likeStatus: newValue });
                                        }}
                                        className={`h-9 w-9 flex-shrink-0 ${likeFilter === 'like' ? 'bg-primary text-primary-foreground' : ''}`}
                                    >
                                        <ThumbsUp className="h-4 w-4" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>Liked</TooltipContent>
                            </Tooltip>
                        </TooltipProvider>

                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        variant={likeFilter === 'dislike' ? 'default' : 'outline'}
                                        size="icon"
                                        onClick={() => {
                                            const newValue = likeFilter === 'dislike' ? 'all' : 'dislike';
                                            setLikeFilter(newValue);
                                            triggerFilterChange({ likeStatus: newValue });
                                        }}
                                        className={`h-9 w-9 flex-shrink-0 ${likeFilter === 'dislike' ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90' : ''}`}
                                    >
                                        <ThumbsDown className="h-4 w-4" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>Disliked</TooltipContent>
                            </Tooltip>
                        </TooltipProvider>

                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        variant={favoriteFilter ? 'default' : 'outline'}
                                        size="icon"
                                        onClick={() => {
                                            const newValue = !favoriteFilter;
                                            setFavoriteFilter(newValue);
                                            triggerFilterChange({ favorite: newValue });
                                        }}
                                        className="h-9 w-9 flex-shrink-0"
                                    >
                                        <Star className="h-4 w-4" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>Favorite</TooltipContent>
                            </Tooltip>
                        </TooltipProvider>

                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        variant={hasNotesFilter ? 'default' : 'outline'}
                                        size="icon"
                                        onClick={() => {
                                            const newValue = !hasNotesFilter;
                                            setHasNotesFilter(newValue);
                                            triggerFilterChange({ hasNotes: newValue });
                                        }}
                                        className="h-9 w-9 flex-shrink-0"
                                    >
                                        <StickyNote className="h-4 w-4" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>With Notes</TooltipContent>
                            </Tooltip>
                        </TooltipProvider>

                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        variant={selectedChannelIds.length > 0 ? "default" : "outline"}
                                        size="icon"
                                        onClick={() => setIsChannelMenuOpen(true)}
                                        className="h-9 w-9 flex-shrink-0 relative"
                                    >
                                        <Tv className="h-4 w-4" />
                                        {selectedChannelIds.length > 0 && (
                                            <Badge 
                                                className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-[10px]"
                                                variant="destructive"
                                            >
                                                {selectedChannelIds.length}
                                            </Badge>
                                        )}
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>Filter by Channel</TooltipContent>
                            </Tooltip>
                        </TooltipProvider>

                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        variant={showTags || selectedTagIds.length > 0 ? "default" : "outline"}
                                        size="icon"
                                        onClick={() => setShowTags(!showTags)}
                                        className="h-9 w-9 flex-shrink-0 relative"
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
                                <TooltipContent>Filter by Tags</TooltipContent>
                            </Tooltip>
                        </TooltipProvider>

                        <div className="flex gap-2">
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button
                                            variant={typeFilter === 'video' ? 'default' : 'outline'}
                                            size="icon"
                                            onClick={() => handleTypeFilterChange('video')}
                                            className="h-9 w-9 flex-shrink-0"
                                        >
                                            <Video className="h-4 w-4" />
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>Videos</TooltipContent>
                                </Tooltip>

                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button
                                            variant={typeFilter === 'shorts' ? 'default' : 'outline'}
                                            size="icon"
                                            onClick={() => handleTypeFilterChange('shorts')}
                                            className="h-9 w-9 flex-shrink-0"
                                        >
                                            <Youtube className="h-4 w-4" />
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>Shorts</TooltipContent>
                                </Tooltip>

                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button
                                            variant={typeFilter === 'podcast' ? 'default' : 'outline'}
                                            size="icon"
                                            onClick={() => handleTypeFilterChange('podcast')}
                                            className="h-9 w-9 flex-shrink-0"
                                        >
                                            <Mic className="h-4 w-4" />
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>Podcasts</TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        </div>

                        {hasAnyFilter && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={clearAllFilters}
                                className="h-9 px-3 text-xs text-muted-foreground hover:text-foreground flex items-center gap-1.5"
                            >
                                <X className="h-3.5 w-3.5" />
                                Clear All
                            </Button>
                        )}
                    </div>
                </div>
            </div>

            <CommandDialog 
                open={isChannelMenuOpen} 
                onOpenChange={setIsChannelMenuOpen}
                title="Filter by Channel"
                description="Search and select channels to filter your library."
            >
                <CommandInput placeholder="Search channels..." />
                <CommandList>
                    <CommandEmpty>No channels found.</CommandEmpty>
                    <CommandGroup heading="Available Channels">
                        {availableChannels?.map((channel) => {
                            const isSelected = selectedChannelIds.includes(channel.id);
                            return (
                                <CommandItem
                                    key={channel.id}
                                    onSelect={() => toggleChannel(channel.id)}
                                    className="flex items-center justify-between cursor-pointer"
                                >
                                    <div className="flex items-center gap-2">
                                        <Tv className="h-4 w-4 text-muted-foreground" />
                                        <span>{channel.name}</span>
                                    </div>
                                    {isSelected && <Check className="h-4 w-4 text-primary" />}
                                </CommandItem>
                            );
                        })}
                    </CommandGroup>
                </CommandList>
                {selectedChannelIds.length > 0 && (
                    <div className="p-2 border-t flex justify-end">
                        <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => {
                                setSelectedChannelIds([]);
                                triggerFilterChange({ channelIds: [] });
                            }}
                            className="text-xs h-8"
                        >
                            Clear Selection
                        </Button>
                    </div>
                )}
            </CommandDialog>

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
