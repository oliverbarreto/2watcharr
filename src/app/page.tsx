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
