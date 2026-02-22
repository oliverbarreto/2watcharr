'use client';

import { useState } from 'react';
import { Plus, Check, Tag as TagIcon, Clipboard } from 'lucide-react';
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

interface AddEpisodeDialogProps {
    onEpisodeAdded?: () => void;
    trigger?: React.ReactNode;
}

export function AddEpisodeDialog({ onEpisodeAdded, trigger }: AddEpisodeDialogProps) {
    const [open, setOpen] = useState(false);
    const [url, setUrl] = useState('');
    const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
    const [availableTags, setAvailableTags] = useState<Tag[]>([]);
    const [loading, setLoading] = useState(false);
    const [showTags, setShowTags] = useState(false);

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

    const handlePaste = async () => {
        try {
            const text = await navigator.clipboard.readText();
            if (text) {
                setUrl(text);
                toast.success('Pasted from clipboard');
            }
        } catch (error) {
            console.error('Failed to read clipboard:', error);
            toast.error('Failed to read clipboard. Please paste manually.');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!url.trim()) {
            toast.error('Please enter a URL');
            return;
        }

        setLoading(true);

        try {
            const response = await fetch('/api/episodes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url, tagIds: selectedTagIds }),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to add episode');
            }

            const episode = await response.json();
            toast.success(`Added: ${episode.title}`);
            setUrl('');
            setSelectedTagIds([]);
            setOpen(false);
            onEpisodeAdded?.();
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Failed to add episode');
        } finally {
            setLoading(false);
        }
    };

    const defaultTrigger = (
        <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add New
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
                        <p>Add Video or Podcast</p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>

            <DialogContent>
                <form onSubmit={handleSubmit}>
                    <DialogHeader className="flex flex-col items-center text-center">
                        {/* <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 mb-2">
                            <Plus className="h-6 w-6 text-primary" />
                        </div> */}
                        <DialogTitle>Add New Media</DialogTitle>
                        <DialogDescription>
                            Paste a YouTube or Podcast URL to add it to your list
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-8">
                        <div className="grid gap-2">
                            {/* <Label htmlFor="url">URL</Label> */}
                            <div className="flex gap-2 pb-3">
                                <Input
                                    id="url"
                                    type="url"
                                    placeholder="https://youtube.com/watch?v=... or Podcast RSS/Link"
                                    value={url}
                                    onChange={(e) => setUrl(e.target.value)}
                                    disabled={loading}
                                    className="flex-1"
                                    autoComplete="off"
                                    autoCorrect="off"
                                    spellCheck={false}
                                />
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="icon"
                                    onClick={handlePaste}
                                    title="Paste from clipboard"
                                    disabled={loading}
                                >
                                    <Clipboard className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>

                        {availableTags.length > 0 && (
                            <div className="grid gap-2">
                                {/* <div className="flex items-center justify-between">
                                    <Label className="flex items-center gap-2">
                                        <TagIcon className="h-4 w-4" />
                                        Tags (Optional)
                                    </Label>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        className="h-8 md:hidden"
                                        onClick={() => setShowTags(!showTags)}
                                    >
                                        {showTags ? 'Hide' : 'Add Tags'}
                                    </Button>
                                </div> */}
                                <div className={`${showTags ? 'flex' : 'hidden'} md:flex flex-wrap gap-2 pt-1`}>
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
                            {loading ? 'Adding...' : 'Add Media'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
