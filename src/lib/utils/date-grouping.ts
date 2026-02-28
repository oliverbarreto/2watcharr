import { MediaEpisode } from '@/lib/domain/models';
import { format, isToday, isYesterday, startOfDay, isSameWeek } from 'date-fns';

/**
 * Date-based sort fields that should trigger grouping
 */
export const DATE_SORT_FIELDS = ['date_added', 'date_watched', 'date_favorited', 'date_removed', 'archived_at'] as const;


/**
 * Grouped episodes structure
 */
export interface GroupedEpisodes {
  label: string;
  date: number | null; // Unix timestamp for sorting, null for "no date" groups
  episodes: MediaEpisode[];
}

/**
 * Check if the current sort field is date-based
 */
export function isDateBasedSort(sortField: string): boolean {
  return DATE_SORT_FIELDS.includes(sortField as typeof DATE_SORT_FIELDS[number]);
}

/**
 * Get the appropriate timestamp from an episode based on the sort field
 * For date-based sorts, use the specific timestamp
 * For non-date sorts, always use date_added for grouping
 */
export function getTimestampForSort(episode: MediaEpisode, sortField: string): number | undefined {
  switch (sortField) {
    case 'date_added':
      return episode.lastAddedAt;
    case 'date_watched':
      return episode.lastWatchedAt;
    case 'date_favorited':
      return episode.lastFavoritedAt;
    case 'date_removed':
      return episode.lastRemovedAt;
    case 'archived_at':
      return episode.archivedAt;
    default:
      return undefined;
  }
}


/**
 * Format a Unix timestamp into a user-friendly date label
 * Returns "today (Day Month Day, Year)", "yesterday (Day Month Day, Year)",
 * "Day Month Day, Year" (if within current week), or just "Month Day, Year"
 */
export function formatDateLabel(timestamp: number): string {
  const date = new Date(timestamp * 1000); // Convert Unix timestamp to milliseconds
  const now = new Date();
  
  const dayName = format(date, 'eeee');
  const fullDate = format(date, 'MMMM d, yyyy');
  
  if (isToday(date)) {
    return `today (${dayName} ${fullDate})`;
  }
  
  if (isYesterday(date)) {
    return `yesterday (${dayName} ${fullDate})`;
  }
  
  if (isSameWeek(date, now, { weekStartsOn: 1 })) {
    return `${dayName} ${fullDate}`;
  }
  
  // Format as "Month Day, Year"
  return fullDate;
}

/**
 * Get a date key for grouping (strips time component)
 * Returns Unix timestamp of the start of the day
 */
function getDateKey(timestamp: number): number {
  const date = new Date(timestamp * 1000);
  return Math.floor(startOfDay(date).getTime() / 1000);
}

/**
 * Get label for episodes without a timestamp
 */
export function getNoDateLabel(sortField: string): string {
  switch (sortField) {
    case 'date_watched':
      return 'Not Yet Watched';
    case 'date_favorited':
      return 'Not Favorited';
    case 'date_removed':
      return 'Not Removed';
    case 'date_added':
      return 'No Date';
    case 'archived_at':
      return 'Not Archived';
    default:
      return 'All Episodes';
  }
}


/**
 * Group episodes by date based on the sort field
 * For date-based sorts, groups by the specific date field
 * For non-date sorts, groups by date_added
 * Episodes are assumed to be already sorted by the appropriate field
 * @param sortOrder - 'asc' or 'desc' to control section and episode ordering
 */
export function groupEpisodesByDate(
  episodes: MediaEpisode[],
  sortField: string,
  sortOrder: 'asc' | 'desc' = 'desc'
): GroupedEpisodes[] {
  const groups: GroupedEpisodes[] = [];
  const episodesWithoutDate: MediaEpisode[] = [];

  for (const episode of episodes) {
    const timestamp = getTimestampForSort(episode, sortField);
    
    // Handle episodes without a timestamp
    if (timestamp === undefined || timestamp === null) {
      episodesWithoutDate.push(episode);
      continue;
    }

    // Get the date key (start of day)
    const dateKey = getDateKey(timestamp);
    
    // Check if we already have a group for this date
    let group = groups.find(g => g.date === dateKey);
    
    if (!group) {
      // Create a new group
      group = {
        label: formatDateLabel(timestamp),
        date: dateKey,
        episodes: [],
      };
      groups.push(group);
    }
    
    group.episodes.push(episode);
  }

  // Sort groups by date based on sort order
  groups.sort((a, b) => {
    if (a.date === null) return 1;
    if (b.date === null) return -1;
    // For desc (default), most recent first (b.date - a.date)
    // For asc, oldest first (a.date - b.date)
    return sortOrder === 'desc' ? b.date - a.date : a.date - b.date;
  });

  // Add episodes without dates at the end
  if (episodesWithoutDate.length > 0) {
    groups.push({
      label: getNoDateLabel(sortField),
      date: null,
      episodes: episodesWithoutDate,
    });
  }

  return groups;
}
