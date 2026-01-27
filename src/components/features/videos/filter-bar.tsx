'use client';

import { useState } from 'react';
import { Search, Filter, Play, Tag as TagIcon, X } from 'lucide-react';
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
import { Tag } from '@/lib/domain/models';
import { useEffect } from 'react';

interface FilterBarProps {
    onFilterChange?: (filters: any) => void;
    onSortChange?: (sort: any) => void;
    initialFilters?: any;
    initialSort?: {
        field: string;
        order: 'asc' | 'desc';
    };
}

export function FilterBar({ onFilterChange, onSortChange, initialFilters, initialSort }: FilterBarProps) {
    const [search, setSearch] = useState(initialFilters?.search || '');
    const [watchedFilter, setWatchedFilter] = useState<string>(
        initialFilters?.watched === undefined ? 'all' : (initialFilters.watched ? 'watched' : 'unwatched')
    );
    const [selectedTagIds, setSelectedTagIds] = useState<string[]>(initialFilters?.tagIds || []);
    const [tags, setTags] = useState<Tag[]>([]);
    const [sortField, setSortField] = useState(initialSort?.field || 'created_at');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>(initialSort?.order || 'desc');
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
            watched: watchedFilter === 'all' ? undefined : watchedFilter === 'watched',
            tagIds: selectedTagIds.length > 0 ? selectedTagIds : undefined,
        });
    };

    const handleWatchedFilterChange = (value: string) => {
        setWatchedFilter(value);
        onFilterChange?.({
            search: search || undefined,
            watched: value === 'all' ? undefined : value === 'watched',
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
            watched: watchedFilter === 'all' ? undefined : watchedFilter === 'watched',
            tagIds: newSelected.length > 0 ? newSelected : undefined,
        });
    };

    const clearTags = () => {
        setSelectedTagIds([]);
        onFilterChange?.({
            search: search || undefined,
            watched: watchedFilter === 'all' ? undefined : watchedFilter === 'watched',
            tagIds: undefined,
        });
    };

    const handleSortChange = (field: string) => {
        setSortField(field);
        onSortChange?.({ field, order: sortOrder });
    };

    const handleOrderChange = () => {
        const newOrder = sortOrder === 'asc' ? 'desc' : 'asc';
        setSortOrder(newOrder);
        onSortChange?.({ field: sortField, order: newOrder });
    };

    return (
        <div className="flex flex-col mb-6">
            <div className="flex flex-col lg:flex-row gap-4 mb-4">
                {/* Search */}
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search videos..."
                        value={search}
                        onChange={(e) => handleSearchChange(e.target.value)}
                        className="pl-10"
                    />
                </div>

                {/* Filters & Sort */}
                <div className="flex flex-row items-center gap-2 overflow-x-auto lg:overflow-visible pb-1 lg:pb-0 no-scrollbar">
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

                    <div className="flex gap-2 lg:flex-none flex-1 min-w-[120px]">
                        <Select value={sortField} onValueChange={handleSortChange}>
                            <SelectTrigger className="h-9 lg:w-[180px] flex-1">
                                <SelectValue placeholder="Sort by" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="custom">Manual</SelectItem>
                                <SelectItem value="created_at">Date Added</SelectItem>
                                <SelectItem value="priority">Priority</SelectItem>
                                <SelectItem value="favorite">Favorite</SelectItem>
                                <SelectItem value="duration">Duration</SelectItem>
                                <SelectItem value="title">Title</SelectItem>
                            </SelectContent>
                        </Select>

                        <Button variant="outline" size="icon" onClick={handleOrderChange} className="h-9 w-9 flex-shrink-0">
                            {sortOrder === 'desc' ? '↓' : '↑'}
                        </Button>

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
