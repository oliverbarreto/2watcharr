'use client';

import { useState } from 'react';
import { Search, Filter } from 'lucide-react';
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

interface FilterBarProps {
    onFilterChange?: (filters: any) => void;
    onSortChange?: (sort: any) => void;
}

export function FilterBar({ onFilterChange, onSortChange }: FilterBarProps) {
    const [search, setSearch] = useState('');
    const [watchedFilter, setWatchedFilter] = useState<string>('all');
    const [sortField, setSortField] = useState('created_at');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

    const handleSearchChange = (value: string) => {
        setSearch(value);
        onFilterChange?.({
            search: value || undefined,
            watched: watchedFilter === 'all' ? undefined : watchedFilter === 'watched',
        });
    };

    const handleWatchedFilterChange = (value: string) => {
        setWatchedFilter(value);
        onFilterChange?.({
            search: search || undefined,
            watched: value === 'all' ? undefined : value === 'watched',
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
        <div className="flex flex-col md:flex-row gap-4 mb-6">
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

            {/* Quick Filters */}
            <div className="flex gap-2">
                <Button
                    variant={watchedFilter === 'all' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleWatchedFilterChange('all')}
                >
                    All
                </Button>
                <Button
                    variant={watchedFilter === 'unwatched' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleWatchedFilterChange('unwatched')}
                >
                    Unwatched
                </Button>
                <Button
                    variant={watchedFilter === 'watched' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleWatchedFilterChange('watched')}
                >
                    Watched
                </Button>
            </div>

            {/* Sort */}
            <div className="flex gap-2">
                <Select value={sortField} onValueChange={handleSortChange}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="created_at">Date Added</SelectItem>
                        <SelectItem value="priority">Priority</SelectItem>
                        <SelectItem value="favorite">Favorite</SelectItem>
                        <SelectItem value="duration">Duration</SelectItem>
                        <SelectItem value="title">Title</SelectItem>
                    </SelectContent>
                </Select>

                <Button variant="outline" size="icon" onClick={handleOrderChange}>
                    {sortOrder === 'desc' ? '↓' : '↑'}
                </Button>
            </div>
        </div>
    );
}
