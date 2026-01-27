// Domain models for 2watcharr

export type Priority = 'none' | 'low' | 'medium' | 'high';

export interface Video {
    id: string;
    youtubeId: string;
    title: string;
    description: string | null;
    duration: number | null;
    thumbnailUrl: string | null;
    videoUrl: string;
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
}

export interface Channel {
    id: string;
    name: string;
    description: string | null;
    thumbnailUrl: string | null;
    channelUrl: string;
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

export interface VideoTag {
    videoId: string;
    tagId: string;
    createdAt: number;
}

// DTOs for creating/updating entities

export interface CreateVideoDto {
    youtubeId: string;
    title: string;
    description?: string;
    duration?: number;
    thumbnailUrl?: string;
    videoUrl: string;
    uploadDate?: string;
    publishedDate?: string;
    viewCount?: number;
    channelId: string;
    userId?: string;
}

export interface UpdateVideoDto {
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
    name: string;
    description?: string;
    thumbnailUrl?: string;
    channelUrl: string;
}

export interface CreateTagDto {
    name: string;
    color?: string;
    userId?: string;
}

// Filter and sort options

export interface VideoFilters {
    tagIds?: string[];
    search?: string;
    watched?: boolean;
    favorite?: boolean;
    channelId?: string;
    isDeleted?: boolean;
}

export type SortField = 'created_at' | 'priority' | 'favorite' | 'duration' | 'title' | 'custom';
export type SortOrder = 'asc' | 'desc';

export interface SortOptions {
    field: SortField;
    order: SortOrder;
}
