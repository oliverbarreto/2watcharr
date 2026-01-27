'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Layout } from '@/components/layout';
import { FilterBar, VideoList } from '@/components/features/videos';
import { Button } from '@/components/ui/button';
import { X, List, LayoutGrid } from 'lucide-react';

function HomePageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const channelId = searchParams.get('channelId');

  const [filters, setFilters] = useState<any>({
    channelId: channelId || undefined
  });
  const [sort, setSort] = useState<any>({ field: 'custom', order: 'asc' });
  const [refreshKey, setRefreshKey] = useState(0);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    const savedViewMode = localStorage.getItem('videoViewMode') as 'grid' | 'list';
    if (savedViewMode) {
      setViewMode(savedViewMode);
    }
  }, []);

  const toggleViewMode = () => {
    const newMode = viewMode === 'grid' ? 'list' : 'grid';
    setViewMode(newMode);
    localStorage.setItem('videoViewMode', newMode);
  };

  useEffect(() => {
    const channelId = searchParams.get('channelId');
    setFilters((prev: any) => ({
      ...prev,
      channelId: channelId || undefined
    }));
  }, [searchParams]);

  useEffect(() => {
    const handleAdded = () => setRefreshKey((prev) => prev + 1);
    window.addEventListener('video-added', handleAdded);
    return () => window.removeEventListener('video-added', handleAdded);
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
              Manage your YouTube videos to watch later
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
            <Button variant="ghost" size="sm" onClick={toggleViewMode} className="gap-2">
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

        {/* Video List */}
        <VideoList key={refreshKey} filters={filters} sort={sort} viewMode={viewMode} />
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
                Loading videos...
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
