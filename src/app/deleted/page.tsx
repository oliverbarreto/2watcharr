'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { Layout } from '@/components/layout';
import { FilterBar, EpisodeList } from '@/components/features/episodes';
import { Button } from '@/components/ui/button';
import { List, LayoutGrid, ArrowLeft, RotateCcw, Trash2 } from 'lucide-react';
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
  isDeleted?: boolean;
  hasNotes?: boolean;
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

  const [isRestoreDialogOpen, setIsRestoreDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

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

  const handleRestoreAll = async () => {
    setIsProcessing(true);
    try {
      const response = await fetch('/api/episodes/restore-all', { method: 'POST' });
      if (response.ok) {
        toast.success('All episodes restored successfully');
        setRefreshKey((prev) => prev + 1);
      } else {
        toast.error('Failed to restore episodes');
      }
    } catch (error) {
      console.error('Error restoring episodes:', error);
      toast.error('Failed to restore episodes');
    } finally {
      setIsProcessing(false);
      setIsRestoreDialogOpen(false);
    }
  };

  const handleHardDeleteAll = async () => {
    setIsProcessing(true);
    try {
      const response = await fetch('/api/episodes/permanent-delete-all', { method: 'DELETE' });
      if (response.ok) {
        toast.success('All episodes permanently deleted');
        setRefreshKey((prev) => prev + 1);
      } else {
        toast.error('Failed to delete episodes');
      }
    } catch (error) {
      console.error('Error deleting episodes:', error);
      toast.error('Failed to delete episodes');
    } finally {
      setIsProcessing(false);
      setIsDeleteDialogOpen(false);
    }
  };

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
            <Button
              variant="outline"
              size="sm"
              className="gap-2 text-green-500 hover:text-green-600 hover:bg-green-500/10"
              onClick={() => setIsRestoreDialogOpen(true)}
              disabled={isProcessing}
            >
              <RotateCcw className="h-4 w-4" />
              Restore All
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="gap-2 text-destructive hover:bg-destructive/10"
              onClick={() => setIsDeleteDialogOpen(true)}
              disabled={isProcessing}
            >
              <Trash2 className="h-4 w-4" />
              Delete All
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

        {/* Restore All Confirmation */}
        <Dialog open={isRestoreDialogOpen} onOpenChange={setIsRestoreDialogOpen}>
          <DialogContent className="sm:max-w-[425px] bg-zinc-900 text-zinc-100 border-zinc-800">
            <DialogHeader>
              <DialogTitle>Restore All Episodes</DialogTitle>
              <DialogDescription className="text-zinc-400">
                Are you sure you want to restore all episodes? They will be moved back to your active list.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="gap-2">
              <Button variant="ghost" onClick={() => setIsRestoreDialogOpen(false)} className="text-zinc-400 hover:text-white">
                Cancel
              </Button>
              <Button onClick={handleRestoreAll} disabled={isProcessing} className="bg-green-600 hover:bg-green-700 text-white">
                Restore All
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete All Confirmation */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent className="sm:max-w-[425px] bg-zinc-900 text-zinc-100 border-zinc-800">
            <DialogHeader>
              <DialogTitle>Permanently Delete All</DialogTitle>
              <DialogDescription className="text-zinc-400">
                This action is irreversible. Are you sure you want to permanently delete ALL soft-deleted episodes?
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="gap-2">
              <Button variant="ghost" onClick={() => setIsDeleteDialogOpen(false)} className="text-zinc-400 hover:text-white">
                Cancel
              </Button>
              <Button onClick={handleHardDeleteAll} disabled={isProcessing} className="bg-red-600 hover:bg-red-700 text-white">
                Delete Everything
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
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
