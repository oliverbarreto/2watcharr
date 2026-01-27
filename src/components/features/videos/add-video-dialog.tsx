'use client';

import { useState } from 'react';
import { Plus, Check, Tag as TagIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from '@/components/ui/badge';
import { Tag } from '@/lib/domain/models';
import { useEffect } from 'react';
import { toast } from 'sonner';

interface AddVideoDialogProps {
    onVideoAdded?: () => void;
    trigger?: React.ReactNode;
}

export function AddVideoDialog({ onVideoAdded, trigger }: AddVideoDialogProps) {
    const [open, setOpen] = useState(false);
    const [url, setUrl] = useState('');
    const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
    const [availableTags, setAvailableTags] = useState<Tag[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (open) {
            const fetchTags = async () => {
                try {
                    const response = await fetch('/api/tags');
                    const data = await response.json();
                    if (data.tags) {
                        setAvailableTags(data.tags);
                    }
                } catch (error) {
                    console.error('Error fetching tags:', error);
                }
            };
            fetchTags();
        }
    }, [open]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!url.trim()) {
            toast.error('Please enter a YouTube URL');
            return;
        }

        setLoading(true);

        try {
            const response = await fetch('/api/videos', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url, tagIds: selectedTagIds }),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to add video');
            }

            const video = await response.json();
            toast.success(`Added: ${video.title}`);
            setUrl('');
            setSelectedTagIds([]);
            setOpen(false);
            onVideoAdded?.();
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Failed to add video');
        } finally {
            setLoading(false);
        }
    };

    const defaultTrigger = (
        <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Video
        </Button>
    );

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <DialogTrigger asChild>
                            {trigger || defaultTrigger}
                        </DialogTrigger>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>Add New Video</p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>

            <DialogContent>
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>Add YouTube Video</DialogTitle>
                        <DialogDescription>
                            Paste a YouTube URL to add it to your watch later list
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="url">YouTube URL</Label>
                            <Input
                                id="url"
                                type="url"
                                placeholder="https://youtube.com/watch?v=..."
                                value={url}
                                onChange={(e) => setUrl(e.target.value)}
                                disabled={loading}
                            />
                        </div>

                        {availableTags.length > 0 && (
                            <div className="grid gap-2">
                                <Label className="flex items-center gap-2">
                                    <TagIcon className="h-4 w-4" />
                                    Tags (Optional)
                                </Label>
                                <div className="flex flex-wrap gap-2 pt-1">
                                    {availableTags.map((tag) => {
                                        const isSelected = selectedTagIds.includes(tag.id);
                                        return (
                                            <Badge
                                                key={tag.id}
                                                variant={isSelected ? "default" : "outline"}
                                                className="cursor-pointer transition-all px-3 py-1"
                                                style={{
                                                    backgroundColor: isSelected ? tag.color || undefined : `${tag.color}15`,
                                                    color: isSelected ? '#fff' : tag.color || 'inherit',
                                                    borderColor: isSelected ? tag.color || undefined : `${tag.color}40`,
                                                }}
                                                onClick={() => {
                                                    setSelectedTagIds(prev =>
                                                        isSelected
                                                            ? prev.filter(id => id !== tag.id)
                                                            : [...prev, tag.id]
                                                    );
                                                }}
                                            >
                                                {isSelected && <Check className="h-3 w-3 mr-1" />}
                                                {tag.name}
                                            </Badge>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={loading}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading ? 'Adding...' : 'Add Video'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
