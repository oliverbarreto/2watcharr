'use client';

import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Trash2, RefreshCw, Youtube, Mic, GripVertical } from 'lucide-react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface Tag {
    id: string;
    name: string;
    color: string | null;
}

interface Channel {
    id: string;
    type: 'video' | 'podcast';
    name: string;
    description: string | null;
    thumbnailUrl: string | null;
    url: string;
    episodeCount: number;
    tags?: Tag[];
    customOrder: number | null;
}

interface ChannelListRowProps {
    channel: Channel;
    isSyncing: boolean;
    onDelete: (channel: Channel) => void;
    onSync: (channelId: string, channelUrl: string) => void;
    isDraggable?: boolean;
}

export function ChannelListRow({ channel, isSyncing, onDelete, onSync, isDraggable = true }: ChannelListRowProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ 
        id: channel.id,
        disabled: !isDraggable
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 50 : 'auto',
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`group relative w-full border-b last:border-b-0 hover:bg-accent/30 transition-colors ${isDragging ? 'opacity-50 z-50' : ''}`}
        >
            <div className="flex items-center gap-2 sm:gap-3 p-2 cursor-default min-w-0">
                {/* Drag Handle */}
                {isDraggable && (
                    <div
                        {...attributes}
                        {...listeners}
                        className="flex-shrink-0 cursor-grab active:cursor-grabbing p-1 text-muted-foreground/50 hover:text-muted-foreground transition-colors"
                    >
                        <GripVertical className="h-4 w-4 sm:h-5 sm:w-5" />
                    </div>
                )}

                {/* Clickable Area (Thumbnail + Metadata) */}
                <div
                    className="flex-1 min-w-0 flex items-center gap-2 sm:gap-3 cursor-pointer"
                    onClick={() => {
                        window.location.href = `/channels/${channel.id}`;
                    }}
                >
                    {/* Thumbnail */}
                    <div className="relative w-28 xs:w-32 sm:w-48 aspect-video flex-shrink-0 rounded-md overflow-hidden bg-muted">
                        {channel.thumbnailUrl ? (
                            <Image
                                src={channel.thumbnailUrl}
                                alt={channel.name}
                                fill
                                className="object-cover"
                                unoptimized
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-muted-foreground text-3xl font-bold bg-accent/20">
                                {channel.name[0]}
                            </div>
                        )}
                        {/* Media Type Icon Overlay */}
                        <div className="absolute top-1 right-1 bg-black/60 rounded-full p-1">
                            {channel.type === 'podcast' ? (
                                <Mic className="h-3 w-3 text-white drop-shadow-md" />
                            ) : (
                                <Youtube className="h-3 w-3 text-white drop-shadow-md" />
                            )}
                        </div>
                    </div>

                    {/* Info and Description Layout */}
                    <div className="flex-1 min-w-0 flex flex-col lg:flex-row lg:items-center gap-2 lg:gap-8">
                        {/* Metadata Column */}
                        <div className="flex flex-col gap-0.5 sm:gap-1 lg:w-[250px] xl:w-[350px] flex-shrink-0">
                            <div className="flex items-center gap-2">
                                <h3 className="font-bold text-sm sm:text-base line-clamp-1 hover:text-red-600 transition-colors">
                                    {channel.name}
                                </h3>
                            </div>

                            <div className="flex items-center gap-2 text-[10px] sm:text-xs text-muted-foreground">
                                <span className="font-bold text-red-600">
                                    {channel.episodeCount} {channel.episodeCount === 1 ? 'episode' : 'episodes'}
                                </span>
                                <span>•</span>
                                <span className="capitalize">{channel.type}</span>
                            </div>

                            {/* Tags */}
                            {channel.tags && channel.tags.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-1">
                                    {channel.tags.map((tag) => (
                                        <Badge
                                            key={tag.id}
                                            variant="outline"
                                            className="text-[9px] sm:text-[10px] px-1.5 sm:px-2 py-0 h-3.5 sm:h-4 rounded-full border-none font-medium"
                                            style={tag.color ? {
                                                backgroundColor: `${tag.color}15`,
                                                color: tag.color,
                                                borderColor: `${tag.color}40`,
                                                borderWidth: '1px'
                                            } : {
                                                backgroundColor: 'rgba(156, 163, 175, 0.1)',
                                                color: '#9ca3af',
                                                borderColor: 'rgba(156, 163, 175, 0.2)',
                                                borderWidth: '1px'
                                            }}
                                        >
                                            {tag.name}
                                        </Badge>
                                    ))}
                                </div>
                            )}
                        </div>
                        
                        {/* Description Column (Visible on all, but split on lg) */}
                        {channel.description && channel.description !== "No description available. Sync metadata to refresh." && (
                            <div className="flex-1 min-w-0">
                                <p className="text-[11px] sm:text-xs text-muted-foreground line-clamp-2 lg:line-clamp-4 leading-relaxed lg:max-w-4xl">
                                    {channel.description}
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 pr-1">
                    <Button
                        size="icon"
                        variant="ghost"
                        className="h-9 w-9 text-muted-foreground hover:text-foreground hover:bg-accent/50"
                        onClick={(e) => {
                            e.stopPropagation();
                            onSync(channel.id, channel.url);
                        }}
                        disabled={isSyncing}
                        title="Sync Metadata"
                    >
                        <RefreshCw className={`h-4 w-4 ${isSyncing ? 'animate-spin' : ''}`} />
                    </Button>

                    <Button
                        size="icon"
                        variant="ghost"
                        className="h-9 w-9 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                        onClick={(e) => {
                            e.stopPropagation();
                            onDelete(channel);
                        }}
                        title="Delete Source"
                    >
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </div>
    );
}
