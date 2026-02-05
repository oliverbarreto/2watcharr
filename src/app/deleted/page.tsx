'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { Layout } from '@/components/layout';
import { FilterBar, EpisodeList } from '@/components/features/episodes';
import { Button } from '@/components/ui/button';
import { List, LayoutGrid, ArrowLeft } from 'lucide-react';

interface Filters {
  search?: string;
  watched?: boolean;
  watchStatus?: 'unwatched' | 'pending' | 'watched';
  tagIds?: string[];
  isDeleted?: boolean;
}

interface Sort {
  field: string;
  order: 'asc' | 'desc';
}

function DeletedEpisodesContent() {
  const router = useRouter();
  
  const [filters, setFilters] = useState<Filters>({});
  const [sort, setSort] = useState<Sort>({ field: 'date_removed', order: 'desc' });
  const [refreshKey, setRefreshKey] = useState(0);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>(() => {
    if (typeof window !== 'undefined') {
      const savedViewMode = localStorage.getItem('deletedEpisodeViewMode') as 'grid' | 'list';
      const defaultView = localStorage.getItem('defaultView') as 'grid' | 'list';
      return savedViewMode || defaultView || 'list';
    }
    return 'list';
  });

  const toggleViewMode = () => {
    const newMode = viewMode === 'grid' ? 'list' : 'grid';
    setViewMode(newMode);
    localStorage.setItem('deletedEpisodeViewMode', newMode);
  };

  useEffect(() => {
    const handleRestored = () => setRefreshKey((prev) => prev + 1);
    window.addEventListener('episode-restored', handleRestored);
    return () => window.removeEventListener('episode-restored', handleRestored);
  }, []);

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/settings')}
                className="gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Settings
              </Button>
            </div>
            <h1 className="text-3xl font-bold">Deleted Episodes</h1>
            <p className="text-muted-foreground">
              Episodes that have been removed from your watch list
            </p>
          </div>
          <div className="flex items-center gap-2">
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
          filters={{ ...filters, isDeleted: true }} 
          sort={sort} 
          viewMode={viewMode} 
        />
      </div>
    </Layout>
  );
}

export default function DeletedEpisodesPage() {
  return (
    <Suspense fallback={
      <Layout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Deleted Episodes</h1>
              <p className="text-muted-foreground">
                Loading...
              </p>
            </div>
          </div>
        </div>
      </Layout>
    }>
      <DeletedEpisodesContent />
    </Suspense>
  );
}
