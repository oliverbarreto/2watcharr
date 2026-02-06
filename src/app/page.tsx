'use client';

import { useState, useEffect, Suspense } from 'react';
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
        <EpisodeList key={refreshKey} filters={filters} sort={sort} viewMode={viewMode} />
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
