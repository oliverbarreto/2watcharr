'use client';

import { useState, useEffect, Suspense, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Layout } from '@/components/layout';
import { FilterBar, EpisodeList } from '@/components/features/episodes';
import { Button } from '@/components/ui/button';
import { List, LayoutGrid, ArrowLeft, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface Filters {
  search?: string;
  watched?: boolean;
  watchStatus?: 'unwatched' | 'pending' | 'watched';
  tagIds?: string[];
  favorite?: boolean;
  isArchived?: boolean;
  isDeleted?: boolean;

  hasNotes?: boolean;
  likeStatus?: 'none' | 'like' | 'dislike';
  type?: 'video' | 'podcast';
  isShort?: boolean;
  priority?: 'none' | 'low' | 'medium' | 'high';
}

interface Sort {
  field: string;
  order: 'asc' | 'desc';
}

function ArchivedEpisodesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [refreshKey, setRefreshKey] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const [isUnarchiveAllDialogOpen, setIsUnarchiveAllDialogOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>(() => {
    if (typeof window !== 'undefined') {
      const savedViewMode = localStorage.getItem('archivedEpisodeViewMode') as 'grid' | 'list';
      const defaultView = localStorage.getItem('defaultView') as 'grid' | 'list';
      return savedViewMode || defaultView || 'list';
    }
    return 'list';
  });

  const toggleViewMode = () => {
    const newMode = viewMode === 'grid' ? 'list' : 'grid';
    setViewMode(newMode);
    localStorage.setItem('archivedEpisodeViewMode', newMode);
  };

  // Memoize filters from searchParams
  const filters: Filters = useMemo(() => {
    const status = searchParams.get('status');
    return {
      search: searchParams.get('search') || undefined,
      watched: status === 'watched' ? true : (status === 'unwatched' ? false : undefined),
      watchStatus: status as Filters['watchStatus'] || undefined,
      tagIds: searchParams.get('tags')?.split(',').filter(Boolean) || undefined,
      favorite: searchParams.get('favorite') === 'true' ? true : undefined,
      hasNotes: searchParams.get('hasNotes') === 'true' ? true : undefined,
      type: (searchParams.get('type') as Filters['type']) || undefined,
      isShort: searchParams.get('isShort') === 'true' ? true : (searchParams.get('isShort') === 'false' ? false : undefined),
      likeStatus: (searchParams.get('likeStatus') as Filters['likeStatus']) || undefined,
      priority: (searchParams.get('priority') as Filters['priority']) || undefined,
      isArchived: true,
      isDeleted: false,
    };
  }, [searchParams]);

  const sort: Sort = useMemo(() => {
    const field = searchParams.get('sort') || 'archived_at';
    const order = (searchParams.get('order') as 'asc' | 'desc') || 'desc';
    return { field, order };
  }, [searchParams]);

  const updateFilters = (newFilters: Partial<Filters>) => {
    const params = new URLSearchParams(searchParams.toString());
    const merged = { ...filters, ...newFilters };

    if (merged.search) params.set('search', merged.search); else params.delete('search');
    if (merged.watchStatus) params.set('status', merged.watchStatus); else params.delete('status');
    if (merged.tagIds?.length) params.set('tags', merged.tagIds.join(',')); else params.delete('tags');
    if (merged.favorite) params.set('favorite', 'true'); else params.delete('favorite');
    if (merged.hasNotes) params.set('hasNotes', 'true'); else params.delete('hasNotes');
    if (merged.type) params.set('type', merged.type); else params.delete('type');
    if (merged.isShort !== undefined) params.set('isShort', String(merged.isShort)); else params.delete('isShort');
    if (merged.likeStatus) params.set('likeStatus', merged.likeStatus); else params.delete('likeStatus');
    if (merged.priority) params.set('priority', merged.priority); else params.delete('priority');

    const queryString = params.toString();
    router.push(`/archived${queryString ? '?' + queryString : ''}`);
  };

  const handleSortChange = (newSort: Sort) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('sort', newSort.field);
    params.set('order', newSort.order);
    const queryString = params.toString();
    router.push(`/archived${queryString ? '?' + queryString : ''}`);
  };

  useEffect(() => {
    const handleUnarchived = () => setRefreshKey((prev) => prev + 1);
    const handleToggleFilters = () => setShowFilters((prev) => !prev);
    const handleCloseFilters = () => setShowFilters(false);
    
    window.addEventListener('episode-unarchived', handleUnarchived);
    window.addEventListener('toggle-filters', handleToggleFilters);
    window.addEventListener('close-filters', handleCloseFilters);
    
    return () => {
      window.removeEventListener('episode-unarchived', handleUnarchived);
      window.removeEventListener('toggle-filters', handleToggleFilters);
      window.removeEventListener('close-filters', handleCloseFilters);
    };
  }, []);

  const handleUnarchiveAll = async () => {
    setIsProcessing(true);
    try {
      const response = await fetch('/api/episodes/unarchive-all', { method: 'POST' });
      if (response.ok) {
        toast.success('All episodes unarchived successfully');
        setRefreshKey((prev) => prev + 1);
        window.dispatchEvent(new CustomEvent('episode-unarchived'));
      } else {
        toast.error('Failed to unarchive episodes');
      }
    } catch (error) {
      console.error('Error unarchiving episodes:', error);
      toast.error('Failed to unarchive episodes');
    } finally {
      setIsProcessing(false);
      setIsUnarchiveAllDialogOpen(false);
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/watchnext')}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Watch Next
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="gap-2 text-green-500 hover:text-green-600 hover:bg-green-500/10"
              onClick={() => setIsUnarchiveAllDialogOpen(true)}
              disabled={isProcessing}
            >
              <RotateCcw className="h-4 w-4" />
              Unarchive All
            </Button>
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

        {/* Floating Filters */}
        {showFilters && (
          <div className="fixed inset-x-0 top-16 z-30 animate-in slide-in-from-top duration-300">
            <div className="container mx-auto px-4">
              <div className="bg-background/60 backdrop-blur-md border rounded-b-xl shadow-2xl pt-4 px-4 pb-0 relative">
                <FilterBar
                  onFilterChange={updateFilters}
                  onSortChange={handleSortChange}
                  initialFilters={filters}
                  initialSort={sort}
                />
              </div>
            </div>
          </div>
        )}

        {/* Episode List */}
        <EpisodeList 
          key={refreshKey} 
          filters={filters} 
          sort={sort} 
          viewMode={viewMode} 
        />

        {/* Unarchive All Confirmation */}
        <Dialog open={isUnarchiveAllDialogOpen} onOpenChange={setIsUnarchiveAllDialogOpen}>
          <DialogContent className="sm:max-w-[425px] bg-zinc-900 text-zinc-100 border-zinc-800">
            <DialogHeader>
              <DialogTitle>Unarchive All Episodes</DialogTitle>
              <DialogDescription className="text-zinc-400">
                Are you sure you want to unarchive all episodes? They will be moved back to your active list.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="gap-2">
              <Button variant="ghost" onClick={() => setIsUnarchiveAllDialogOpen(false)} className="text-zinc-400 hover:text-white">
                Cancel
              </Button>
              <Button onClick={handleUnarchiveAll} disabled={isProcessing} className="bg-green-600 hover:bg-green-700 text-white">
                Unarchive All
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}

export default function ArchivedEpisodesPage() {
  return (
    <Suspense fallback={
      <Layout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            {/* Header placeholder */}
          </div>
        </div>
      </Layout>
    }>
      <ArchivedEpisodesContent />
    </Suspense>
  );
}
