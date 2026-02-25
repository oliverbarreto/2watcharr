'use client';

import { useState, useEffect, useRef } from 'react';
import { Search, Youtube, Mic, Tag as TagIcon, X, XCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { Tag } from '@/lib/domain/models';

interface ChannelFilterBarProps {
    onFilterChange?: (filters: {
        search?: string;
        type?: 'video' | 'podcast';
        tagIds?: string[];
    }) => void;
    initialFilters?: {
        search?: string;
        type?: 'all' | 'video' | 'podcast';
        tagIds?: string[];
    };
}

export function ChannelFilterBar({ onFilterChange, initialFilters }: ChannelFilterBarProps) {
    const [search, setSearch] = useState(initialFilters?.search || '');
    const [typeFilter, setTypeFilter] = useState<'all' | 'video' | 'podcast'>(initialFilters?.type || 'all');
    const [selectedTagIds, setSelectedTagIds] = useState<string[]>(initialFilters?.tagIds || []);
    const [tags, setTags] = useState<Tag[]>([]);
    const [showTags, setShowTags] = useState(initialFilters?.tagIds && initialFilters.tagIds.length > 0);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        // Only auto-focus on desktop (screen width >= 1024px to be safe and avoid tablets/mobile)
        if (typeof window !== 'undefined' && window.innerWidth >= 1024) {
            inputRef.current?.focus();
        }
    }, []);

    // Sync local state when initialFilters changes (URL changes)
    useEffect(() => {
        if (initialFilters) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setSearch(initialFilters.search || '');
             
            setTypeFilter(initialFilters.type || 'all');
             
            setSelectedTagIds(initialFilters.tagIds || []);
        }
    }, [initialFilters]);

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
            type: typeFilter === 'all' ? undefined : typeFilter,
            tagIds: selectedTagIds.length > 0 ? selectedTagIds : undefined,
        });
    };

    const handleTypeFilterChange = (value: 'all' | 'video' | 'podcast') => {
        setTypeFilter(value);
        onFilterChange?.({
            search: search || undefined,
            type: value === 'all' ? undefined : value,
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
            type: typeFilter === 'all' ? undefined : typeFilter,
            tagIds: newSelected.length > 0 ? newSelected : undefined,
        });
    };

    const clearTags = () => {
        setSelectedTagIds([]);
        onFilterChange?.({
            search: search || undefined,
            type: typeFilter === 'all' ? undefined : typeFilter,
            tagIds: undefined,
        });
    };

    const clearAllFilters = () => {
        setSearch('');
        setTypeFilter('all');
        setSelectedTagIds([]);
        
        onFilterChange?.({
            search: undefined,
            type: undefined,
            tagIds: undefined,
        });
    };

    const hasAnyFilter = search !== '' || 
                         typeFilter !== 'all' || 
                         selectedTagIds.length > 0;

    return (
        <div className="flex flex-col">
            <div className="flex flex-col lg:flex-row gap-4 mb-4">
                {/* Search */}
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        ref={inputRef}
                        placeholder="Search sources..."
                        value={search}
                        onChange={(e) => handleSearchChange(e.target.value)}
                        className="pl-10 pr-10 h-10"
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

                {/* Filters */}
                <div className="flex flex-row items-center gap-2 overflow-x-auto lg:overflow-visible pb-1 lg:pb-0 no-scrollbar">
                    <div className="flex gap-2 flex-shrink-0">
                        <Button
                            variant={typeFilter === 'all' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => handleTypeFilterChange('all')}
                            className="h-10 px-4"
                        >
                            All
                        </Button>
                        
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        variant={typeFilter === 'video' ? 'default' : 'outline'}
                                        size="icon"
                                        onClick={() => handleTypeFilterChange('video')}
                                        className="h-10 w-10 flex-shrink-0"
                                    >
                                        <Youtube className={`h-4 w-4 ${typeFilter === 'video' ? 'text-white' : 'text-red-600'}`} />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>YouTube Channels</TooltipContent>
                            </Tooltip>

                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        variant={typeFilter === 'podcast' ? 'default' : 'outline'}
                                        size="icon"
                                        onClick={() => handleTypeFilterChange('podcast')}
                                        className="h-10 w-10 flex-shrink-0"
                                    >
                                        <Mic className={`h-4 w-4 ${typeFilter === 'podcast' ? 'text-white' : 'text-purple-600'}`} />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>Podcasts</TooltipContent>
                            </Tooltip>
                        </TooltipProvider>

                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        variant={showTags || selectedTagIds.length > 0 ? "default" : "outline"}
                                        size="icon"
                                        onClick={() => setShowTags(!showTags)}
                                        className="h-10 w-10 flex-shrink-0 relative ml-4"
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
                                <TooltipContent>Filter by Episode Tags</TooltipContent>
                            </Tooltip>
                        </TooltipProvider>

                        {hasAnyFilter && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={clearAllFilters}
                                className="h-10 px-3 text-xs text-muted-foreground hover:text-foreground flex items-center gap-1.5 ml-2"
                            >
                                <X className="h-4 w-4" />
                                Clear All
                            </Button>
                        )}
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
