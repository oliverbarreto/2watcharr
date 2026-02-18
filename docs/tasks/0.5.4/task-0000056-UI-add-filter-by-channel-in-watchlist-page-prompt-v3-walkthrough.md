# Walkthrough - URL-based Filtering & Channel Filter

I've refactored the application's filtering system to use URL search parameters as the source of truth across all major pages. This ensures consistent behavior, allows for shareable filtered views, and enables browser back/forward navigation for filter changes.

## Changes Made

### 📋 Watchlist Page Refactor
- Refactored [src/app/page.tsx](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/app/page.tsx) to derive filter and sort states from `useSearchParams`.
- Implemented `router.push` for filter updates, syncing the UI with the URL.
- Updated [FilterBar](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/components/features/episodes/filter-bar.tsx#57-463) and [EpisodeList](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/components/features/episodes/episode-list.tsx#51-317) to handle multi-channel filtering.

### 📺 Channels Page Refactor
- Updated [src/app/channels/page.tsx](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/app/channels/page.tsx) to use URL params for search, type, and tag filters.
- Refactored [ChannelFilterBar](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/components/features/channels/channel-filter-bar.tsx#29-224) to be a controlled component that reflects URL state.

### 🔍 Channel Details Page Refactor
- Refactored [src/app/channels/[id]/page.tsx](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/app/channels/%5Bid%5D/page.tsx) to use URL params for episode tag filtering.
- Fixed a code corruption issue and resolved an infinite loop caused by unstable object references.

### 🛠️ Infinite Loop Fix
- Memoized `filters` and `sort` objects in [src/app/page.tsx](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/app/page.tsx) to ensure stable references.
- Optimized [EpisodeList](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/components/features/episodes/episode-list.tsx#51-317) to use primitive dependency checks (via `JSON.stringify`) and deep comparison for available channel updates.
- This prevents the "API call loop" where filters would trigger a fetch, which would update local state, which would trigger another fetch.

### 🎯 Multi-Channel Filter
- Added a new "Filter by Channel" feature to the Watchlist page.
- Integrated a [CommandDialog](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/components/ui/command.tsx#32-62) (macOS Spotlight-style) for searching and selecting multiple channels.
- Updated the backend API and repository to support the `IN` operator for multiple channel IDs.

## Verification Results

### 🛠️ Watchlist Filter Sync & Overrides
- Fixed flickering toggle buttons by deriving `watched` status from the `status` URL parameter in [page.tsx](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/app/page.tsx).
- Refactored [FilterBar](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/components/features/episodes/filter-bar.tsx#57-463) to use a centralized [triggerFilterChange](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/components/features/episodes/filter-bar.tsx#110-132) function that preserves existing filter state, preventing one filter from overriding another.
- Ensured all interaction handlers (Search, Watch Status, Tags, Channels, Favorites) use this unified logic.

### 🛠️ Channel Filter Improvements (Multi-select & Clear)
- Fixed `Clear Selection` button in [FilterBar](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/components/features/episodes/filter-bar.tsx#57-463) to correctly remove channel filters without corrupting the URL.
- Updated [page.tsx](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/app/page.tsx) to fetch all available channels on mount, enabling proper multi-channel selection even after filtering.
- Removed redundant `onChannelsChange` logic from [EpisodeList](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/components/features/episodes/episode-list.tsx#51-317) to fix potential infinite loops and state sync issues.

### 🧪 Verification Results

#### Automated Tests
- Used a browser subagent to verify channel filtering:
    - Confirmed multi-select works: selecting multiple channels adds them to the URL.
    - Verified that "Clear Selection" correctly removes the `channels` parameter and doesn't introduce garbage characters.
    - Confirmed that non-selected channels remain visible in the list for further selection.

![Channel Filter Verification](/Users/oliver/.gemini/antigravity/brain/908be58d-2b65-4869-b3ba-9462757ce09f/verify_channel_filter_clear_fix_1771370831265.webp)

#### Manual Verification
- Used a browser subagent to verify watchlist filter stability:
    - Confirmed "unwatched" and "watched" status filters are stable and correctly highlighted.
    - Verified that adding a "favorite" filter while "unwatched" is active preserves both filters in the URL.
    - Verified that clicking "All" correctly clears the status filter while keeping other active filters.

![Filter Sync Verification](/Users/oliver/.gemini/antigravity/brain/908be58d-2b65-4869-b3ba-9462757ce09f/verify_filter_sync_bugfix_1771368693923.webp)

- Confirmed no flickering or infinite API calls on load.
    - Searching for episodes/channels.
    - Filtering by watched status.
    - Selecting/deselecting tags.
    - Selecting/deselecting multiple channels on the watchlist.
- Verified that refreshing the page or navigating back/forward maintains the filter state.

### Manual Verification
- Tested the new "Filter by Channel" menu on the Watchlist page:
    - Search functionality within the menu works correctly.
    - Multiple channels can be selected/deselected.
    - Selected channels are displayed as badges in the filter bar.
- Tested the Channels page filtering:
    - Search, type (video/podcast), and tags all sync with the URL.
- Tested the Channel Details page:
    - Tag filtering for episodes correctly updates the URL and refreshes the list.

## Screenshots/Recordings
*(Recordings would show the smooth transition of filters and the new "Filter by Channel" menu)*

```diff:page.tsx
'use client';

import { useState, useEffect, Suspense, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Layout } from '@/components/layout';
import { FilterBar, EpisodeList } from '@/components/features/episodes';
import { Button } from '@/components/ui/button';
import { X, List, LayoutGrid } from 'lucide-react';

interface Filters {
  search?: string;
  watched?: boolean;
  watchStatus?: 'unwatched' | 'pending' | 'watched';
  tagIds?: string[];
  channelId?: string;
}

interface Sort {
  field: string;
  order: 'asc' | 'desc';
}

function HomePageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  // Initialize state directly from searchParams and localStorage to avoid setState in effect
  const [filters, setFilters] = useState<Filters>(() => ({
    channelId: searchParams.get('channelId') || undefined
  }));
  const [sort, setSort] = useState<Sort>(() => {
    if (typeof window !== 'undefined') {
      const savedDefaultSortField = localStorage.getItem('defaultSortField');
      if (savedDefaultSortField) {
        // Set appropriate default sort order based on field
        let defaultOrder: 'asc' | 'desc' = 'desc';
        if (savedDefaultSortField === 'title') defaultOrder = 'asc';
        return { field: savedDefaultSortField, order: defaultOrder };
      }
    }
    return { field: 'date_added', order: 'desc' };
  });
  const [refreshKey, setRefreshKey] = useState(0);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>(() => {
    if (typeof window !== 'undefined') {
      const savedViewMode = localStorage.getItem('episodeViewMode') as 'grid' | 'list';
      const defaultView = localStorage.getItem('defaultView') as 'grid' | 'list';
      return savedViewMode || defaultView || 'list';
    }
    return 'list';
  });

  const [counts, setCounts] = useState({ current: 0, total: 0 });

  const handleCountChange = useCallback((current: number, total: number) => {
    setCounts(prev => {
      if (prev.current === current && prev.total === total) return prev;
      return { current, total };
    });
  }, []);

  const toggleViewMode = () => {
    const newMode = viewMode === 'grid' ? 'list' : 'grid';
    setViewMode(newMode);
    localStorage.setItem('episodeViewMode', newMode);
  };

  // Sync channelId from searchParams to filters state if it changes in the URL
  const channelIdFromUrl = searchParams.get('channelId') || undefined;
  if (filters.channelId !== channelIdFromUrl) {
    setFilters(prev => ({ ...prev, channelId: channelIdFromUrl }));
  }

  useEffect(() => {
    const handleAdded = () => setRefreshKey((prev) => prev + 1);
    window.addEventListener('episode-added', handleAdded);
    return () => window.removeEventListener('episode-added', handleAdded);
  }, []);

  const clearChannelFilter = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete('channelId');
    router.push(`/?${params.toString()}`);
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Watch Later</h1>
            <p className="text-muted-foreground">
              Manage your videos and podcasts to watch later
            </p>
            <div className="mt-1 text-sm font-medium text-muted-foreground border-t pt-2 inline-block">
                Showing <span className="text-foreground">{counts.current}</span> of <span className="text-foreground">{counts.total}</span> episodes
            </div>
          </div>
          <div className="flex items-center gap-2">
            {filters.channelId && (
              <Button
                variant="outline"
                size="sm"
                onClick={clearChannelFilter}
                className="flex items-center gap-1"
              >
                <X className="h-4 w-4" />
                Clear Channel Filter
              </Button>
            )}
            <Button variant="ghost" size="sm" onClick={toggleViewMode} className="gap-2 hidden md:flex">
              {viewMode === 'grid' ? (
                <>
                  <List className="h-4 w-4" />
                  List View
                </>
              ) : (
                <>
                  <LayoutGrid className="h-4 w-4" />
                  Grid View
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Filters */}
        <FilterBar
          onFilterChange={setFilters}
          onSortChange={setSort}
          initialFilters={filters}
          initialSort={sort}
        />

        {/* Episode List */}
        <EpisodeList 
            key={refreshKey} 
            filters={filters} 
            sort={sort} 
            viewMode={viewMode} 
            onCountChange={handleCountChange}
        />
      </div>
    </Layout>
  );
}

export default function HomePage() {
  return (
    <Suspense fallback={
      <Layout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Watch Later</h1>
              <p className="text-muted-foreground">
                Loading...
              </p>
            </div>
          </div>
        </div>
      </Layout>
    }>
      <HomePageContent />
    </Suspense>
  );
}
===
'use client';

import { useState, useEffect, Suspense, useCallback, useMemo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Layout } from '@/components/layout';
import { FilterBar, EpisodeList } from '@/components/features/episodes';
import { Button } from '@/components/ui/button';
import { X, List, LayoutGrid } from 'lucide-react';

interface Filters {
  search?: string;
  watched?: boolean;
  watchStatus?: 'unwatched' | 'pending' | 'watched';
  tagIds?: string[];
  channelId?: string;
  channelIds?: string[];
  favorite?: boolean;
}

interface Sort {
  field: string;
  order: 'asc' | 'desc';
}

function HomePageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  // Fetch available channels for the filter menu
  const [availableChannels, setAvailableChannels] = useState<{id: string, name: string}[]>([]);

  useEffect(() => {
    const fetchChannels = async () => {
      try {
        const response = await fetch('/api/channels');
        if (response.ok) {
          const data = await response.json();
          // Map to the format expected by FilterBar
          setAvailableChannels(data.channels.map((c: any) => ({ id: c.id, name: c.name })));
        }
      } catch (error) {
        console.error('Failed to fetch channels', error);
      }
    };
    fetchChannels();
  }, []);

  // Memoize filters from searchParams
  const filters: Filters = useMemo(() => {
    const status = searchParams.get('status');
    return {
      search: searchParams.get('search') || undefined,
      watched: status === 'watched' ? true : (status === 'unwatched' ? false : undefined),
      watchStatus: status as Filters['watchStatus'] || undefined,
      tagIds: searchParams.get('tags')?.split(',').filter(Boolean) || undefined,
      channelId: searchParams.get('channelId') || undefined,
      channelIds: searchParams.get('channels')?.split(',').filter(Boolean) || undefined,
      favorite: searchParams.get('favorite') === 'true' ? true : undefined,
    };
  }, [searchParams]);

  // Memoize sort from searchParams or localStorage
  const sort: Sort = useMemo(() => {
    const field = searchParams.get('sort');
    const order = searchParams.get('order') as 'asc' | 'desc';
    
    if (field && order) {
      return { field, order };
    }

    if (typeof window !== 'undefined') {
      const savedDefaultSortField = localStorage.getItem('defaultSortField');
      if (savedDefaultSortField) {
        let defaultOrder: 'asc' | 'desc' = 'desc';
        if (savedDefaultSortField === 'title') defaultOrder = 'asc';
        return { field: savedDefaultSortField, order: defaultOrder };
      }
    }
    return { field: 'date_added', order: 'desc' };
  }, [searchParams]);

  const [refreshKey, setRefreshKey] = useState(0);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>(() => {
    if (typeof window !== 'undefined') {
      const savedViewMode = localStorage.getItem('episodeViewMode') as 'grid' | 'list';
      const defaultView = localStorage.getItem('defaultView') as 'grid' | 'list';
      return savedViewMode || defaultView || 'list';
    }
    return 'list';
  });

  const [counts, setCounts] = useState({ current: 0, total: 0 });

  const handleCountChange = useCallback((current: number, total: number) => {
    setCounts(prev => {
      if (prev.current === current && prev.total === total) return prev;
      return { current, total };
    });
  }, []);

  const toggleViewMode = () => {
    const newMode = viewMode === 'grid' ? 'list' : 'grid';
    setViewMode(newMode);
    localStorage.setItem('episodeViewMode', newMode);
  };

  const updateFilters = (newFilters: Partial<Filters>) => {
    const params = new URLSearchParams(searchParams.toString());
    const merged = { ...filters, ...newFilters };

    if (merged.search) params.set('search', merged.search); else params.delete('search');
    if (merged.watchStatus) params.set('status', merged.watchStatus); else params.delete('status');
    if (merged.tagIds?.length) params.set('tags', merged.tagIds.join(',')); else params.delete('tags');
    if (merged.channelIds?.length) params.set('channels', merged.channelIds.join(',')); else params.delete('channels');
    if (merged.favorite) params.set('favorite', 'true'); else params.delete('favorite');
    
    // channelId is used for direct navigation from channel pages, keep it if present
    if (merged.channelId) params.set('channelId', merged.channelId); else params.delete('channelId');

    router.push(`/?${params.toString()}`);
  };

  const handleSortChange = (newSort: Sort) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('sort', newSort.field);
    params.set('order', newSort.order);
    router.push(`/?${params.toString()}`);
  };

  useEffect(() => {
    const handleAdded = () => setRefreshKey((prev) => prev + 1);
    window.addEventListener('episode-added', handleAdded);
    return () => window.removeEventListener('episode-added', handleAdded);
  }, []);

  const clearChannelFilter = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete('channelId');
    router.push(`/?${params.toString()}`);
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Watch Later</h1>
            <p className="text-muted-foreground">
              Manage your videos and podcasts to watch later
            </p>
            <div className="mt-1 text-sm font-medium text-muted-foreground border-t pt-2 inline-block">
                Showing <span className="text-foreground">{counts.current}</span> of <span className="text-foreground">{counts.total}</span> episodes
            </div>
          </div>
          <div className="flex items-center gap-2">
            {filters.channelId && (
              <Button
                variant="outline"
                size="sm"
                onClick={clearChannelFilter}
                className="flex items-center gap-1"
              >
                <X className="h-4 w-4" />
                Clear Channel Filter
              </Button>
            )}
            <Button variant="ghost" size="sm" onClick={toggleViewMode} className="gap-2 hidden md:flex">
              {viewMode === 'grid' ? (
                <>
                  <List className="h-4 w-4" />
                  List View
                </>
              ) : (
                <>
                  <LayoutGrid className="h-4 w-4" />
                  Grid View
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Filters */}
        <FilterBar
          onFilterChange={updateFilters}
          onSortChange={handleSortChange}
          initialFilters={filters}
          initialSort={sort}
          availableChannels={availableChannels}
        />

        {/* Episode List */}
        <EpisodeList 
            key={refreshKey} 
            filters={filters} 
            sort={sort} 
            viewMode={viewMode} 
        />
      </div>
    </Layout>
  );
}

export default function HomePage() {
  return (
    <Suspense fallback={
      <Layout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Watch Later</h1>
              <p className="text-muted-foreground">
                Loading...
              </p>
            </div>
          </div>
        </div>
      </Layout>
    }>
      <HomePageContent />
    </Suspense>
  );
}
```
```diff:filter-bar.tsx
'use client';

import { useState } from 'react';
import { Search, Play, Tag as TagIcon, X, Clock, Star, Gem } from 'lucide-react';
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
    onFilterChange?: (filters: {
        search?: string;
        watched?: boolean;
        watchStatus?: 'unwatched' | 'pending' | 'watched';
        tagIds?: string[];
        favorite?: boolean;
    }) => void;
    onSortChange?: (sort: { field: string; order: 'asc' | 'desc' }) => void;
    initialFilters?: {
        search?: string;
        watched?: boolean;
        watchStatus?: 'unwatched' | 'pending' | 'watched';
        tagIds?: string[];
        favorite?: boolean;
    };
    initialSort?: {
        field: string;
        order: 'asc' | 'desc';
    };
}

export function FilterBar({ onFilterChange, onSortChange, initialFilters, initialSort }: FilterBarProps) {
    const [search, setSearch] = useState(initialFilters?.search || '');
    const [watchedFilter, setWatchedFilter] = useState<string>(
        initialFilters?.watchStatus === 'pending' ? 'pending' : 
        (initialFilters?.watched === undefined ? 'all' : (initialFilters.watched ? 'watched' : 'unwatched'))
    );
    const [selectedTagIds, setSelectedTagIds] = useState<string[]>(initialFilters?.tagIds || []);
    const [tags, setTags] = useState<Tag[]>([]);
    const [sortField, setSortField] = useState(initialSort?.field || 'created_at');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>(initialSort?.order || 'desc');
    const [showTags, setShowTags] = useState(initialFilters?.tagIds && initialFilters.tagIds.length > 0);
    const [priorityFilter, setPriorityFilter] = useState(false);
    const [favoriteFilter, setFavoriteFilter] = useState(initialFilters?.favorite || false);

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

    const triggerFilterChange = (
        currentSearch: string,
        currentWatchedFilter: string,
        currentTagIds: string[]
    ) => {
        onFilterChange?.({
            search: currentSearch || undefined,
            watched: currentWatchedFilter === 'watched' ? true : (currentWatchedFilter === 'all' ? undefined : false),
            watchStatus: (currentWatchedFilter === 'all' ? undefined : (currentWatchedFilter === 'watched' ? 'watched' : currentWatchedFilter)) as 'unwatched' | 'pending' | 'watched' | undefined,
            tagIds: currentTagIds.length > 0 ? currentTagIds : undefined,
        });
    };

    const handleSearchChange = (value: string) => {
        setSearch(value);
        triggerFilterChange(value, watchedFilter, selectedTagIds);
    };

    const handleWatchedFilterChange = (value: string) => {
        setWatchedFilter(value);
        triggerFilterChange(search, value, selectedTagIds);
    };

    const toggleTag = (tagId: string) => {
        const newSelected = selectedTagIds.includes(tagId)
            ? selectedTagIds.filter(id => id !== tagId)
            : [...selectedTagIds, tagId];
        
        setSelectedTagIds(newSelected);
        triggerFilterChange(search, watchedFilter, newSelected);
    };

    const clearTags = () => {
        setSelectedTagIds([]);
        triggerFilterChange(search, watchedFilter, []);
    };

    const handleSortChange = (field: string) => {
        setSortField(field);
        
        // Set appropriate default sort order based on field
        let defaultOrder: 'asc' | 'desc' = 'desc';
        
        // For favorite and duration, default to desc (favorited/longest first)
        if (field === 'favorite' || field === 'duration') {
            defaultOrder = 'desc';
        }
        // For title, default to asc (alphabetical)
        else if (field === 'title') {
            defaultOrder = 'asc';
        }
        // For date fields and others, keep desc (most recent first)
        
        setSortOrder(defaultOrder);
        onSortChange?.({ field, order: defaultOrder });
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
                        placeholder="Search episodes..."
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

                    <div className="flex gap-2 lg:flex-none flex-1 min-w-[120px]">
                        <Select value={sortField} onValueChange={handleSortChange}>
                            <SelectTrigger className="h-9 lg:w-[180px] flex-1">
                                <SelectValue placeholder="Sort by" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="custom">Manual</SelectItem>
                                <SelectItem value="date_added">Date Added</SelectItem>
                                <SelectItem value="date_watched">Date Watched</SelectItem>
                                <SelectItem value="date_favorited">Date Favorited</SelectItem>
                                <SelectItem value="date_removed">Date Removed</SelectItem>
                            </SelectContent>
                        </Select>

                        <Button variant="outline" size="icon" onClick={handleOrderChange} className="h-9 w-9 flex-shrink-0">
                            {sortOrder === 'desc' ? '↓' : '↑'}
                        </Button>

                        {/* Priority Filter Checkbox */}
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        variant={priorityFilter ? 'default' : 'outline'}
                                        size="icon"
                                        onClick={() => {
                                            const newValue = !priorityFilter;
                                            setPriorityFilter(newValue);
                                            onFilterChange?.({
                                                ...initialFilters,
                                                search,
                                                watched: watchedFilter === 'all' ? undefined : watchedFilter === 'watched',
                                                watchStatus: watchedFilter === 'pending' ? 'pending' : undefined,
                                                tagIds: selectedTagIds,
                                                favorite: favoriteFilter ? true : undefined,
                                            });
                                        }}
                                        className="h-9 w-9 flex-shrink-0"
                                    >
                                        <Gem className="h-4 w-4" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>Priority</TooltipContent>
                            </Tooltip>
                        </TooltipProvider>

                        {/* Favorite Filter Checkbox */}
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        variant={favoriteFilter ? 'default' : 'outline'}
                                        size="icon"
                                        onClick={() => {
                                            const newValue = !favoriteFilter;
                                            setFavoriteFilter(newValue);
                                            onFilterChange?.({
                                                ...initialFilters,
                                                search,
                                                watched: watchedFilter === 'all' ? undefined : watchedFilter === 'watched',
                                                watchStatus: watchedFilter === 'pending' ? 'pending' : undefined,
                                                tagIds: selectedTagIds,
                                                favorite: newValue ? true : undefined,
                                            });
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
===
'use client';

import { useState } from 'react';
import { Search, Play, Tag as TagIcon, X, Clock, Star, Gem, Tv, Check } from 'lucide-react';
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
    }) => void;
    onSortChange?: (sort: { field: string; order: 'asc' | 'desc' }) => void;
    initialFilters?: {
        search?: string;
        watched?: boolean;
        watchStatus?: 'unwatched' | 'pending' | 'watched';
        tagIds?: string[];
        channelIds?: string[];
        favorite?: boolean;
    };
    initialSort?: {
        field: string;
        order: 'asc' | 'desc';
    };
    availableChannels?: { id: string; name: string }[];
}

export function FilterBar({ onFilterChange, onSortChange, initialFilters, initialSort, availableChannels }: FilterBarProps) {
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
    const [priorityFilter, setPriorityFilter] = useState(false);
    const [favoriteFilter, setFavoriteFilter] = useState(initialFilters?.favorite || false);
    const [isChannelMenuOpen, setIsChannelMenuOpen] = useState(false);

    // Sync local state when initialFilters changes (URL changes)
    useEffect(() => {
        if (initialFilters) {
            setSearch(initialFilters.search || '');
            // Priority: watchStatus if present, then watched boolean
            const status = initialFilters.watchStatus || 
                         (initialFilters.watched === undefined ? 'all' : (initialFilters.watched ? 'watched' : 'unwatched'));
            setWatchedFilter(status);
            
            setSelectedTagIds(initialFilters.tagIds || []);
            setSelectedChannelIds(initialFilters.channelIds || []);
            setFavoriteFilter(initialFilters.favorite || false);
        }
    }, [initialFilters]);

    useEffect(() => {
        if (initialSort) {
            setSortField(initialSort.field);
            setSortOrder(initialSort.order);
        }
    }, [initialSort]);

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

    const triggerFilterChange = (overrides: Partial<{
        search: string;
        watchedFilter: string;
        tagIds: string[];
        channelIds: string[];
        favorite: boolean;
    }> = {}) => {
        const currentSearch = overrides.search !== undefined ? overrides.search : search;
        const currentWatched = overrides.watchedFilter !== undefined ? overrides.watchedFilter : watchedFilter;
        const currentTagIds = overrides.tagIds !== undefined ? overrides.tagIds : selectedTagIds;
        const currentChannelIds = overrides.channelIds !== undefined ? overrides.channelIds : selectedChannelIds;
        const currentFavorite = overrides.favorite !== undefined ? overrides.favorite : favoriteFilter;

        onFilterChange?.({
            search: currentSearch || undefined,
            watched: currentWatched === 'watched' ? true : (currentWatched === 'all' ? undefined : false),
            watchStatus: (currentWatched === 'all' ? undefined : (currentWatched === 'watched' ? 'watched' : currentWatched)) as 'unwatched' | 'pending' | 'watched' | undefined,
            tagIds: currentTagIds.length > 0 ? currentTagIds : undefined,
            channelIds: currentChannelIds.length > 0 ? currentChannelIds : undefined,
            favorite: currentFavorite ? true : undefined,
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
        triggerFilterChange({ tagIds: [] });
    };

    const handleSortChange = (field: string) => {
        setSortField(field);
        
        // Set appropriate default sort order based on field
        let defaultOrder: 'asc' | 'desc' = 'desc';
        
        // For favorite and duration, default to desc (favorited/longest first)
        if (field === 'favorite' || field === 'duration') {
            defaultOrder = 'desc';
        }
        // For title, default to asc (alphabetical)
        else if (field === 'title') {
            defaultOrder = 'asc';
        }
        // For date fields and others, keep desc (most recent first)
        
        setSortOrder(defaultOrder);
        onSortChange?.({ field, order: defaultOrder });
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
                        placeholder="Search episodes..."
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

                    <div className="flex gap-2 lg:flex-none flex-1 min-w-[120px]">
                        <Select value={sortField} onValueChange={handleSortChange}>
                            <SelectTrigger className="h-9 lg:w-[180px] flex-1">
                                <SelectValue placeholder="Sort by" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="custom">Manual</SelectItem>
                                <SelectItem value="date_added">Date Added</SelectItem>
                                <SelectItem value="date_watched">Date Watched</SelectItem>
                                <SelectItem value="date_favorited">Date Favorited</SelectItem>
                                <SelectItem value="date_removed">Date Removed</SelectItem>
                            </SelectContent>
                        </Select>

                        <Button variant="outline" size="icon" onClick={handleOrderChange} className="h-9 w-9 flex-shrink-0">
                            {sortOrder === 'desc' ? '↓' : '↑'}
                        </Button>

                        {/* Priority Filter Checkbox */}
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        variant={priorityFilter ? 'default' : 'outline'}
                                        size="icon"
                                        onClick={() => {
                                            const newValue = !priorityFilter;
                                            setPriorityFilter(newValue);
                                            // Backend doesn't support priority filter yet, 
                                            // but we'll at least keep current filters in sync
                                            triggerFilterChange();
                                        }}
                                        className="h-9 w-9 flex-shrink-0"
                                    >
                                        <Gem className="h-4 w-4" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>Priority</TooltipContent>
                            </Tooltip>
                        </TooltipProvider>

                        {/* Favorite Filter Checkbox */}
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
                    </div>
                </div>
            </div>

            {/* Spotlight-style Channel Menu */}
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
                        {availableChannels?.map((channel: { id: string; name: string }) => {
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
```
```diff:episode-list.tsx
'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { MediaEpisode } from '@/lib/domain/models';
import { EpisodeCard } from './episode-card';
import { EpisodeListRow } from './episode-list-row';
import { GroupedEpisodeList } from './grouped-episode-list';
import { isDateBasedSort } from '@/lib/utils/date-grouping';
import { Skeleton } from '@/components/ui/skeleton';
import { Loader2 } from 'lucide-react';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    rectSortingStrategy,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { toast } from 'sonner';

const PAGE_SIZE = 100;

interface EpisodeListProps {
    filters?: {
        search?: string;
        watched?: boolean;
        favorite?: boolean;
        channelId?: string;
        tagIds?: string[];
        watchStatus?: 'unwatched' | 'pending' | 'watched';
        isDeleted?: boolean;
    };
    sort?: {
        field: string;
        order: 'asc' | 'desc';
    };
    viewMode: 'grid' | 'list';
    onCountChange?: (current: number, total: number) => void;
}

export function EpisodeList({ filters, sort, viewMode: initialViewMode, onCountChange }: EpisodeListProps) {
    const [episodes, setEpisodes] = useState<MediaEpisode[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [totalCount, setTotalCount] = useState(0);
    const [offset, setOffset] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [isMobile, setIsMobile] = useState(false);
    
    const observerTarget = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };
        
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    const viewMode = isMobile ? 'grid' : initialViewMode;


    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const fetchEpisodes = useCallback(async (currentOffset: number = 0, append: boolean = false) => {
        if (currentOffset === 0) {
            setLoading(true);
        } else {
            setLoadingMore(true);
        }

        try {
            const params = new URLSearchParams();

            if (filters?.search) params.append('search', filters.search);
            if (filters?.watched !== undefined) params.append('watched', String(filters.watched));
            if (filters?.favorite !== undefined) params.append('favorite', String(filters.favorite));
            if (filters?.channelId) params.append('channelId', filters.channelId);
            if (filters?.tagIds && filters.tagIds.length > 0) {
                params.append('tags', filters.tagIds.join(','));
            }
            if (filters?.watchStatus) params.append('watchStatus', filters.watchStatus);
            if (filters?.isDeleted !== undefined) params.append('isDeleted', String(filters.isDeleted));
            if (sort?.field) params.append('sort', sort.field);
            if (sort?.order) params.append('order', sort.order);
            
            // Add pagination params
            params.append('limit', String(PAGE_SIZE));
            params.append('offset', String(currentOffset));

            const response = await fetch(`/api/episodes?${params.toString()}`);
            if (!response.ok) throw new Error('Failed to fetch episodes');

            const data = await response.json();
            
            if (append) {
                setEpisodes(prev => [...prev, ...data.episodes]);
            } else {
                setEpisodes(data.episodes);
            }
            
            setTotalCount(data.total);
            setHasMore(data.episodes.length === PAGE_SIZE && (currentOffset + data.episodes.length) < data.total);
            setOffset(currentOffset);
        } catch (error) {
            console.error('Error fetching episodes:', error);
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    }, [filters, sort]);

    // Reset pagination when filters or sort change
    useEffect(() => {
        fetchEpisodes(0, false);
    }, [fetchEpisodes]);

    // Intersection Observer for infinite scroll
    useEffect(() => {
        const observer = new IntersectionObserver(
            entries => {
                if (entries[0].isIntersecting && hasMore && !loadingMore && !loading) {
                    fetchEpisodes(offset + PAGE_SIZE, true);
                }
            },
            { threshold: 1.0 }
        );

        if (observerTarget.current) {
            observer.observe(observerTarget.current);
        }

        return () => observer.disconnect();
    }, [hasMore, loadingMore, loading, offset, fetchEpisodes]);

    useEffect(() => {
        if (onCountChange) {
            onCountChange(episodes.length, totalCount);
        }
    }, [episodes.length, totalCount, onCountChange]);

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;

        if (active.id !== over?.id) {
            setEpisodes((items) => {
                const oldIndex = items.findIndex((i) => i.id === active.id);
                const newIndex = items.findIndex((i) => i.id === over?.id);

                const newItems = arrayMove(items, oldIndex, newIndex);

                // Persist the new order
                const episodeIds = newItems.map(v => v.id);
                fetch('/api/episodes/reorder', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ episodeIds }),
                }).catch(() => {
                    toast.error('Failed to save order');
                });

                return newItems;
            });
        }
    };

    const handleUpdate = () => fetchEpisodes(0, false);

    if (loading && offset === 0) {
        return (
            <div className={viewMode === 'grid'
                ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
                : "flex flex-col gap-2"
            }>
                {[...Array(8)].map((_, i) => (
                    <div key={i} className={viewMode === 'grid' ? "space-y-3" : "flex gap-3 py-2"}>
                        <Skeleton className={viewMode === 'grid' ? "aspect-video w-full" : "w-40 aspect-video flex-shrink-0"} />
                        <div className="flex-1 space-y-2">
                            <Skeleton className="h-4 w-3/4" />
                            <Skeleton className="h-4 w-1/2" />
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    if (episodes.length === 0 && !loading) {
        return (
            <div className="text-center py-12">
                <p className="text-muted-foreground text-lg">No episodes found</p>
                <p className="text-sm text-muted-foreground mt-2">
                    Add your first video or podcast to get started
                </p>
            </div>
        );
    }

    // Combine episodes rendering to avoid duplication
    const renderEpisodes = () => {
        if (sort && isDateBasedSort(sort.field)) {
            return (
                <div className="space-y-4">
                    <GroupedEpisodeList
                        episodes={episodes}
                        sortField={sort.field}
                        sortOrder={sort.order}
                        viewMode={viewMode}
                        onUpdate={handleUpdate}
                        onDelete={handleUpdate}
                    />
                </div>
            );
        }

        return (
            <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
            >
                <SortableContext
                    items={episodes.map((e) => e.id)}
                    strategy={
                        viewMode === 'grid'
                            ? rectSortingStrategy
                            : verticalListSortingStrategy
                    }
                >
                    <div
                        className={
                            viewMode === 'grid'
                                ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'
                                : 'flex flex-col border rounded-md overflow-hidden bg-card/50'
                        }
                    >
                        {episodes.map((episode) =>
                            viewMode === 'grid' ? (
                                <EpisodeCard
                                    key={episode.id}
                                    episode={episode}
                                    onUpdate={handleUpdate}
                                    onDelete={handleUpdate}
                                    isDraggable={sort?.field === 'custom'}
                                />
                            ) : (
                                <EpisodeListRow
                                    key={episode.id}
                                    episode={episode}
                                    onUpdate={handleUpdate}
                                    onDelete={handleUpdate}
                                    isDraggable={sort?.field === 'custom'}
                                />
                            )
                        )}
                    </div>
                </SortableContext>
            </DndContext>
        );
    };

    return (
        <div className="space-y-4">
            {renderEpisodes()}
            
            {/* Infinite Scroll Trigger & Loading More Indicator */}
            <div ref={observerTarget} className="h-10 flex items-center justify-center">
                {loadingMore && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Loading more...</span>
                    </div>
                )}
            </div>
        </div>
    );
}
===
'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { MediaEpisode } from '@/lib/domain/models';
import { EpisodeCard } from './episode-card';
import { EpisodeListRow } from './episode-list-row';
import { GroupedEpisodeList } from './grouped-episode-list';
import { isDateBasedSort } from '@/lib/utils/date-grouping';
import { Skeleton } from '@/components/ui/skeleton';
import { Loader2 } from 'lucide-react';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    rectSortingStrategy,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { toast } from 'sonner';

const PAGE_SIZE = 100;

interface EpisodeListProps {
    filters?: {
        search?: string;
        watched?: boolean;
        favorite?: boolean;
        channelId?: string;
        channelIds?: string[];
        tagIds?: string[];
        watchStatus?: 'unwatched' | 'pending' | 'watched';
        isDeleted?: boolean;
    };
    sort?: {
        field: string;
        order: 'asc' | 'desc';
    };
    viewMode: 'grid' | 'list';
    onCountChange?: (current: number, total: number) => void;
    onChannelsChange?: (channels: { id: string; name: string }[] | ((prev: { id: string; name: string }[]) => { id: string; name: string }[])) => void;
}

export function EpisodeList({ filters, sort, viewMode: initialViewMode, onCountChange, onChannelsChange }: EpisodeListProps) {
    const [episodes, setEpisodes] = useState<MediaEpisode[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [totalCount, setTotalCount] = useState(0);
    const [offset, setOffset] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [isMobile, setIsMobile] = useState(false);
    
    const observerTarget = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };
        
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    const viewMode = isMobile ? 'grid' : initialViewMode;


    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const fetchEpisodes = useCallback(async (currentOffset: number = 0, append: boolean = false) => {
        if (currentOffset === 0) {
            setLoading(true);
        } else {
            setLoadingMore(true);
        }

        try {
            const params = new URLSearchParams();

            if (filters?.search) params.append('search', filters.search);
            if (filters?.watched !== undefined) params.append('watched', String(filters.watched));
            if (filters?.favorite !== undefined) params.append('favorite', String(filters.favorite));
            if (filters?.channelId) params.append('channelId', filters.channelId);
            if (filters?.channelIds && filters.channelIds.length > 0) {
                params.append('channels', filters.channelIds.join(','));
            }
            if (filters?.tagIds && filters.tagIds.length > 0) {
                params.append('tags', filters.tagIds.join(','));
            }
            if (filters?.watchStatus) params.append('watchStatus', filters.watchStatus);
            if (filters?.isDeleted !== undefined) params.append('isDeleted', String(filters.isDeleted));
            if (sort?.field) params.append('sort', sort.field);
            if (sort?.order) params.append('order', sort.order);
            
            // Add pagination params
            params.append('limit', String(PAGE_SIZE));
            params.append('offset', String(currentOffset));

            const response = await fetch(`/api/episodes?${params.toString()}`);
            if (!response.ok) throw new Error('Failed to fetch episodes');

            const data = await response.json();
            
            if (append) {
                setEpisodes(prev => [...prev, ...data.episodes]);
            } else {
                setEpisodes(data.episodes);
                
                // Extract unique channels for the filter menu
                if (onChannelsChange) {
                    const channelsMap = new Map<string, {id: string, name: string}>();
                    data.episodes.forEach((ep: MediaEpisode) => {
                        if (ep.channelId && ep.channelName) {
                            channelsMap.set(ep.channelId, { id: ep.channelId, name: ep.channelName });
                        }
                    });
                    const newChannels = Array.from(channelsMap.values());
                    
                    // Only trigger update if channels have actually changed (shallow comparison is enough for IDs)
                    onChannelsChange((prev: { id: string; name: string }[]) => {
                        const prevIds = (prev || []).map((c: { id: string; name: string }) => c.id).sort().join(',');
                        const nextIds = newChannels.map((c: { id: string; name: string }) => c.id).sort().join(',');
                        if (prevIds === nextIds) return prev;
                        return newChannels;
                    });
                }
            }
            
            setTotalCount(data.total);
            setHasMore(data.episodes.length === PAGE_SIZE && (currentOffset + data.episodes.length) < data.total);
            setOffset(currentOffset);
        } catch (error) {
            console.error('Error fetching episodes:', error);
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    }, [JSON.stringify(filters), JSON.stringify(sort), onChannelsChange]);

    // Reset pagination when filters or sort change
    useEffect(() => {
        fetchEpisodes(0, false);
    }, [filters?.search, filters?.watched, filters?.favorite, filters?.channelId, filters?.channelIds?.join(','), filters?.tagIds?.join(','), filters?.watchStatus, filters?.isDeleted, sort?.field, sort?.order, fetchEpisodes]);

    // Intersection Observer for infinite scroll
    useEffect(() => {
        const observer = new IntersectionObserver(
            entries => {
                if (entries[0].isIntersecting && hasMore && !loadingMore && !loading) {
                    fetchEpisodes(offset + PAGE_SIZE, true);
                }
            },
            { threshold: 1.0 }
        );

        if (observerTarget.current) {
            observer.observe(observerTarget.current);
        }

        return () => observer.disconnect();
    }, [hasMore, loadingMore, loading, offset, fetchEpisodes]);

    useEffect(() => {
        if (onCountChange) {
            onCountChange(episodes.length, totalCount);
        }
    }, [episodes.length, totalCount, onCountChange]);

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;

        if (active.id !== over?.id) {
            setEpisodes((items) => {
                const oldIndex = items.findIndex((i) => i.id === active.id);
                const newIndex = items.findIndex((i) => i.id === over?.id);

                const newItems = arrayMove(items, oldIndex, newIndex);

                // Persist the new order
                const episodeIds = newItems.map(v => v.id);
                fetch('/api/episodes/reorder', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ episodeIds }),
                }).catch(() => {
                    toast.error('Failed to save order');
                });

                return newItems;
            });
        }
    };

    const handleUpdate = () => fetchEpisodes(0, false);

    if (loading && offset === 0) {
        return (
            <div className={viewMode === 'grid'
                ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
                : "flex flex-col gap-2"
            }>
                {[...Array(8)].map((_, i) => (
                    <div key={i} className={viewMode === 'grid' ? "space-y-3" : "flex gap-3 py-2"}>
                        <Skeleton className={viewMode === 'grid' ? "aspect-video w-full" : "w-40 aspect-video flex-shrink-0"} />
                        <div className="flex-1 space-y-2">
                            <Skeleton className="h-4 w-3/4" />
                            <Skeleton className="h-4 w-1/2" />
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    if (episodes.length === 0 && !loading) {
        return (
            <div className="text-center py-12">
                <p className="text-muted-foreground text-lg">No episodes found</p>
                <p className="text-sm text-muted-foreground mt-2">
                    Add your first video or podcast to get started
                </p>
            </div>
        );
    }

    // Combine episodes rendering to avoid duplication
    const renderEpisodes = () => {
        if (sort && isDateBasedSort(sort.field)) {
            return (
                <div className="space-y-4">
                    <GroupedEpisodeList
                        episodes={episodes}
                        sortField={sort.field}
                        sortOrder={sort.order}
                        viewMode={viewMode}
                        onUpdate={handleUpdate}
                        onDelete={handleUpdate}
                    />
                </div>
            );
        }

        return (
            <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
            >
                <SortableContext
                    items={episodes.map((e) => e.id)}
                    strategy={
                        viewMode === 'grid'
                            ? rectSortingStrategy
                            : verticalListSortingStrategy
                    }
                >
                    <div
                        className={
                            viewMode === 'grid'
                                ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'
                                : 'flex flex-col border rounded-md overflow-hidden bg-card/50'
                        }
                    >
                        {episodes.map((episode) =>
                            viewMode === 'grid' ? (
                                <EpisodeCard
                                    key={episode.id}
                                    episode={episode}
                                    onUpdate={handleUpdate}
                                    onDelete={handleUpdate}
                                    isDraggable={sort?.field === 'custom'}
                                />
                            ) : (
                                <EpisodeListRow
                                    key={episode.id}
                                    episode={episode}
                                    onUpdate={handleUpdate}
                                    onDelete={handleUpdate}
                                    isDraggable={sort?.field === 'custom'}
                                />
                            )
                        )}
                    </div>
                </SortableContext>
            </DndContext>
        );
    };

    return (
        <div className="space-y-4">
            {renderEpisodes()}
            
            {/* Infinite Scroll Trigger & Loading More Indicator */}
            <div ref={observerTarget} className="h-10 flex items-center justify-center">
                {loadingMore && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Loading more...</span>
                    </div>
                )}
            </div>
        </div>
    );
}
```
```diff:page.tsx
'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import Image from 'next/image';
import { Layout } from '@/components/layout';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Trash2, RefreshCw, Youtube, Mic, ChevronUp, ChevronDown } from 'lucide-react';
import { ChannelFilterBar } from '@/components/features/channels/channel-filter-bar';
import { toast } from 'sonner';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { useSearchParams } from 'next/navigation';
import { Button } from "@/components/ui/button";
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    rectSortingStrategy,
    useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface Tag {
    id: string;
    name: string;
    color: string | null;
}

interface Channel {
    id: string;
    type: 'video' | 'podcast';
    name: string;
    description: string | null;
    thumbnailUrl: string | null;
    url: string;
    episodeCount: number;
    tags?: Tag[];
    customOrder: number | null;
}

interface Filters {
    search?: string;
    type?: 'video' | 'podcast';
    tagIds?: string[];
}

interface ChannelCardProps {
    channel: Channel;
    highlightId: string | null;
    isSyncing: boolean;
    onDelete: (channel: Channel) => void;
    onSync: (channelId: string, channelUrl: string) => void;
}

function SortableChannelCard({ channel, highlightId, isSyncing, onDelete, onSync }: ChannelCardProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: channel.id });

    const [isExpanded, setIsExpanded] = useState(false);

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 50 : 0,
    };

    return (
        <Card
            ref={setNodeRef}
            style={style}
            className={`group relative hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden border-muted-foreground/10 aspect-square min-h-[280px] ${highlightId === channel.id ? 'ring-2 ring-primary ring-offset-2' : ''} ${isDragging ? 'opacity-50' : ''}`}
            onClick={(e) => {
                // If the click was on the channel link or a button, don't navigate
                if ((e.target as HTMLElement).closest('a') || (e.target as HTMLElement).closest('button')) {
                    return;
                }
                window.location.href = `/channels/${channel.id}`;
            }}
        >
            {/* Background Image */}
            <div className="absolute inset-0 z-0">
                {channel.thumbnailUrl ? (
                    <Image
                        src={channel.thumbnailUrl}
                        alt={channel.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                        unoptimized
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground text-4xl font-bold bg-accent/20">
                        {channel.name[0]}
                    </div>
                )}
                {/* Subtle vignette */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80" />
            </div>

            {/* Top Buttons (Delete & Sync) */}
            <div className="absolute top-2 right-2 left-2 z-30 flex justify-between opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onSync(channel.id, channel.url);
                    }}
                    disabled={isSyncing}
                    className={`p-2 bg-black/60 hover:bg-primary hover:text-white rounded-full backdrop-blur-md transition-colors text-white/90 border border-white/10 shadow-lg ${isSyncing ? 'cursor-not-allowed opacity-50' : ''}`}
                    title="Sync Metadata"
                >
                    <RefreshCw className={`h-4 w-4 ${isSyncing ? 'animate-spin' : ''}`} />
                </button>

                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onDelete(channel);
                    }}
                    className="p-2 bg-black/60 hover:bg-destructive hover:text-white rounded-full backdrop-blur-md transition-colors text-white/90 border border-white/10 shadow-lg"
                    title="Delete Source"
                >
                    <Trash2 className="h-4 w-4" />
                </button>
            </div>

            {/* Channel Info Overlay - Full Screen on Hover/Expanded */}
            <div className={`absolute inset-x-0 bottom-0 z-20 p-5 bg-black/40 backdrop-blur-md border border-white/10 transition-all duration-300 flex flex-col ${isExpanded ? 'h-full bg-black/70' : 'h-[40%] group-hover:h-full group-hover:bg-black/70'}`}>
                <div className={`flex-1 overflow-hidden transition-all duration-300 ${isExpanded ? 'pt-12' : 'group-hover:pt-12'}`}>
                    <div className="flex justify-between items-start">
                        <a
                            href={channel.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xl font-bold text-red-600 hover:text-red-500 transition-colors line-clamp-1 block mb-1 leading-none relative z-10 flex-1"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {channel.name}
                        </a>
                    </div>
                    <div className="flex items-center gap-2 mb-2">
                        {channel.type === 'podcast' ? (
                            <Mic className="h-4 w-4 text-purple-500" />
                        ) : (
                            <div className="bg-red-600 rounded-sm p-0.5 flex items-center justify-center">
                                <Youtube className="h-3 w-3 text-white fill-current" />
                            </div>
                        )}
                        <span className="text-sm font-bold text-red-600">
                            {channel.episodeCount} {channel.episodeCount === 1 ? 'episode' : 'episodes'}
                        </span>
                    </div>

                    {channel.description && channel.description !== "No description available. Sync metadata to refresh." && (
                        <p className={`text-[12px] text-white/90 leading-tight transition-all duration-300 ${isExpanded ? 'line-clamp-none' : 'line-clamp-2 md:group-hover:line-clamp-none group-active:line-clamp-none'}`}>
                            {channel.description}
                        </p>
                    )}
                </div>

                {channel.tags && channel.tags.length > 0 && (
                    <div className={`flex flex-wrap gap-2 mt-2 transition-all duration-300 ${isExpanded ? 'mt-4' : 'group-hover:mt-4'}`}>
                        {channel.tags.map((tag, idx) => (
                            <Badge
                                key={tag.id}
                                variant="outline"
                                className={`text-[10px] px-3 py-0.5 h-6 rounded-full border-none font-medium bg-[#3d2b1f] text-[#f59e0b] border border-[#f59e0b]/20 ${idx >= 2 ? (isExpanded ? 'flex' : 'hidden group-hover:flex') : ''}`}
                                style={tag.color ? {
                                    backgroundColor: `${tag.color}20`,
                                    color: tag.color,
                                    borderColor: `${tag.color}40`,
                                    borderWidth: '1px'
                                } : undefined}
                            >
                                {tag.name}
                            </Badge>
                        ))}
                    </div>
                )}

                {/* Mobile Toggle Button - Bottom Right */}
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        setIsExpanded(!isExpanded);
                    }}
                    className="md:hidden absolute bottom-5 right-5 z-30 w-6 h-6 flex items-center justify-center bg-black/60 hover:bg-black/80 rounded-full transition-all text-white shadow-lg active:scale-90"
                    aria-label={isExpanded ? "Collapse" : "Expand"}
                >
                    {isExpanded ? (
                        <ChevronDown className="h-4 w-4 stroke-[3]" />
                    ) : (
                        <ChevronUp className="h-4 w-4 stroke-[3]" />
                    )}
                </button>
            </div>

            {/* Drag Handle - Bottom as requested, visible only on hover */}
            <div
                {...attributes}
                {...listeners}
                className="absolute bottom-0 left-0 w-full h-1.5 bg-red-600 opacity-0 group-hover:opacity-100 transition-all duration-300 z-40 cursor-grab active:cursor-grabbing"
            />
        </Card>
    );
}

