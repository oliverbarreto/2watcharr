'use client';

import { MediaEpisode } from '@/lib/domain/models';
import { EpisodeCard } from './episode-card';
import { EpisodeListRow } from './episode-list-row';
import { groupEpisodesByDate } from '@/lib/utils/date-grouping';
import { Calendar } from 'lucide-react';

interface GroupedEpisodeListProps {
  episodes: MediaEpisode[];
  sortField: string;
  sortOrder?: 'asc' | 'desc';
  viewMode: 'grid' | 'list';
  onUpdate?: () => void;
  onDelete?: () => void;
}

export function GroupedEpisodeList({
  episodes,
  sortField,
  sortOrder = 'desc',
  viewMode,
  onUpdate,
  onDelete,
}: GroupedEpisodeListProps) {
  const groups = groupEpisodesByDate(episodes, sortField, sortOrder);

  return (
    <div className="space-y-6">
      {groups.map((group, groupIndex) => (
        <div key={`${group.label}-${groupIndex}`} className="space-y-3">
          {/* Date Section Header */}
          <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b pb-2">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <h2 className="text-lg font-semibold text-foreground">
                {group.label}
              </h2>
              <span className="text-sm text-muted-foreground">
                ({group.episodes.length} {group.episodes.length === 1 ? 'episode' : 'episodes'})
              </span>
            </div>
          </div>

          {/* Episodes in this group */}
          <div
            className={
              viewMode === 'grid'
                ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'
                : 'flex flex-col border rounded-md overflow-hidden bg-card/50'
            }
          >
            {group.episodes.map((episode) =>
              viewMode === 'grid' ? (
                <EpisodeCard
                  key={episode.id}
                  episode={episode}
                  onUpdate={onUpdate}
                  onDelete={onDelete}
                />
              ) : (
                <EpisodeListRow
                  key={episode.id}
                  episode={episode}
                  onUpdate={onUpdate}
                  onDelete={onDelete}
                />
              )
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
