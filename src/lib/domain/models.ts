// Domain models for 2watcharr

export type Priority = 'none' | 'low' | 'medium' | 'high';
export type MediaType = 'video' | 'podcast';

export type MediaEventType = 'added' | 'watched' | 'unwatched' | 'favorited' | 'unfavorited' | 'removed' | 'restored';

export interface MediaEvent {
    id: string;
    episodeId: string;
    type: MediaEventType;
    createdAt: number;
}

export interface MediaEpisode {
    id: string;
    type: MediaType;
    externalId: string;              // YouTube ID or Podcast ID
    title: string;
    description: string | null;
    duration: number | null;
    thumbnailUrl: string | null;
    url: string;                     // Video URL or Podcast Episode URL
    uploadDate: string | null;
    publishedDate: string | null;
    viewCount: number | null;
    channelId: string;
    channelName?: string;
    watched: boolean;
    favorite: boolean;
    isDeleted: boolean;
    priority: Priority;
    customOrder: number | null;
    userId: string | null;
    tags?: Tag[];
    createdAt: number;
    updatedAt: number;
    // Event timestamps
    lastAddedAt?: number;
    lastWatchedAt?: number;
    lastFavoritedAt?: number;
    lastRemovedAt?: number;
}

export interface Channel {
    id: string;
    type: MediaType;
    name: string;
    description: string | null;
    thumbnailUrl: string | null;
    url: string;
    createdAt: number;
    updatedAt: number;
}

export interface Tag {
    id: string;
    name: string;
    color: string | null;
    userId: string | null;
    createdAt: number;
}

export interface EpisodeTag {
    episodeId: string;
    tagId: string;
    createdAt: number;
}

// DTOs for creating/updating entities

export interface CreateEpisodeDto {
    type: MediaType;
    externalId: string;
    title: string;
    description?: string;
    duration?: number;
    thumbnailUrl?: string;
    url: string;
    uploadDate?: string;
    publishedDate?: string;
    viewCount?: number;
    channelId: string;
    userId?: string;
}

export interface UpdateEpisodeDto {
    title?: string;
    description?: string;
    watched?: boolean;
    favorite?: boolean;
    isDeleted?: boolean;
    priority?: Priority;
    customOrder?: number;
    viewCount?: number;
    tagIds?: string[];
}

export interface CreateChannelDto {
    id: string;
    type: MediaType;
    name: string;
    description?: string;
    thumbnailUrl?: string;
    thumbnail_url?: string;
    url: string;
}

export interface CreateTagDto {
    name: string;
    color?: string;
    userId?: string;
}

// Filter and sort options

export interface EpisodeFilters {
    type?: MediaType;
    tagIds?: string[];
    search?: string;
    watched?: boolean;
    favorite?: boolean;
    channelId?: string;
    isDeleted?: boolean;
}

export type SortField = 'created_at' | 'priority' | 'favorite' | 'duration' | 'title' | 'custom' | 'date_added' | 'date_watched' | 'date_favorited' | 'date_removed';
export type SortOrder = 'asc' | 'desc';

export interface SortOptions {
    field: SortField;
    order: SortOrder;
}

export interface ChannelFilters {
    search?: string;
    tagIds?: string[];
    type?: MediaType;
}