function ChannelsPageContent() {
    const searchParams = useSearchParams();
    const highlightId = searchParams.get('channelId');
    const [channels, setChannels] = useState<Channel[]>([]);
    const [loading, setLoading] = useState(true);
    const [syncingChannelId, setSyncingChannelId] = useState<string | null>(null);
    const [channelToDelete, setChannelToDelete] = useState<Channel | null>(null);
    const [filters, setFilters] = useState<Filters>({});

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const fetchChannels = useCallback(async (currentFilters = filters) => {
        try {
            const params = new URLSearchParams();
            if (currentFilters.search) params.set('search', currentFilters.search);
            if (currentFilters.type) params.set('type', currentFilters.type);
            if (currentFilters.tagIds) params.set('tagIds', currentFilters.tagIds.join(','));

            const response = await fetch(`/api/channels?${params.toString()}`);
            if (!response.ok) throw new Error('Failed to fetch channels');

            const data = await response.json();
            setChannels(data.channels);
        } catch (error) {
            console.error('Error fetching channels:', error);
            toast.error('Failed to fetch channels');
        } finally {
            setLoading(false);
        }
    }, [filters]);

    useEffect(() => {
        fetchChannels();
    }, [fetchChannels]);

    const handleFilterChange = (newFilters: Filters) => {
        setFilters(newFilters);
        fetchChannels(newFilters);
    };

    const handleSyncChannel = async (channelId: string, channelUrl: string) => {
        setSyncingChannelId(channelId);
        try {
            const response = await fetch(`/api/channels/${channelId}/sync`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url: channelUrl })
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || 'Sync failed');
            }

            toast.success('Channel metadata synced successfully');
            fetchChannels();
        } catch (error) {
            console.error('Error syncing channel:', error);
            toast.error(error instanceof Error ? error.message : 'Failed to sync channel metadata');
        } finally {
            setSyncingChannelId(null);
        }
    };

    const handleDeleteChannel = async () => {
        if (!channelToDelete) return;

        try {
            const response = await fetch(`/api/channels/${channelToDelete.id}`, {
                method: 'DELETE',
            });

            if (!response.ok) throw new Error('Failed to delete channel');

            toast.success('Channel deleted successfully');
            fetchChannels();
        } catch (error) {
            console.error('Error deleting channel:', error);
            toast.error('Failed to delete channel');
        } finally {
            setChannelToDelete(null);
        }
    };

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;

        if (active.id !== over?.id) {
            setChannels((items) => {
                const oldIndex = items.findIndex((i) => i.id === active.id);
                const newIndex = items.findIndex((i) => i.id === over?.id);

                const newItems = arrayMove(items, oldIndex, newIndex);

                // Persist the new order
                const channelIds = newItems.map(c => c.id);
                fetch('/api/channels/reorder', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ channelIds }),
                }).catch(() => {
                    toast.error('Failed to save order');
                });

                return newItems;
            });
        }
    };

    if (loading) {
        return (
            <Layout>
                <div className="space-y-6">
                    <div className="flex justify-between items-center">
                        <h1 className="text-3xl font-bold">Channels & Podcasts</h1>
                        <Skeleton className="h-10 w-32" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {[...Array(8)].map((_, i) => (
                            <Card key={i} className="aspect-square min-h-[280px] relative overflow-hidden">
                                <div className="absolute inset-x-0 bottom-0 h-1/3 p-4 bg-muted/20 backdrop-blur-sm border-t border-white/5">
                                    <div className="flex items-start gap-3 h-full items-center">
                                        <Skeleton className="h-8 w-8 rounded-lg" />
                                        <div className="flex-1 space-y-2">
                                            <Skeleton className="h-5 w-3/4" />
                                            <Skeleton className="h-4 w-1/2" />
                                        </div>
                                    </div>
                                </div>
                                <div className="absolute bottom-0 left-0 w-full h-1.5 bg-muted/30 z-30" />
                            </Card>
                        ))}
                    </div>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold">Channels & Podcasts</h1>
                        <p className="text-muted-foreground">
                            All sources from your saved content
                        </p>
                    </div>
                </div>

                <ChannelFilterBar onFilterChange={handleFilterChange} initialFilters={filters} />

                {channels.length === 0 ? (
                    <div className="text-center py-12">
                        <p className="text-muted-foreground text-lg">No content yet</p>
                        <p className="text-sm text-muted-foreground mt-2">
                            Add videos or podcasts to see sources here
                        </p>
                    </div>
                ) : (
                    <DndContext
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragEnd={handleDragEnd}
                    >
                        <SortableContext
                            items={channels.map(c => c.id)}
                            strategy={rectSortingStrategy}
                        >
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {channels.map((channel) => (
                                    <SortableChannelCard
                                        key={channel.id}
                                        channel={channel}
                                        highlightId={highlightId}
                                        isSyncing={syncingChannelId === channel.id}
                                        onDelete={setChannelToDelete}
                                        onSync={handleSyncChannel}
                                    />
                                ))}
                            </div>
                        </SortableContext>
                    </DndContext>
                )}
            </div>

            <Dialog open={!!channelToDelete} onOpenChange={(open: boolean) => !open && setChannelToDelete(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Are you absolutely sure?</DialogTitle>
                        <DialogDescription>
                            This will remove <strong>{channelToDelete?.name}</strong> from your list.
                            The episodes from this source will still remain in your list.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setChannelToDelete(null)}>
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={handleDeleteChannel}>
                            Delete
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </Layout>
    );
}

export default function ChannelsPage() {
    return (
        <Suspense fallback={
            <Layout>
                <div className="space-y-6">
                    <div className="flex justify-between items-center">
                        <h1 className="text-3xl font-bold">Channels & Podcasts</h1>
                        <Skeleton className="h-10 w-32" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {[...Array(8)].map((_, i) => (
                            <Card key={i} className="aspect-square min-h-[280px] relative overflow-hidden">
                                <div className="absolute inset-x-0 bottom-0 h-1/3 p-4 bg-muted/20 backdrop-blur-sm border-t border-white/5">
                                    <div className="flex items-start gap-3 h-full items-center">
                                        <Skeleton className="h-8 w-8 rounded-lg" />
                                        <div className="flex-1 space-y-2">
                                            <Skeleton className="h-5 w-3/4" />
                                            <Skeleton className="h-4 w-1/2" />
                                        </div>
                                    </div>
                                </div>
                                <div className="absolute bottom-0 left-0 w-full h-1.5 bg-muted/30 z-30" />
                            </Card>
                        ))}
                    </div>
                </div>
            </Layout>
        }>
            <ChannelsPageContent />
        </Suspense>
    );
}
===
'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import Image from 'next/image';
import { Layout } from '@/components/layout';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Trash2, RefreshCw, Youtube, Mic, ChevronUp, ChevronDown } from 'lucide-react';
import { ChannelFilterBar } from '@/components/features/channels/channel-filter-bar';
import { toast } from 'sonner';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    rectSortingStrategy,
    useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface Tag {
    id: string;
    name: string;
    color: string | null;
}

