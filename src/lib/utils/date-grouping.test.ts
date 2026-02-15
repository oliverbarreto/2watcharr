import { describe, it, expect } from 'vitest';
import {
  isDateBasedSort,
  getTimestampForSort,
  formatDateLabel,
  getNoDateLabel,
  groupEpisodesByDate,
} from './date-grouping';
import { MediaEpisode } from '@/lib/domain/models';

// Helper to create a mock episode
function createMockEpisode(overrides: Partial<MediaEpisode> = {}): MediaEpisode {
  return {
    id: 'test-id',
    type: 'video',
    externalId: 'ext-123',
    title: 'Test Episode',
    description: null,
    duration: null,
    thumbnailUrl: null,
    url: 'https://example.com',
    uploadDate: null,
    publishedDate: null,
    viewCount: null,
    channelId: 'channel-1',
    watched: false,
    watchStatus: 'unwatched',
    favorite: false,
    isDeleted: false,
    priority: 'none',
    customOrder: null,
    userId: 'user-1',
    createdAt: Date.now() / 1000,
    updatedAt: Date.now() / 1000,
    ...overrides,
  };
}

describe('date-grouping utilities', () => {
  describe('isDateBasedSort', () => {
    it('should return true for date-based sort fields', () => {
      expect(isDateBasedSort('date_added')).toBe(true);
      expect(isDateBasedSort('date_watched')).toBe(true);
      expect(isDateBasedSort('date_favorited')).toBe(true);
      expect(isDateBasedSort('date_removed')).toBe(true);
    });

    it('should return false for non-date sort fields', () => {
      expect(isDateBasedSort('custom')).toBe(false);
      expect(isDateBasedSort('priority')).toBe(false);
      expect(isDateBasedSort('favorite')).toBe(false);
      expect(isDateBasedSort('duration')).toBe(false);
      expect(isDateBasedSort('title')).toBe(false);
      expect(isDateBasedSort('created_at')).toBe(false);
    });
  });

  describe('getTimestampForSort', () => {
    const episode = createMockEpisode({
      lastAddedAt: 1000,
      lastWatchedAt: 2000,
      lastFavoritedAt: 3000,
      lastRemovedAt: 4000,
    });

    it('should return correct timestamp for date_added', () => {
      expect(getTimestampForSort(episode, 'date_added')).toBe(1000);
    });

    it('should return correct timestamp for date_watched', () => {
      expect(getTimestampForSort(episode, 'date_watched')).toBe(2000);
    });

    it('should return correct timestamp for date_favorited', () => {
      expect(getTimestampForSort(episode, 'date_favorited')).toBe(3000);
    });

    it('should return correct timestamp for date_removed', () => {
      expect(getTimestampForSort(episode, 'date_removed')).toBe(4000);
    });

    it('should return undefined for non-date sort fields', () => {
      expect(getTimestampForSort(episode, 'priority')).toBeUndefined();
      expect(getTimestampForSort(episode, 'custom')).toBeUndefined();
    });

    it('should return undefined for missing timestamps', () => {
      const episodeWithoutDates = createMockEpisode();
      expect(getTimestampForSort(episodeWithoutDates, 'date_watched')).toBeUndefined();
    });
  });

  describe('formatDateLabel', () => {
    it('should return "Today" for today\'s date', () => {
      const now = Math.floor(Date.now() / 1000);
      expect(formatDateLabel(now)).toBe('Today');
    });

    it('should return "Yesterday" for yesterday\'s date', () => {
      const yesterday = Math.floor((Date.now() - 24 * 60 * 60 * 1000) / 1000);
      expect(formatDateLabel(yesterday)).toBe('Yesterday');
    });

    it('should return formatted date for older dates', () => {
      // Use a date 7 days ago to avoid timezone issues
      const sevenDaysAgo = Math.floor((Date.now() - 7 * 24 * 60 * 60 * 1000) / 1000);
      const label = formatDateLabel(sevenDaysAgo);
      // Should not be "Today" or "Yesterday"
      expect(label).not.toBe('Today');
      expect(label).not.toBe('Yesterday');
      // Should contain a month name and year
      expect(label).toMatch(/\w+ \d+, \d{4}/);
    });
  });

  describe('getNoDateLabel', () => {
    it('should return appropriate labels for each sort field', () => {
      expect(getNoDateLabel('date_watched')).toBe('Not Yet Watched');
      expect(getNoDateLabel('date_favorited')).toBe('Not Favorited');
      expect(getNoDateLabel('date_removed')).toBe('Not Removed');
      expect(getNoDateLabel('date_added')).toBe('No Date');
    });
  });

  describe('groupEpisodesByDate', () => {
    it('should return single group for non-date sort', () => {
      const episodes = [
        createMockEpisode({ id: '1', title: 'Episode 1' }),
        createMockEpisode({ id: '2', title: 'Episode 2' }),
      ];

      const groups = groupEpisodesByDate(episodes, 'priority');
      
      expect(groups).toHaveLength(1);
      expect(groups[0].label).toBe('All Episodes');
      expect(groups[0].episodes).toHaveLength(2);
    });

    it('should group episodes by date correctly', () => {
      const today = Math.floor(Date.now() / 1000);
      const yesterday = Math.floor((Date.now() - 24 * 60 * 60 * 1000) / 1000);
      const twoDaysAgo = Math.floor((Date.now() - 48 * 60 * 60 * 1000) / 1000);

      const episodes = [
        createMockEpisode({ id: '1', lastAddedAt: today }),
        createMockEpisode({ id: '2', lastAddedAt: today }),
        createMockEpisode({ id: '3', lastAddedAt: yesterday }),
        createMockEpisode({ id: '4', lastAddedAt: twoDaysAgo }),
      ];

      const groups = groupEpisodesByDate(episodes, 'date_added');
      
      expect(groups).toHaveLength(3);
      expect(groups[0].label).toBe('Today');
      expect(groups[0].episodes).toHaveLength(2);
      expect(groups[1].label).toBe('Yesterday');
      expect(groups[1].episodes).toHaveLength(1);
      expect(groups[2].episodes).toHaveLength(1);
    });

    it('should handle episodes without timestamps', () => {
      const today = Math.floor(Date.now() / 1000);
      
      const episodes = [
        createMockEpisode({ id: '1', lastWatchedAt: today }),
        createMockEpisode({ id: '2', lastWatchedAt: undefined }),
        createMockEpisode({ id: '3', lastWatchedAt: undefined }),
      ];

      const groups = groupEpisodesByDate(episodes, 'date_watched');
      
      expect(groups).toHaveLength(2);
      expect(groups[0].label).toBe('Today');
      expect(groups[0].episodes).toHaveLength(1);
      expect(groups[1].label).toBe('Not Yet Watched');
      expect(groups[1].episodes).toHaveLength(2);
    });

    it('should handle empty episode list', () => {
      const groups = groupEpisodesByDate([], 'date_added');
      expect(groups).toHaveLength(0);
    });

    it('should handle all episodes without dates', () => {
      const episodes = [
        createMockEpisode({ id: '1' }),
        createMockEpisode({ id: '2' }),
      ];

      const groups = groupEpisodesByDate(episodes, 'date_watched');
      
      expect(groups).toHaveLength(1);
      expect(groups[0].label).toBe('Not Yet Watched');
      expect(groups[0].episodes).toHaveLength(2);
    });

    it('should group episodes on the same day together', () => {
      const morning = Math.floor(new Date('2026-02-03T08:00:00Z').getTime() / 1000);
      const afternoon = Math.floor(new Date('2026-02-03T16:00:00Z').getTime() / 1000);
      const evening = Math.floor(new Date('2026-02-03T22:00:00Z').getTime() / 1000);

      const episodes = [
        createMockEpisode({ id: '1', lastAddedAt: morning }),
        createMockEpisode({ id: '2', lastAddedAt: afternoon }),
        createMockEpisode({ id: '3', lastAddedAt: evening }),
      ];

      const groups = groupEpisodesByDate(episodes, 'date_added');
      
      expect(groups).toHaveLength(1);
      expect(groups[0].episodes).toHaveLength(3);
    });
  });
});
