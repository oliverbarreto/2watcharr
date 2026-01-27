'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Layout } from '@/components/layout';
import { AddVideoDialog, FilterBar, VideoList } from '@/components/features/videos';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

export default function HomePage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const channelId = searchParams.get('channelId');

  const [filters, setFilters] = useState<any>({
    channelId: channelId || undefined
  });
  const [sort, setSort] = useState<any>({ field: 'custom', order: 'asc' });
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const channelId = searchParams.get('channelId');
    setFilters((prev: any) => ({
      ...prev,
      channelId: channelId || undefined
    }));
  }, [searchParams]);

  const handleVideoAdded = () => {
    setRefreshKey((prev) => prev + 1);
  };

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
            <AddVideoDialog onVideoAdded={handleVideoAdded} />
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
        <VideoList key={refreshKey} filters={filters} sort={sort} />
      </div>
    </Layout>
  );
}