interface Channel {
    id: string;
    type: 'video' | 'podcast';
    name: string;
    description: string | null;
    thumbnailUrl: string | null;
    url: string;
    episodeCount: number;
    tags?: Tag[];
    customOrder: number | null;
}

interface Filters {
    search?: string;
    type?: 'video' | 'podcast';
    tagIds?: string[];
}

interface ChannelCardProps {
    channel: Channel;
    highlightId: string | null;
    isSyncing: boolean;
    onDelete: (channel: Channel) => void;
    onSync: (channelId: string, channelUrl: string) => void;
}

function SortableChannelCard({ channel, highlightId, isSyncing, onDelete, onSync }: ChannelCardProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: channel.id });

    const [isExpanded, setIsExpanded] = useState(false);

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 50 : 0,
    };

    return (
        <Card
            ref={setNodeRef}
            style={style}
            className={`group relative hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden border-muted-foreground/10 aspect-square min-h-[280px] ${highlightId === channel.id ? 'ring-2 ring-primary ring-offset-2' : ''} ${isDragging ? 'opacity-50' : ''}`}
            onClick={(e) => {
                // If the click was on the channel link or a button, don't navigate
                if ((e.target as HTMLElement).closest('a') || (e.target as HTMLElement).closest('button')) {
                    return;
                }
                window.location.href = `/channels/${channel.id}`;
            }}
        >
            {/* Background Image */}
            <div className="absolute inset-0 z-0">
                {channel.thumbnailUrl ? (
                    <Image
                        src={channel.thumbnailUrl}
                        alt={channel.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                        unoptimized
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground text-4xl font-bold bg-accent/20">
                        {channel.name[0]}
                    </div>
                )}
                {/* Subtle vignette */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80" />
            </div>

            {/* Top Buttons (Delete & Sync) */}
            <div className="absolute top-2 right-2 left-2 z-30 flex justify-between opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onSync(channel.id, channel.url);
                    }}
                    disabled={isSyncing}
                    className={`p-2 bg-black/60 hover:bg-primary hover:text-white rounded-full backdrop-blur-md transition-colors text-white/90 border border-white/10 shadow-lg ${isSyncing ? 'cursor-not-allowed opacity-50' : ''}`}
                    title="Sync Metadata"
                >
                    <RefreshCw className={`h-4 w-4 ${isSyncing ? 'animate-spin' : ''}`} />
                </button>

                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onDelete(channel);
                    }}
                    className="p-2 bg-black/60 hover:bg-destructive hover:text-white rounded-full backdrop-blur-md transition-colors text-white/90 border border-white/10 shadow-lg"
                    title="Delete Source"
                >
                    <Trash2 className="h-4 w-4" />
                </button>
            </div>

            {/* Channel Info Overlay - Full Screen on Hover/Expanded */}
            <div className={`absolute inset-x-0 bottom-0 z-20 p-5 bg-black/40 backdrop-blur-md border border-white/10 transition-all duration-300 flex flex-col ${isExpanded ? 'h-full bg-black/70' : 'h-[40%] group-hover:h-full group-hover:bg-black/70'}`}>
                <div className={`flex-1 overflow-hidden transition-all duration-300 ${isExpanded ? 'pt-12' : 'group-hover:pt-12'}`}>
                    <div className="flex justify-between items-start">
                        <a
                            href={channel.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xl font-bold text-red-600 hover:text-red-500 transition-colors line-clamp-1 block mb-1 leading-none relative z-10 flex-1"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {channel.name}
                        </a>
                    </div>
                    <div className="flex items-center gap-2 mb-2">
                        {channel.type === 'podcast' ? (
                            <Mic className="h-4 w-4 text-purple-500" />
                        ) : (
                            <div className="bg-red-600 rounded-sm p-0.5 flex items-center justify-center">
                                <Youtube className="h-3 w-3 text-white fill-current" />
                            </div>
                        )}
                        <span className="text-sm font-bold text-red-600">
                            {channel.episodeCount} {channel.episodeCount === 1 ? 'episode' : 'episodes'}
                        </span>
                    </div>

                    {channel.description && channel.description !== "No description available. Sync metadata to refresh." && (
                        <p className={`text-[12px] text-white/90 leading-tight transition-all duration-300 ${isExpanded ? 'line-clamp-none' : 'line-clamp-2 md:group-hover:line-clamp-none group-active:line-clamp-none'}`}>
                            {channel.description}
                        </p>
                    )}
                </div>

                {channel.tags && channel.tags.length > 0 && (
                    <div className={`flex flex-wrap gap-2 mt-2 transition-all duration-300 ${isExpanded ? 'mt-4' : 'group-hover:mt-4'}`}>
                        {channel.tags.map((tag, idx) => (
                            <Badge
                                key={tag.id}
                                variant="outline"
                                className={`text-[10px] px-3 py-0.5 h-6 rounded-full border-none font-medium bg-[#3d2b1f] text-[#f59e0b] border border-[#f59e0b]/20 ${idx >= 2 ? (isExpanded ? 'flex' : 'hidden group-hover:flex') : ''}`}
                                style={tag.color ? {
                                    backgroundColor: `${tag.color}20`,
                                    color: tag.color,
                                    borderColor: `${tag.color}40`,
                                    borderWidth: '1px'
                                } : undefined}
                            >
                                {tag.name}
                            </Badge>
                        ))}
                    </div>
                )}

                {/* Mobile Toggle Button - Bottom Right */}
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        setIsExpanded(!isExpanded);
                    }}
                    className="md:hidden absolute bottom-5 right-5 z-30 w-6 h-6 flex items-center justify-center bg-black/60 hover:bg-black/80 rounded-full transition-all text-white shadow-lg active:scale-90"
                    aria-label={isExpanded ? "Collapse" : "Expand"}
                >
                    {isExpanded ? (
                        <ChevronDown className="h-4 w-4 stroke-[3]" />
                    ) : (
                        <ChevronUp className="h-4 w-4 stroke-[3]" />
                    )}
                </button>
            </div>

            {/* Drag Handle - Bottom as requested, visible only on hover */}
            <div
                {...attributes}
                {...listeners}
                className="absolute bottom-0 left-0 w-full h-1.5 bg-red-600 opacity-0 group-hover:opacity-100 transition-all duration-300 z-40 cursor-grab active:cursor-grabbing"
            />
        </Card>
    );
}

function ChannelsPageContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const highlightId = searchParams.get('channelId');
    const [channels, setChannels] = useState<Channel[]>([]);
    const [loading, setLoading] = useState(true);
    const [syncingChannelId, setSyncingChannelId] = useState<string | null>(null);
    const [channelToDelete, setChannelToDelete] = useState<Channel | null>(null);

    // Derive filters from searchParams
    const filters: Filters = {
        search: searchParams.get('search') || undefined,
        type: (searchParams.get('type') as Filters['type']) || undefined,
        tagIds: searchParams.get('tagIds')?.split(',').filter(Boolean) || undefined,
    };

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const fetchChannels = useCallback(async () => {
        try {
            const params = new URLSearchParams();
            if (filters.search) params.set('search', filters.search);
            if (filters.type) params.set('type', filters.type);
            if (filters.tagIds) params.set('tagIds', filters.tagIds.join(','));

            const response = await fetch(`/api/channels?${params.toString()}`);
            if (!response.ok) throw new Error('Failed to fetch channels');

            const data = await response.json();
            setChannels(data.channels);
        } catch (error) {
            console.error('Error fetching channels:', error);
            toast.error('Failed to fetch channels');
        } finally {
            setLoading(false);
        }
    }, [filters.search, filters.type, filters.tagIds?.join(',')]);

    useEffect(() => {
        fetchChannels();
    }, [fetchChannels]);

    const handleFilterChange = (newFilters: Filters) => {
        const params = new URLSearchParams(searchParams.toString());
        
        if (newFilters.search) params.set('search', newFilters.search); else params.delete('search');
        if (newFilters.type) params.set('type', newFilters.type); else params.delete('type');
        if (newFilters.tagIds?.length) params.set('tagIds', newFilters.tagIds.join(',')); else params.delete('tagIds');

        router.push(`/channels?${params.toString()}`);
    };

    const handleSyncChannel = async (channelId: string, channelUrl: string) => {
        setSyncingChannelId(channelId);
        try {
            const response = await fetch(`/api/channels/${channelId}/sync`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url: channelUrl })
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || 'Sync failed');
            }

            toast.success('Channel metadata synced successfully');
            fetchChannels();
        } catch (error) {
            console.error('Error syncing channel:', error);
            toast.error(error instanceof Error ? error.message : 'Failed to sync channel metadata');
        } finally {
            setSyncingChannelId(null);
        }
    };

    const handleDeleteChannel = async () => {
        if (!channelToDelete) return;

        try {
            const response = await fetch(`/api/channels/${channelToDelete.id}`, {
                method: 'DELETE',
            });

            if (!response.ok) throw new Error('Failed to delete channel');

            toast.success('Channel deleted successfully');
            fetchChannels();
        } catch (error) {
            console.error('Error deleting channel:', error);
            toast.error('Failed to delete channel');
        } finally {
            setChannelToDelete(null);
        }
    };

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;

        if (active.id !== over?.id) {
            setChannels((items) => {
                const oldIndex = items.findIndex((i) => i.id === active.id);
                const newIndex = items.findIndex((i) => i.id === over?.id);

                const newItems = arrayMove(items, oldIndex, newIndex);

                // Persist the new order
                const channelIds = newItems.map(c => c.id);
                fetch('/api/channels/reorder', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ channelIds }),
                }).catch(() => {
                    toast.error('Failed to save order');
                });

                return newItems;
            });
        }
    };

    if (loading) {
        return (
            <Layout>
                <div className="space-y-6">
                    <div className="flex justify-between items-center">
                        <h1 className="text-3xl font-bold">Channels & Podcasts</h1>
                        <Skeleton className="h-10 w-32" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {[...Array(8)].map((_, i) => (
                            <Card key={i} className="aspect-square min-h-[280px] relative overflow-hidden">
                                <div className="absolute inset-x-0 bottom-0 h-1/3 p-4 bg-muted/20 backdrop-blur-sm border-t border-white/5">
                                    <div className="flex items-start gap-3 h-full items-center">
                                        <Skeleton className="h-8 w-8 rounded-lg" />
                                        <div className="flex-1 space-y-2">
                                            <Skeleton className="h-5 w-3/4" />
                                            <Skeleton className="h-4 w-1/2" />
                                        </div>
                                    </div>
                                </div>
                                <div className="absolute bottom-0 left-0 w-full h-1.5 bg-muted/30 z-30" />
                            </Card>
                        ))}
                    </div>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold">Channels & Podcasts</h1>
                        <p className="text-muted-foreground">
                            All sources from your saved content
                        </p>
                    </div>
                </div>

                <ChannelFilterBar onFilterChange={handleFilterChange} initialFilters={filters} />

                {channels.length === 0 ? (
                    <div className="text-center py-12">
                        <p className="text-muted-foreground text-lg">No content yet</p>
                        <p className="text-sm text-muted-foreground mt-2">
                            Add videos or podcasts to see sources here
                        </p>
                    </div>
                ) : (
                    <DndContext
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragEnd={handleDragEnd}
                    >
                        <SortableContext
                            items={channels.map(c => c.id)}
                            strategy={rectSortingStrategy}
                        >
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {channels.map((channel) => (
                                    <SortableChannelCard
                                        key={channel.id}
                                        channel={channel}
                                        highlightId={highlightId}
                                        isSyncing={syncingChannelId === channel.id}
                                        onDelete={setChannelToDelete}
                                        onSync={handleSyncChannel}
                                    />
                                ))}
                            </div>
                        </SortableContext>
                    </DndContext>
                )}
            </div>

            <Dialog open={!!channelToDelete} onOpenChange={(open: boolean) => !open && setChannelToDelete(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Are you absolutely sure?</DialogTitle>
                        <DialogDescription>
                            This will remove <strong>{channelToDelete?.name}</strong> from your list.
                            The episodes from this source will still remain in your list.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setChannelToDelete(null)}>
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={handleDeleteChannel}>
                            Delete
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </Layout>
    );
}

export default function ChannelsPage() {
    return (
        <Suspense fallback={
            <Layout>
                <div className="space-y-6">
                    <div className="flex justify-between items-center">
                        <h1 className="text-3xl font-bold">Channels & Podcasts</h1>
                        <Skeleton className="h-10 w-32" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {[...Array(8)].map((_, i) => (
                            <Card key={i} className="aspect-square min-h-[280px] relative overflow-hidden">
                                <div className="absolute inset-x-0 bottom-0 h-1/3 p-4 bg-muted/20 backdrop-blur-sm border-t border-white/5">
                                    <div className="flex items-start gap-3 h-full items-center">
                                        <Skeleton className="h-8 w-8 rounded-lg" />
                                        <div className="flex-1 space-y-2">
                                            <Skeleton className="h-5 w-3/4" />
                                            <Skeleton className="h-4 w-1/2" />
                                        </div>
                                    </div>
                                </div>
                                <div className="absolute bottom-0 left-0 w-full h-1.5 bg-muted/30 z-30" />
                            </Card>
                        ))}
                    </div>
                </div>
            </Layout>
        }>
            <ChannelsPageContent />
        </Suspense>
    );
}
```
```diff:channel-filter-bar.tsx
'use client';

import { useState, useEffect } from 'react';
import { Search, Youtube, Mic, Tag as TagIcon, X } from 'lucide-react';
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

    return (
        <div className="flex flex-col mb-6">
            <div className="flex flex-col lg:flex-row gap-4 mb-4">
                {/* Search */}
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search sources..."
                        value={search}
                        onChange={(e) => handleSearchChange(e.target.value)}
                        className="pl-10 h-10"
                    />
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
===
'use client';

import { useState, useEffect } from 'react';
import { Search, Youtube, Mic, Tag as TagIcon, X } from 'lucide-react';
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

    // Sync local state when initialFilters changes (URL changes)
    useEffect(() => {
        if (initialFilters) {
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

    return (
        <div className="flex flex-col mb-6">
            <div className="flex flex-col lg:flex-row gap-4 mb-4">
                {/* Search */}
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search sources..."
                        value={search}
                        onChange={(e) => handleSearchChange(e.target.value)}
                        className="pl-10 h-10"
                    />
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
```
render_diffs(file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/app/channels/[id]/page.tsx)
```diff:episode.repository.ts
import { Database } from 'sqlite';
import { v4 as uuidv4 } from 'uuid';
import {
    MediaEpisode,
    CreateEpisodeDto,
    UpdateEpisodeDto,
    EpisodeFilters,
    SortOptions,
    MediaEventType,
    MediaType,
    WatchStatus,
    Priority,
    Tag,
    PaginationOptions,
} from '../domain/models';

export class EpisodeRepository {
    constructor(private db: Database) { }

    /**
     * Create a new episode
     */
    async create(dto: CreateEpisodeDto): Promise<MediaEpisode> {
        const id = uuidv4();
        const now = Math.floor(Date.now() / 1000);

        await this.db.run(
            `INSERT INTO episodes (
        id, type, external_id, title, description, duration, thumbnail_url,
        url, upload_date, published_date, view_count, channel_id, user_id,
        watch_status, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                id,
                dto.type,
                dto.externalId,
                dto.title,
                dto.description || null,
                dto.duration || null,
                dto.thumbnailUrl || null,
                dto.url,
                dto.uploadDate || null,
                dto.publishedDate || null,
                dto.viewCount || null,
                dto.channelId,
                dto.userId,
                'unwatched',
                now,
                now,
            ]
        );

        const episode = await this.findById(id);
        if (!episode) {
            throw new Error('Failed to create episode');
        }
        return episode;
    }

    /**
     * Find episode by ID
     */
    async findById(id: string): Promise<MediaEpisode | null> {
        const row = await this.db.get(`
            SELECT e.*, c.name as channel_name,
            (SELECT created_at FROM media_events WHERE episode_id = e.id AND event_type = 'added' ORDER BY created_at DESC LIMIT 1) as last_added_at,
            (SELECT created_at FROM media_events WHERE episode_id = e.id AND event_type = 'watched' ORDER BY created_at DESC LIMIT 1) as last_watched_at,
            (SELECT created_at FROM media_events WHERE episode_id = e.id AND event_type = 'pending' ORDER BY created_at DESC LIMIT 1) as last_pending_at,
            (SELECT created_at FROM media_events WHERE episode_id = e.id AND event_type = 'favorited' ORDER BY created_at DESC LIMIT 1) as last_favorited_at,
            (SELECT created_at FROM media_events WHERE episode_id = e.id AND event_type = 'removed' ORDER BY created_at DESC LIMIT 1) as last_removed_at
            FROM episodes e 
            LEFT JOIN channels c ON e.channel_id = c.id 
            WHERE e.id = ?
        `, id);
        if (!row) return null;

        const episode = this.mapRowToEpisode(row);
        const tagRows = await this.db.all(`
            SELECT t.* FROM tags t
            JOIN episode_tags et ON t.id = et.tag_id
            WHERE et.episode_id = ?
        `, id);
        episode.tags = tagRows.map(row => ({
            id: row.id,
            name: row.name,
            color: row.color,
            userId: row.user_id,
            createdAt: row.created_at,
        }));

        return episode;
    }

    /**
     * Find episode by External ID
     */
    async findByExternalId(externalId: string, userId: string): Promise<MediaEpisode | null> {
        const row = await this.db.get(
            'SELECT * FROM episodes WHERE external_id = ? AND user_id = ?',
            [externalId, userId]
        );
        return row ? this.mapRowToEpisode(row) : null;
    }

    /**
     * Find all episodes with optional filters and sorting
     */
    async findAll(
        filters?: EpisodeFilters,
        sort?: SortOptions,
        pagination?: PaginationOptions
    ): Promise<MediaEpisode[]> {
        const hasTagFilter = filters?.tagIds && filters.tagIds.length > 0;
        let query = `
            SELECT ${hasTagFilter ? 'DISTINCT ' : ''}e.*, c.name as channel_name,
            (SELECT created_at FROM media_events WHERE episode_id = e.id AND event_type = 'added' ORDER BY created_at DESC LIMIT 1) as last_added_at,
            (SELECT created_at FROM media_events WHERE episode_id = e.id AND event_type = 'watched' ORDER BY created_at DESC LIMIT 1) as last_watched_at,
            (SELECT created_at FROM media_events WHERE episode_id = e.id AND event_type = 'pending' ORDER BY created_at DESC LIMIT 1) as last_pending_at,
            (SELECT created_at FROM media_events WHERE episode_id = e.id AND event_type = 'favorited' ORDER BY created_at DESC LIMIT 1) as last_favorited_at,
            (SELECT created_at FROM media_events WHERE episode_id = e.id AND event_type = 'removed' ORDER BY created_at DESC LIMIT 1) as last_removed_at
            FROM episodes e
        `;
        query += ' LEFT JOIN channels c ON e.channel_id = c.id';
        const params: (string | number | null)[] = [];

        // Join with episode_tags if filtering by tags
        if (filters?.tagIds && filters.tagIds.length > 0) {
            query += ' INNER JOIN episode_tags et ON e.id = et.episode_id';
        }

        // Build WHERE clause
        const conditions: string[] = [];

        if (filters?.type) {
            conditions.push('e.type = ?');
            params.push(filters.type);
        }

        if (filters?.tagIds && filters.tagIds.length > 0) {
            const placeholders = filters.tagIds.map(() => '?').join(',');
            conditions.push(`et.tag_id IN (${placeholders})`);
            params.push(...filters.tagIds);
        }

        if (filters?.search) {
            conditions.push(
                '(e.title LIKE ? OR e.description LIKE ? OR EXISTS (SELECT 1 FROM channels c WHERE c.id = e.channel_id AND c.name LIKE ?))'
            );
            const searchTerm = `%${filters.search}%`;
            params.push(searchTerm, searchTerm, searchTerm);
        }

        if (filters?.watched !== undefined) {
            conditions.push('e.watched = ?');
            params.push(filters.watched ? 1 : 0);
        }

        if (filters?.watchStatus !== undefined) {
            conditions.push('e.watch_status = ?');
            params.push(filters.watchStatus);
        }

        if (filters?.favorite !== undefined) {
            conditions.push('e.favorite = ?');
            params.push(filters.favorite ? 1 : 0);
        }

        if (filters?.isDeleted !== undefined) {
            conditions.push('e.is_deleted = ?');
            params.push(filters.isDeleted ? 1 : 0);
        } else {
            // Default: only show non-deleted episodes
            conditions.push('e.is_deleted = 0');
        }

        if (filters?.channelId) {
            conditions.push('e.channel_id = ?');
            params.push(filters.channelId);
        }

        if (filters?.userId) {
            conditions.push('e.user_id = ?');
            params.push(filters.userId);
        }

        if (conditions.length > 0) {
            query += ' WHERE ' + conditions.join(' AND ');
        }

        // Add sorting
        if (sort) {
            const orderBy = this.buildOrderBy(sort);
            query += ` ORDER BY ${orderBy}`;
        } else {
            // Default sort: Manual order first, then fallback to newest first
            query += ' ORDER BY e.custom_order ASC, e.created_at DESC';
        }

        // Add pagination
        if (pagination?.limit !== undefined) {
            query += ' LIMIT ?';
            params.push(pagination.limit);
        }
        if (pagination?.offset !== undefined) {
            query += ' OFFSET ?';
            params.push(pagination.offset);
        }

        const rows = await this.db.all(query, params);
        const episodes = rows.map((row) => this.mapRowToEpisode(row));

        if (episodes.length > 0) {
            const episodeIds = episodes.map(e => e.id);
            const placeholders = episodeIds.map(() => '?').join(',');
            const tagRows = await this.db.all(`
                SELECT et.episode_id, t.* FROM tags t
                JOIN episode_tags et ON t.id = et.tag_id
                WHERE et.episode_id IN (${placeholders})
            `, episodeIds);

            // Group tags by episode_id
            const tagsByEpisodeId: Record<string, Tag[]> = {};
            tagRows.forEach((row: Record<string, unknown>) => {
                if (!tagsByEpisodeId[row.episode_id as string]) {
                    tagsByEpisodeId[row.episode_id as string] = [];
                }
                tagsByEpisodeId[row.episode_id as string].push({
                    id: row.id as string,
                    name: row.name as string,
                    color: row.color as string | null,
                    userId: row.user_id as string,
                    createdAt: row.created_at as number,
                });
            });

            // Attach tags to episodes
            episodes.forEach(e => {
                e.tags = tagsByEpisodeId[e.id] || [];
            });
        }

        return episodes;
    }

    /**
     * Count all episodes matching filters
     */
    async countAll(filters?: EpisodeFilters): Promise<number> {
        const hasTagFilter = filters?.tagIds && filters.tagIds.length > 0;
        let query = `SELECT COUNT(${hasTagFilter ? 'DISTINCT ' : ''}e.id) as count FROM episodes e`;
        const params: (string | number | null)[] = [];

        if (hasTagFilter) {
            query += ' INNER JOIN episode_tags et ON e.id = et.episode_id';
        }

        const conditions: string[] = [];

        if (filters?.type) {
            conditions.push('e.type = ?');
            params.push(filters.type);
        }

        if (filters?.tagIds && filters.tagIds.length > 0) {
            const placeholders = filters.tagIds.map(() => '?').join(',');
            conditions.push(`et.tag_id IN (${placeholders})`);
            params.push(...filters.tagIds);
        }

        if (filters?.search) {
            conditions.push(
                '(e.title LIKE ? OR e.description LIKE ? OR EXISTS (SELECT 1 FROM channels c WHERE c.id = e.channel_id AND c.name LIKE ?))'
            );
            const searchTerm = `%${filters.search}%`;
            params.push(searchTerm, searchTerm, searchTerm);
        }

        if (filters?.watched !== undefined) {
            conditions.push('e.watched = ?');
            params.push(filters.watched ? 1 : 0);
        }

        if (filters?.watchStatus !== undefined) {
            conditions.push('e.watch_status = ?');
            params.push(filters.watchStatus);
        }

        if (filters?.favorite !== undefined) {
            conditions.push('e.favorite = ?');
            params.push(filters.favorite ? 1 : 0);
        }

        if (filters?.isDeleted !== undefined) {
            conditions.push('e.is_deleted = ?');
            params.push(filters.isDeleted ? 1 : 0);
        } else {
            conditions.push('e.is_deleted = 0');
        }

        if (filters?.channelId) {
            conditions.push('e.channel_id = ?');
            params.push(filters.channelId);
        }

        if (filters?.userId) {
            conditions.push('e.user_id = ?');
            params.push(filters.userId);
        }

        if (conditions.length > 0) {
            query += ' WHERE ' + conditions.join(' AND ');
        }

        const result = await this.db.get(query, params);
        return result?.count || 0;
    }

    /**
     * Update episode
     */
    async update(id: string, dto: UpdateEpisodeDto): Promise<MediaEpisode> {
        const updates: string[] = [];
        const params: (string | number | null)[] = [];

        if (dto.title !== undefined) {
            updates.push('title = ?');
            params.push(dto.title);
        }
        if (dto.description !== undefined) {
            updates.push('description = ?');
            params.push(dto.description);
        }
        if (dto.watched !== undefined) {
            updates.push('watched = ?');
            params.push(dto.watched ? 1 : 0);
            // Sync watch_status if not explicitly provided
            if (dto.watchStatus === undefined) {
                updates.push('watch_status = ?');
                params.push(dto.watched ? 'watched' : 'unwatched');
            }
        }
        if (dto.watchStatus !== undefined) {
            updates.push('watch_status = ?');
            params.push(dto.watchStatus);
            // Sync watched boolean
            updates.push('watched = ?');
            params.push(dto.watchStatus === 'watched' ? 1 : 0);
        }
        if (dto.favorite !== undefined) {
            updates.push('favorite = ?');
            params.push(dto.favorite ? 1 : 0);
        }
        if (dto.priority !== undefined) {
            updates.push('priority = ?');
            params.push(dto.priority);
        }
        if (dto.isDeleted !== undefined) {
            updates.push('is_deleted = ?');
            params.push(dto.isDeleted ? 1 : 0);
        }
        if (dto.customOrder !== undefined) {
            updates.push('custom_order = ?');
            params.push(dto.customOrder);
        }
        if (dto.viewCount !== undefined) {
            updates.push('view_count = ?');
            params.push(dto.viewCount);
        }

        updates.push('updated_at = ?');
        params.push(Math.floor(Date.now() / 1000));

        params.push(id);

        await this.db.run(
            `UPDATE episodes SET ${updates.join(', ')} WHERE id = ?`,
            params
        );

        // Update tags if provided
        if (dto.tagIds !== undefined) {
            await this.removeTags(id);
            if (dto.tagIds.length > 0) {
                await this.addTags(id, dto.tagIds);
            }
        }

        const episode = await this.findById(id);
        if (!episode) {
            throw new Error('Episode not found after update');
        }
        return episode;
    }

    /**
     * Bulk update watch status for all episodes in a channel
     */
    async bulkUpdateWatchStatus(channelId: string, userId: string, watched: boolean): Promise<void> {
        const now = Math.floor(Date.now() / 1000);
        const watchStatus = watched ? 'watched' : 'unwatched';
        const watchedInt = watched ? 1 : 0;

        // Get all applicable episodes first to create events
        const episodes = await this.findAll({ channelId, userId, isDeleted: false });

        await this.db.run('BEGIN TRANSACTION');

        try {
            await this.db.run(
                `UPDATE episodes 
                 SET watched = ?, watch_status = ?, updated_at = ? 
                 WHERE channel_id = ? AND user_id = ? AND is_deleted = 0`,
                [watchedInt, watchStatus, now, channelId, userId]
            );

            // Add events for each episode
            const eventType = watched ? 'watched' : 'unwatched';
            for (const episode of episodes) {
                if (episode.watched !== watched) {
                    await this.addEvent(episode.id, eventType, episode.title, episode.type);
                }
            }

            await this.db.run('COMMIT');
        } catch (error) {
            await this.db.run('ROLLBACK');
            throw error;
        }
    }

    /**
     * Delete episode (soft delete)
     */
    async delete(id: string): Promise<void> {
        await this.db.run('UPDATE episodes SET is_deleted = 1, updated_at = ? WHERE id = ?', [
            Math.floor(Date.now() / 1000),
            id
        ]);
    }

    /**
     * Restore all soft-deleted episodes for a user
     */
    async bulkRestore(userId: string): Promise<void> {
        await this.db.run(
            'UPDATE episodes SET is_deleted = 0, updated_at = ? WHERE user_id = ? AND is_deleted = 1',
            [Math.floor(Date.now() / 1000), userId]
        );
    }

    /**
     * Permanently delete episode (hard delete)
     * Removes the episode and all associated data from the database
     */
    async hardDelete(id: string): Promise<void> {
        await this.db.run('BEGIN TRANSACTION');

        try {
            // Delete associated tags
            await this.db.run('DELETE FROM episode_tags WHERE episode_id = ?', id);

            // Delete associated events
            await this.db.run('DELETE FROM media_events WHERE episode_id = ?', id);

            // Delete the episode itself
            await this.db.run('DELETE FROM episodes WHERE id = ?', id);

            await this.db.run('COMMIT');
        } catch (error) {
            await this.db.run('ROLLBACK');
            throw error;
        }
    }

    /**
     * Permanently delete all soft-deleted episodes for a user
     */
    async bulkHardDelete(userId: string): Promise<void> {
        await this.db.run('BEGIN TRANSACTION');

        try {
            // Find all soft-deleted episode IDs first for cleaning up relations
            const rows = await this.db.all('SELECT id FROM episodes WHERE user_id = ? AND is_deleted = 1', userId);
            const ids = rows.map(row => row.id);

            if (ids.length > 0) {
                const placeholders = ids.map(() => '?').join(',');
                
                // Delete associated tags
                await this.db.run(`DELETE FROM episode_tags WHERE episode_id IN (${placeholders})`, ids);

                // Delete associated events
                await this.db.run(`DELETE FROM media_events WHERE episode_id IN (${placeholders})`, ids);

                // Delete the episodes
                await this.db.run(`DELETE FROM episodes WHERE user_id = ? AND is_deleted = 1`, userId);
            }

            await this.db.run('COMMIT');
        } catch (error) {
            await this.db.run('ROLLBACK');
            throw error;
        }
    }


    /**
     * Add a media event
     */
    async addEvent(episodeId: string, eventType: MediaEventType, title?: string, type?: string): Promise<void> {
        const id = uuidv4();
        const now = Math.floor(Date.now() / 1000);

        await this.db.run(
            'INSERT INTO media_events (id, episode_id, event_type, title, type, created_at) VALUES (?, ?, ?, ?, ?, ?)',
            [id, episodeId, eventType, title || null, type || null, now]
        );
    }

    /**
     * Reorder episodes
     */
    async reorder(episodeIds: string[]): Promise<void> {
        const now = Math.floor(Date.now() / 1000);

        // Use a transaction for consistency
        await this.db.run('BEGIN TRANSACTION');

        try {
            for (let i = 0; i < episodeIds.length; i++) {
                await this.db.run(
                    'UPDATE episodes SET custom_order = ?, updated_at = ? WHERE id = ?',
                    [i, now, episodeIds[i]]
                );
            }
            await this.db.run('COMMIT');
        } catch (error) {
            await this.db.run('ROLLBACK');
            throw error;
        }
    }

    /**
     * Move episode to the beginning of the list
     */
    async moveToBeginning(id: string): Promise<void> {
        const episodes = await this.findAll({ watched: false }, { field: 'custom', order: 'asc' });
        const episodeIds = episodes.map(e => e.id).filter(vid => vid !== id);
        episodeIds.unshift(id);
        await this.reorder(episodeIds);
    }

    /**
     * Move episode to the end of the list
     */
    async moveToEnd(id: string): Promise<void> {
        const episodes = await this.findAll({ watched: false }, { field: 'custom', order: 'asc' });
        const episodeIds = episodes.map(e => e.id).filter(vid => vid !== id);
        episodeIds.push(id);
        await this.reorder(episodeIds);
    }

    /**
     * Associate tags with an episode
     */
    async addTags(episodeId: string, tagIds: string[]): Promise<void> {
        const now = Math.floor(Date.now() / 1000);

        for (const tagId of tagIds) {
            await this.db.run(
                'INSERT OR IGNORE INTO episode_tags (episode_id, tag_id, created_at) VALUES (?, ?, ?)',
                [episodeId, tagId, now]
            );
        }
    }

    /**
     * Remove all tags from an episode
     */
    async removeTags(episodeId: string): Promise<void> {
        await this.db.run('DELETE FROM episode_tags WHERE episode_id = ?', episodeId);
    }

    /**
     * Get tags for an episode
     */
    async getTags(episodeId: string): Promise<string[]> {
        const rows = await this.db.all(
            'SELECT tag_id FROM episode_tags WHERE episode_id = ?',
            episodeId
        );
        return rows.map((row: Record<string, unknown>) => row.tag_id as string);
    }

    private buildOrderBy(sort: SortOptions): string {
        const direction = sort.order === 'asc' ? 'ASC' : 'DESC';

        switch (sort.field) {
            case 'custom':
                return `e.custom_order ${direction}, e.created_at DESC`;
            case 'created_at':
                return `e.created_at ${direction}`;
            case 'priority':
                return `e.priority ${direction}, e.created_at DESC`;
            case 'favorite':
                return `e.favorite ${direction}, e.created_at DESC`;
            case 'duration':
                return `e.duration ${direction}`;
            case 'title':
                return `e.title ${direction}`;
            case 'date_added':
                return `last_added_at ${direction}`;
            case 'date_watched':
                return `last_watched_at ${direction}`;
            case 'date_favorited':
                return `last_favorited_at ${direction}`;
            case 'date_removed':
                return `last_removed_at ${direction}`;
            default:
                return 'e.custom_order ASC, e.created_at DESC';
        }
    }

    private mapRowToEpisode(row: Record<string, unknown>): MediaEpisode {
        return {
            id: row.id as string,
            type: row.type as MediaType,
            externalId: row.external_id as string,
            title: row.title as string,
            description: row.description as string | null,
            duration: row.duration as number | null,
            thumbnailUrl: row.thumbnail_url as string | null,
            url: row.url as string,
            uploadDate: row.upload_date as string | null,
            publishedDate: row.published_date as string | null,
            viewCount: row.view_count as number | null,
            channelId: row.channel_id as string,
            channelName: row.channel_name as string | undefined,
            watched: Boolean(row.watched),
            watchStatus: row.watch_status as WatchStatus,
            favorite: Boolean(row.favorite),
            isDeleted: Boolean(row.is_deleted),
            priority: row.priority as Priority,
            customOrder: row.custom_order as number | null,
            userId: row.user_id as string,
            createdAt: row.created_at as number,
            updatedAt: row.updated_at as number,
            lastAddedAt: (row.last_added_at as number) || undefined,
            lastWatchedAt: (row.last_watched_at as number) || undefined,
            lastPendingAt: (row.last_pending_at as number) || undefined,
            lastFavoritedAt: (row.last_favorited_at as number) || undefined,
            lastRemovedAt: (row.last_removed_at as number) || undefined,
        };
    }
}
===
import { Database } from 'sqlite';
import { v4 as uuidv4 } from 'uuid';
import {
    MediaEpisode,
    CreateEpisodeDto,
    UpdateEpisodeDto,
    EpisodeFilters,
    SortOptions,
    MediaEventType,
    MediaType,
    WatchStatus,
    Priority,
    Tag,
    PaginationOptions,
} from '../domain/models';

export class EpisodeRepository {
    constructor(private db: Database) { }

    /**
     * Create a new episode
     */
    async create(dto: CreateEpisodeDto): Promise<MediaEpisode> {
        const id = uuidv4();
        const now = Math.floor(Date.now() / 1000);

        await this.db.run(
            `INSERT INTO episodes (
        id, type, external_id, title, description, duration, thumbnail_url,
        url, upload_date, published_date, view_count, channel_id, user_id,
        watch_status, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                id,
                dto.type,
                dto.externalId,
                dto.title,
                dto.description || null,
                dto.duration || null,
                dto.thumbnailUrl || null,
                dto.url,
                dto.uploadDate || null,
                dto.publishedDate || null,
                dto.viewCount || null,
                dto.channelId,
                dto.userId,
                'unwatched',
                now,
                now,
            ]
        );

        const episode = await this.findById(id);
        if (!episode) {
            throw new Error('Failed to create episode');
        }
        return episode;
    }

    /**
     * Find episode by ID
     */
    async findById(id: string): Promise<MediaEpisode | null> {
        const row = await this.db.get(`
            SELECT e.*, c.name as channel_name,
            (SELECT created_at FROM media_events WHERE episode_id = e.id AND event_type = 'added' ORDER BY created_at DESC LIMIT 1) as last_added_at,
            (SELECT created_at FROM media_events WHERE episode_id = e.id AND event_type = 'watched' ORDER BY created_at DESC LIMIT 1) as last_watched_at,
            (SELECT created_at FROM media_events WHERE episode_id = e.id AND event_type = 'pending' ORDER BY created_at DESC LIMIT 1) as last_pending_at,
            (SELECT created_at FROM media_events WHERE episode_id = e.id AND event_type = 'favorited' ORDER BY created_at DESC LIMIT 1) as last_favorited_at,
            (SELECT created_at FROM media_events WHERE episode_id = e.id AND event_type = 'removed' ORDER BY created_at DESC LIMIT 1) as last_removed_at
            FROM episodes e 
            LEFT JOIN channels c ON e.channel_id = c.id 
            WHERE e.id = ?
        `, id);
        if (!row) return null;

        const episode = this.mapRowToEpisode(row);
        const tagRows = await this.db.all(`
            SELECT t.* FROM tags t
            JOIN episode_tags et ON t.id = et.tag_id
            WHERE et.episode_id = ?
        `, id);
        episode.tags = tagRows.map(row => ({
            id: row.id,
            name: row.name,
            color: row.color,
            userId: row.user_id,
            createdAt: row.created_at,
        }));

        return episode;
    }

    /**
     * Find episode by External ID
     */
    async findByExternalId(externalId: string, userId: string): Promise<MediaEpisode | null> {
        const row = await this.db.get(
            'SELECT * FROM episodes WHERE external_id = ? AND user_id = ?',
            [externalId, userId]
        );
        return row ? this.mapRowToEpisode(row) : null;
    }

    /**
     * Find all episodes with optional filters and sorting
     */
    async findAll(
        filters?: EpisodeFilters,
        sort?: SortOptions,
        pagination?: PaginationOptions
    ): Promise<MediaEpisode[]> {
        const hasTagFilter = filters?.tagIds && filters.tagIds.length > 0;
        let query = `
            SELECT ${hasTagFilter ? 'DISTINCT ' : ''}e.*, c.name as channel_name,
            (SELECT created_at FROM media_events WHERE episode_id = e.id AND event_type = 'added' ORDER BY created_at DESC LIMIT 1) as last_added_at,
            (SELECT created_at FROM media_events WHERE episode_id = e.id AND event_type = 'watched' ORDER BY created_at DESC LIMIT 1) as last_watched_at,
            (SELECT created_at FROM media_events WHERE episode_id = e.id AND event_type = 'pending' ORDER BY created_at DESC LIMIT 1) as last_pending_at,
            (SELECT created_at FROM media_events WHERE episode_id = e.id AND event_type = 'favorited' ORDER BY created_at DESC LIMIT 1) as last_favorited_at,
            (SELECT created_at FROM media_events WHERE episode_id = e.id AND event_type = 'removed' ORDER BY created_at DESC LIMIT 1) as last_removed_at
            FROM episodes e
        `;
        query += ' LEFT JOIN channels c ON e.channel_id = c.id';
        const params: (string | number | null)[] = [];

        // Join with episode_tags if filtering by tags
        if (filters?.tagIds && filters.tagIds.length > 0) {
            query += ' INNER JOIN episode_tags et ON e.id = et.episode_id';
        }

        // Build WHERE clause
        const conditions: string[] = [];

        if (filters?.type) {
            conditions.push('e.type = ?');
            params.push(filters.type);
        }

        if (filters?.tagIds && filters.tagIds.length > 0) {
            const placeholders = filters.tagIds.map(() => '?').join(',');
            conditions.push(`et.tag_id IN (${placeholders})`);
            params.push(...filters.tagIds);
        }

        if (filters?.search) {
            conditions.push(
                '(e.title LIKE ? OR e.description LIKE ? OR EXISTS (SELECT 1 FROM channels c WHERE c.id = e.channel_id AND c.name LIKE ?))'
            );
            const searchTerm = `%${filters.search}%`;
            params.push(searchTerm, searchTerm, searchTerm);
        }

        if (filters?.watched !== undefined) {
            conditions.push('e.watched = ?');
            params.push(filters.watched ? 1 : 0);
        }

        if (filters?.watchStatus !== undefined) {
            conditions.push('e.watch_status = ?');
            params.push(filters.watchStatus);
        }

        if (filters?.favorite !== undefined) {
            conditions.push('e.favorite = ?');
            params.push(filters.favorite ? 1 : 0);
        }

        if (filters?.isDeleted !== undefined) {
            conditions.push('e.is_deleted = ?');
            params.push(filters.isDeleted ? 1 : 0);
        } else {
            // Default: only show non-deleted episodes
            conditions.push('e.is_deleted = 0');
        }

        if (filters?.channelId) {
            conditions.push('e.channel_id = ?');
            params.push(filters.channelId);
        }

        if (filters?.channelIds && filters.channelIds.length > 0) {
            const placeholders = filters.channelIds.map(() => '?').join(',');
            conditions.push(`e.channel_id IN (${placeholders})`);
            params.push(...filters.channelIds);
        }

        if (filters?.userId) {
            conditions.push('e.user_id = ?');
            params.push(filters.userId);
        }

        if (conditions.length > 0) {
            query += ' WHERE ' + conditions.join(' AND ');
        }

        // Add sorting
        if (sort) {
            const orderBy = this.buildOrderBy(sort);
            query += ` ORDER BY ${orderBy}`;
        } else {
            // Default sort: Manual order first, then fallback to newest first
            query += ' ORDER BY e.custom_order ASC, e.created_at DESC';
        }

        // Add pagination
        if (pagination?.limit !== undefined) {
            query += ' LIMIT ?';
            params.push(pagination.limit);
        }
        if (pagination?.offset !== undefined) {
            query += ' OFFSET ?';
            params.push(pagination.offset);
        }

        const rows = await this.db.all(query, params);
        const episodes = rows.map((row) => this.mapRowToEpisode(row));

        if (episodes.length > 0) {
            const episodeIds = episodes.map(e => e.id);
            const placeholders = episodeIds.map(() => '?').join(',');
            const tagRows = await this.db.all(`
                SELECT et.episode_id, t.* FROM tags t
                JOIN episode_tags et ON t.id = et.tag_id
                WHERE et.episode_id IN (${placeholders})
            `, episodeIds);

            // Group tags by episode_id
            const tagsByEpisodeId: Record<string, Tag[]> = {};
            tagRows.forEach((row: Record<string, unknown>) => {
                if (!tagsByEpisodeId[row.episode_id as string]) {
                    tagsByEpisodeId[row.episode_id as string] = [];
                }
                tagsByEpisodeId[row.episode_id as string].push({
                    id: row.id as string,
                    name: row.name as string,
                    color: row.color as string | null,
                    userId: row.user_id as string,
                    createdAt: row.created_at as number,
                });
            });

            // Attach tags to episodes
            episodes.forEach(e => {
                e.tags = tagsByEpisodeId[e.id] || [];
            });
        }

        return episodes;
    }

    /**
     * Count all episodes matching filters
     */
    async countAll(filters?: EpisodeFilters): Promise<number> {
        const hasTagFilter = filters?.tagIds && filters.tagIds.length > 0;
        let query = `SELECT COUNT(${hasTagFilter ? 'DISTINCT ' : ''}e.id) as count FROM episodes e`;
        const params: (string | number | null)[] = [];

        if (hasTagFilter) {
            query += ' INNER JOIN episode_tags et ON e.id = et.episode_id';
        }

        const conditions: string[] = [];

        if (filters?.type) {
            conditions.push('e.type = ?');
            params.push(filters.type);
        }

        if (filters?.tagIds && filters.tagIds.length > 0) {
            const placeholders = filters.tagIds.map(() => '?').join(',');
            conditions.push(`et.tag_id IN (${placeholders})`);
            params.push(...filters.tagIds);
        }

        if (filters?.search) {
            conditions.push(
                '(e.title LIKE ? OR e.description LIKE ? OR EXISTS (SELECT 1 FROM channels c WHERE c.id = e.channel_id AND c.name LIKE ?))'
            );
            const searchTerm = `%${filters.search}%`;
            params.push(searchTerm, searchTerm, searchTerm);
        }

        if (filters?.watched !== undefined) {
            conditions.push('e.watched = ?');
            params.push(filters.watched ? 1 : 0);
        }

        if (filters?.watchStatus !== undefined) {
            conditions.push('e.watch_status = ?');
            params.push(filters.watchStatus);
        }

        if (filters?.favorite !== undefined) {
            conditions.push('e.favorite = ?');
            params.push(filters.favorite ? 1 : 0);
        }

        if (filters?.isDeleted !== undefined) {
            conditions.push('e.is_deleted = ?');
            params.push(filters.isDeleted ? 1 : 0);
        } else {
            conditions.push('e.is_deleted = 0');
        }

        if (filters?.channelId) {
            conditions.push('e.channel_id = ?');
            params.push(filters.channelId);
        }

        if (filters?.channelIds && filters.channelIds.length > 0) {
            const placeholders = filters.channelIds.map(() => '?').join(',');
            conditions.push(`e.channel_id IN (${placeholders})`);
            params.push(...filters.channelIds);
        }

        if (filters?.userId) {
            conditions.push('e.user_id = ?');
            params.push(filters.userId);
        }

        if (conditions.length > 0) {
            query += ' WHERE ' + conditions.join(' AND ');
        }

        const result = await this.db.get(query, params);
        return result?.count || 0;
    }

    /**
     * Update episode
     */
    async update(id: string, dto: UpdateEpisodeDto): Promise<MediaEpisode> {
        const updates: string[] = [];
        const params: (string | number | null)[] = [];

        if (dto.title !== undefined) {
            updates.push('title = ?');
            params.push(dto.title);
        }
        if (dto.description !== undefined) {
            updates.push('description = ?');
            params.push(dto.description);
        }
        if (dto.watched !== undefined) {
            updates.push('watched = ?');
            params.push(dto.watched ? 1 : 0);
            // Sync watch_status if not explicitly provided
            if (dto.watchStatus === undefined) {
                updates.push('watch_status = ?');
                params.push(dto.watched ? 'watched' : 'unwatched');
            }
        }
        if (dto.watchStatus !== undefined) {
            updates.push('watch_status = ?');
            params.push(dto.watchStatus);
            // Sync watched boolean
            updates.push('watched = ?');
            params.push(dto.watchStatus === 'watched' ? 1 : 0);
        }
        if (dto.favorite !== undefined) {
            updates.push('favorite = ?');
            params.push(dto.favorite ? 1 : 0);
        }
        if (dto.priority !== undefined) {
            updates.push('priority = ?');
            params.push(dto.priority);
        }
        if (dto.isDeleted !== undefined) {
            updates.push('is_deleted = ?');
            params.push(dto.isDeleted ? 1 : 0);
        }
        if (dto.customOrder !== undefined) {
            updates.push('custom_order = ?');
            params.push(dto.customOrder);
        }
        if (dto.viewCount !== undefined) {
            updates.push('view_count = ?');
            params.push(dto.viewCount);
        }

        updates.push('updated_at = ?');
        params.push(Math.floor(Date.now() / 1000));

        params.push(id);

        await this.db.run(
            `UPDATE episodes SET ${updates.join(', ')} WHERE id = ?`,
            params
        );

        // Update tags if provided
        if (dto.tagIds !== undefined) {
            await this.removeTags(id);
            if (dto.tagIds.length > 0) {
                await this.addTags(id, dto.tagIds);
            }
        }

        const episode = await this.findById(id);
        if (!episode) {
            throw new Error('Episode not found after update');
        }
        return episode;
    }

    /**
     * Bulk update watch status for all episodes in a channel
     */
    async bulkUpdateWatchStatus(channelId: string, userId: string, watched: boolean): Promise<void> {
        const now = Math.floor(Date.now() / 1000);
        const watchStatus = watched ? 'watched' : 'unwatched';
        const watchedInt = watched ? 1 : 0;

        // Get all applicable episodes first to create events
        const episodes = await this.findAll({ channelId, userId, isDeleted: false });

        await this.db.run('BEGIN TRANSACTION');

        try {
            await this.db.run(
                `UPDATE episodes 
                 SET watched = ?, watch_status = ?, updated_at = ? 
                 WHERE channel_id = ? AND user_id = ? AND is_deleted = 0`,
                [watchedInt, watchStatus, now, channelId, userId]
            );

            // Add events for each episode
            const eventType = watched ? 'watched' : 'unwatched';
            for (const episode of episodes) {
                if (episode.watched !== watched) {
                    await this.addEvent(episode.id, eventType, episode.title, episode.type);
                }
            }

            await this.db.run('COMMIT');
        } catch (error) {
            await this.db.run('ROLLBACK');
            throw error;
        }
    }

    /**
     * Delete episode (soft delete)
     */
    async delete(id: string): Promise<void> {
        await this.db.run('UPDATE episodes SET is_deleted = 1, updated_at = ? WHERE id = ?', [
            Math.floor(Date.now() / 1000),
            id
        ]);
    }

    /**
     * Restore all soft-deleted episodes for a user
     */
    async bulkRestore(userId: string): Promise<void> {
        await this.db.run(
            'UPDATE episodes SET is_deleted = 0, updated_at = ? WHERE user_id = ? AND is_deleted = 1',
            [Math.floor(Date.now() / 1000), userId]
        );
    }

    /**
     * Permanently delete episode (hard delete)
     * Removes the episode and all associated data from the database
     */
    async hardDelete(id: string): Promise<void> {
        await this.db.run('BEGIN TRANSACTION');

        try {
            // Delete associated tags
            await this.db.run('DELETE FROM episode_tags WHERE episode_id = ?', id);

            // Delete associated events
            await this.db.run('DELETE FROM media_events WHERE episode_id = ?', id);

            // Delete the episode itself
            await this.db.run('DELETE FROM episodes WHERE id = ?', id);

            await this.db.run('COMMIT');
        } catch (error) {
            await this.db.run('ROLLBACK');
            throw error;
        }
    }

    /**
     * Permanently delete all soft-deleted episodes for a user
     */
    async bulkHardDelete(userId: string): Promise<void> {
        await this.db.run('BEGIN TRANSACTION');

        try {
            // Find all soft-deleted episode IDs first for cleaning up relations
            const rows = await this.db.all('SELECT id FROM episodes WHERE user_id = ? AND is_deleted = 1', userId);
            const ids = rows.map(row => row.id);

            if (ids.length > 0) {
                const placeholders = ids.map(() => '?').join(',');
                
                // Delete associated tags
                await this.db.run(`DELETE FROM episode_tags WHERE episode_id IN (${placeholders})`, ids);

                // Delete associated events
                await this.db.run(`DELETE FROM media_events WHERE episode_id IN (${placeholders})`, ids);

                // Delete the episodes
                await this.db.run(`DELETE FROM episodes WHERE user_id = ? AND is_deleted = 1`, userId);
            }

            await this.db.run('COMMIT');
        } catch (error) {
            await this.db.run('ROLLBACK');
            throw error;
        }
    }


    /**
     * Add a media event
     */
    async addEvent(episodeId: string, eventType: MediaEventType, title?: string, type?: string): Promise<void> {
        const id = uuidv4();
        const now = Math.floor(Date.now() / 1000);

        await this.db.run(
            'INSERT INTO media_events (id, episode_id, event_type, title, type, created_at) VALUES (?, ?, ?, ?, ?, ?)',
            [id, episodeId, eventType, title || null, type || null, now]
        );
    }

    /**
     * Reorder episodes
     */
    async reorder(episodeIds: string[]): Promise<void> {
        const now = Math.floor(Date.now() / 1000);

        // Use a transaction for consistency
        await this.db.run('BEGIN TRANSACTION');

        try {
            for (let i = 0; i < episodeIds.length; i++) {
                await this.db.run(
                    'UPDATE episodes SET custom_order = ?, updated_at = ? WHERE id = ?',
                    [i, now, episodeIds[i]]
                );
            }
            await this.db.run('COMMIT');
        } catch (error) {
            await this.db.run('ROLLBACK');
            throw error;
        }
    }

    /**
     * Move episode to the beginning of the list
     */
    async moveToBeginning(id: string): Promise<void> {
        const episodes = await this.findAll({ watched: false }, { field: 'custom', order: 'asc' });
        const episodeIds = episodes.map(e => e.id).filter(vid => vid !== id);
        episodeIds.unshift(id);
        await this.reorder(episodeIds);
    }

    /**
     * Move episode to the end of the list
     */
    async moveToEnd(id: string): Promise<void> {
        const episodes = await this.findAll({ watched: false }, { field: 'custom', order: 'asc' });
        const episodeIds = episodes.map(e => e.id).filter(vid => vid !== id);
        episodeIds.push(id);
        await this.reorder(episodeIds);
    }

    /**
     * Associate tags with an episode
     */
    async addTags(episodeId: string, tagIds: string[]): Promise<void> {
        const now = Math.floor(Date.now() / 1000);

        for (const tagId of tagIds) {
            await this.db.run(
                'INSERT OR IGNORE INTO episode_tags (episode_id, tag_id, created_at) VALUES (?, ?, ?)',
                [episodeId, tagId, now]
            );
        }
    }

    /**
     * Remove all tags from an episode
     */
    async removeTags(episodeId: string): Promise<void> {
        await this.db.run('DELETE FROM episode_tags WHERE episode_id = ?', episodeId);
    }

    /**
     * Get tags for an episode
     */
    async getTags(episodeId: string): Promise<string[]> {
        const rows = await this.db.all(
            'SELECT tag_id FROM episode_tags WHERE episode_id = ?',
            episodeId
        );
        return rows.map((row: Record<string, unknown>) => row.tag_id as string);
    }

    private buildOrderBy(sort: SortOptions): string {
        const direction = sort.order === 'asc' ? 'ASC' : 'DESC';

        switch (sort.field) {
            case 'custom':
                return `e.custom_order ${direction}, e.created_at DESC`;
            case 'created_at':
                return `e.created_at ${direction}`;
            case 'priority':
                return `e.priority ${direction}, e.created_at DESC`;
            case 'favorite':
                return `e.favorite ${direction}, e.created_at DESC`;
            case 'duration':
                return `e.duration ${direction}`;
            case 'title':
                return `e.title ${direction}`;
            case 'date_added':
                return `last_added_at ${direction}`;
            case 'date_watched':
                return `last_watched_at ${direction}`;
            case 'date_favorited':
                return `last_favorited_at ${direction}`;
            case 'date_removed':
                return `last_removed_at ${direction}`;
            default:
                return 'e.custom_order ASC, e.created_at DESC';
        }
    }

    private mapRowToEpisode(row: Record<string, unknown>): MediaEpisode {
        return {
            id: row.id as string,
            type: row.type as MediaType,
            externalId: row.external_id as string,
            title: row.title as string,
            description: row.description as string | null,
            duration: row.duration as number | null,
            thumbnailUrl: row.thumbnail_url as string | null,
            url: row.url as string,
            uploadDate: row.upload_date as string | null,
            publishedDate: row.published_date as string | null,
            viewCount: row.view_count as number | null,
            channelId: row.channel_id as string,
            channelName: row.channel_name as string | undefined,
            watched: Boolean(row.watched),
            watchStatus: row.watch_status as WatchStatus,
            favorite: Boolean(row.favorite),
            isDeleted: Boolean(row.is_deleted),
            priority: row.priority as Priority,
            customOrder: row.custom_order as number | null,
            userId: row.user_id as string,
            createdAt: row.created_at as number,
            updatedAt: row.updated_at as number,
            lastAddedAt: (row.last_added_at as number) || undefined,
            lastWatchedAt: (row.last_watched_at as number) || undefined,
            lastPendingAt: (row.last_pending_at as number) || undefined,
            lastFavoritedAt: (row.last_favorited_at as number) || undefined,
            lastRemovedAt: (row.last_removed_at as number) || undefined,
        };
    }
}
```
```diff:route.ts
import { NextRequest, NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { getDatabase } from '@/lib/db/database';
import { MediaService } from '@/lib/services';
import { z } from 'zod';
import { MediaType, SortField } from '@/lib/domain/models';

// Request validation schema
const addEpisodeSchema = z.object({
    url: z.string().url('Invalid URL'),
    tagIds: z.array(z.string()).optional(),
});

/**
 * POST /api/episodes - Add a new episode from URL
 */
export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        const userId = (session.user as { id: string }).id;

        const body = await request.json();
        const { url, tagIds } = addEpisodeSchema.parse(body);

        const db = await getDatabase();
        const mediaService = new MediaService(db);

        const episode = await mediaService.addEpisodeFromUrl(url, userId, tagIds);

        return NextResponse.json(episode, { status: 201 });
    } catch (error) {
        console.error('Error adding episode:', error);

        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: 'Invalid request data', details: error.issues },
                { status: 400 }
            );
        }

        if (error instanceof Error) {
            return NextResponse.json(
                { error: error.message },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { error: 'Failed to add episode' },
            { status: 500 }
        );
    }
}

/**
 * GET /api/episodes - List episodes with optional filters and sorting
 */
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);

        // Parse filters
        const tagIds = searchParams.get('tags')?.split(',').filter(Boolean);
        const search = searchParams.get('search') || undefined;
        const watchedParam = searchParams.get('watched');
        const favoriteParam = searchParams.get('favorite');
        const channelId = searchParams.get('channelId') || undefined;
        const watchStatus = searchParams.get('watchStatus') as 'unwatched' | 'pending' | 'watched' | undefined || undefined;
        const type = searchParams.get('type') as MediaType | undefined;

        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        const userId = (session.user as { id: string }).id;

        const filters = {
            type,
            tagIds,
            search,
            watched: watchedParam ? watchedParam === 'true' : undefined,
            watchStatus,
            favorite: favoriteParam ? favoriteParam === 'true' : undefined,
            channelId,
            userId,
            isDeleted: searchParams.get('isDeleted') === 'true' ? true : undefined,
        };


        // Parse sorting
        const sortField = searchParams.get('sort') || 'created_at';
        const sortOrder = searchParams.get('order') || 'desc';

        const sort = {
            field: sortField as SortField,
            order: sortOrder as 'asc' | 'desc',
        };

        // Parse pagination
        const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined;
        const offset = searchParams.get('offset') ? parseInt(searchParams.get('offset')!) : undefined;

        const pagination = {
            limit,
            offset,
        };

        const db = await getDatabase();
        const mediaService = new MediaService(db);

        const { episodes, total } = await mediaService.listEpisodes(filters, sort, pagination);

        return NextResponse.json({
            episodes,
            total,
        });
    } catch (error) {
        console.error('Error listing episodes:', error);
        return NextResponse.json(
            { 
                error: 'Failed to list episodes', 
                message: error instanceof Error ? error.message : String(error) 
            },
            { status: 500 }
        );
    }
}
===
import { NextRequest, NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { getDatabase } from '@/lib/db/database';
import { MediaService } from '@/lib/services';
import { z } from 'zod';
import { MediaType, SortField } from '@/lib/domain/models';

// Request validation schema
const addEpisodeSchema = z.object({
    url: z.string().url('Invalid URL'),
    tagIds: z.array(z.string()).optional(),
});

/**
 * POST /api/episodes - Add a new episode from URL
 */
export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        const userId = (session.user as { id: string }).id;

        const body = await request.json();
        const { url, tagIds } = addEpisodeSchema.parse(body);

        const db = await getDatabase();
        const mediaService = new MediaService(db);

        const episode = await mediaService.addEpisodeFromUrl(url, userId, tagIds);

        return NextResponse.json(episode, { status: 201 });
    } catch (error) {
        console.error('Error adding episode:', error);

        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: 'Invalid request data', details: error.issues },
                { status: 400 }
            );
        }

        if (error instanceof Error) {
            return NextResponse.json(
                { error: error.message },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { error: 'Failed to add episode' },
            { status: 500 }
        );
    }
}

