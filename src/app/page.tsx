'use client';

import { useState } from 'react';
import { Layout } from '@/components/layout';
import { AddVideoDialog, FilterBar, VideoList } from '@/components/features/videos';

export default function HomePage() {
  const [filters, setFilters] = useState<any>({});
  const [sort, setSort] = useState<any>({ field: 'created_at', order: 'desc' });
  const [refreshKey, setRefreshKey] = useState(0);

  const handleVideoAdded = () => {
    setRefreshKey((prev) => prev + 1);
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
          <AddVideoDialog onVideoAdded={handleVideoAdded} />
        </div>

        {/* Filters */}
        <FilterBar onFilterChange={setFilters} onSortChange={setSort} />

        {/* Video List */}
        <VideoList key={refreshKey} filters={filters} sort={sort} />
      </div>
    </Layout>
  );
}