/**
 * GET /api/episodes - List episodes with optional filters and sorting
 */
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);

        // Parse filters
        const tagIds = searchParams.get('tags')?.split(',').filter(Boolean);
        const search = searchParams.get('search') || undefined;
        const watchedParam = searchParams.get('watched');
        const favoriteParam = searchParams.get('favorite');
        const channelId = searchParams.get('channelId') || undefined;
        const channelsParam = searchParams.get('channels');
        const channelIds = channelsParam ? channelsParam.split(',').filter(Boolean) : undefined;
        const watchStatus = searchParams.get('watchStatus') as 'unwatched' | 'pending' | 'watched' | undefined || undefined;
        const type = searchParams.get('type') as MediaType | undefined;

        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        const userId = (session.user as { id: string }).id;

        const filters = {
            type,
            tagIds,
            search,
            watched: watchedParam ? watchedParam === 'true' : undefined,
            watchStatus,
            favorite: favoriteParam ? favoriteParam === 'true' : undefined,
            channelId,
            channelIds,
            userId,
            isDeleted: searchParams.get('isDeleted') === 'true' ? true : undefined,
        };


        // Parse sorting
        const sortField = searchParams.get('sort') || 'created_at';
        const sortOrder = searchParams.get('order') || 'desc';

        const sort = {
            field: sortField as SortField,
            order: sortOrder as 'asc' | 'desc',
        };

        // Parse pagination
        const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined;
        const offset = searchParams.get('offset') ? parseInt(searchParams.get('offset')!) : undefined;

        const pagination = {
            limit,
            offset,
        };

        const db = await getDatabase();
        const mediaService = new MediaService(db);

        const { episodes, total } = await mediaService.listEpisodes(filters, sort, pagination);

        return NextResponse.json({
            episodes,
            total,
        });
    } catch (error) {
        console.error('Error listing episodes:', error);
        return NextResponse.json(
            { 
                error: 'Failed to list episodes', 
                message: error instanceof Error ? error.message : String(error) 
            },
            { status: 500 }
        );
    }
}
```
