'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Trash2, Edit2, Check, X } from 'lucide-react';
import { toast } from 'sonner';
import { Layout } from '@/components/layout';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { UserManagement } from '@/components/features/users/user-management';

interface Tag {
    id: string;
    name: string;
    color: string | null;
    episodeCount: number;
}

export default function SettingsPage() {
    const { data: session } = useSession();
    const isAdmin = (session?.user as any)?.isAdmin;
    
    const [tags, setTags] = useState<Tag[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [newTagName, setNewTagName] = useState('');
    const [newTagColor, setNewTagColor] = useState('#ef4444');
    const [editingTag, setEditingTag] = useState<string | null>(null);
    const [editName, setEditName] = useState('');
    const [editColor, setEditColor] = useState('');
    const [defaultView, setDefaultView] = useState<'grid' | 'list'>('list');
    const [watchAction, setWatchAction] = useState<'none' | 'watched' | 'pending'>('pending');

    useEffect(() => {
        fetchTags();
        const savedDefaultView = localStorage.getItem('defaultView') as 'grid' | 'list';
        if (savedDefaultView) {
            setDefaultView(savedDefaultView);
        }
        const savedWatchAction = localStorage.getItem('watchAction') as 'none' | 'watched' | 'pending';
        if (savedWatchAction) {
            setWatchAction(savedWatchAction);
        }
    }, []);

    const fetchTags = async () => {
        setIsLoading(true);
        try {
            const response = await fetch('/api/tags');
            const data = await response.json();
            if (data.tags) {
                setTags(data.tags);
            }
        } catch (error) {
            console.error('Error fetching tags:', error);
            toast.error('Failed to load tags');
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreateTag = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newTagName.trim()) return;

        try {
            const response = await fetch('/api/tags', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: newTagName, color: newTagColor }),
            });

            if (response.ok) {
                setNewTagName('');
                setNewTagColor('#ef4444');
                fetchTags();
                toast.success('Tag created successfully');
            } else {
                const error = await response.json();
                toast.error(error.error || 'Failed to create tag');
            }
        } catch (error) {
            console.error('Error creating tag:', error);
            toast.error('Failed to create tag');
        }
    };

    const handleDeleteTag = async (id: string) => {
        if (!confirm('Are you sure you want to delete this tag? This will remove it from all episodes.')) {
            return;
        }

        try {
            const response = await fetch(`/api/tags/${id}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                fetchTags();
                toast.success('Tag deleted successfully');
            } else {
                toast.error('Failed to delete tag');
            }
        } catch (error) {
            console.error('Error deleting tag:', error);
            toast.error('Failed to delete tag');
        }
    };

    const startEditing = (tag: Tag) => {
        setEditingTag(tag.id);
        setEditName(tag.name);
        setEditColor(tag.color || '#ef4444');
    };

    const cancelEditing = () => {
        setEditingTag(null);
    };

    const handleUpdateTag = async (id: string) => {
        if (!editName.trim()) return;

        try {
            const response = await fetch(`/api/tags/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: editName, color: editColor }),
            });

            if (response.ok) {
                setEditingTag(null);
                fetchTags();
                toast.success('Tag updated successfully');
            } else {
                toast.error('Failed to update tag');
            }
        } catch (error) {
            console.error('Error updating tag:', error);
            toast.error('Failed to update tag');
        }
    };

    const handleDefaultViewChange = (value: 'grid' | 'list') => {
        setDefaultView(value);
        localStorage.setItem('defaultView', value);
        localStorage.setItem('episodeViewMode', value);
        toast.success(`Default view set to ${value === 'grid' ? 'Grid' : 'List'}`);
    };

    const handleWatchActionChange = (value: 'none' | 'watched' | 'pending') => {
        setWatchAction(value);
        localStorage.setItem('watchAction', value);
        toast.success(`Watch action set to ${value === 'none' ? 'None' : value === 'watched' ? 'Mark as Watched' : 'Mark as Pending'}`);
    };

    return (
        <Layout>
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold mb-8">Settings</h1>

                <Tabs defaultValue="tags" className="w-full">
                    <TabsList className="mb-8">
                        <TabsTrigger value="tags">Tags Management</TabsTrigger>
                        <TabsTrigger value="general">General</TabsTrigger>
                        {isAdmin && <TabsTrigger value="users">User Management</TabsTrigger>}
                    </TabsList>

                    <TabsContent value="tags">
                        <div className="grid gap-8">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Create New Tag</CardTitle>
                                    <CardDescription>
                                        Add a new tag to organize your content.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <form onSubmit={handleCreateTag} className="flex flex-col md:flex-row gap-4 items-end">
                                        <div className="grid w-full items-center gap-1.5 flex-1">
                                            <Label htmlFor="tagName">Tag Name</Label>
                                            <Input
                                                type="text"
                                                id="tagName"
                                                placeholder="e.g. Coding, Music, Tech"
                                                value={newTagName}
                                                onChange={(e) => setNewTagName(e.target.value)}
                                            />
                                        </div>
                                        <div className="grid items-center gap-1.5 min-w-[120px]">
                                            <Label htmlFor="tagColor">Color</Label>
                                            <div className="flex gap-2 items-center h-10 px-3 py-2 border rounded-md">
                                                <input
                                                    type="color"
                                                    id="tagColor"
                                                    className="w-6 h-6 border-none bg-transparent cursor-pointer"
                                                    value={newTagColor}
                                                    onChange={(e) => setNewTagColor(e.target.value)}
                                                />
                                                <span className="text-sm font-mono uppercase">{newTagColor}</span>
                                            </div>
                                        </div>
                                        <Button type="submit" disabled={!newTagName.trim()}>
                                            <Plus className="h-4 w-4 mr-2" />
                                            Add Tag
                                        </Button>
                                    </form>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Existing Tags</CardTitle>
                                    <CardDescription>
                                        Manage your existing tags and see how many episodes use them.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    {isLoading ? (
                                        <div className="flex justify-center py-8">
                                            <span className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></span>
                                        </div>
                                    ) : tags.length === 0 ? (
                                        <div className="text-center py-8 text-muted-foreground italic">
                                            No tags created yet.
                                        </div>
                                    ) : (
                                        <div className="grid gap-2">
                                            {tags.map((tag) => (
                                                <div
                                                    key={tag.id}
                                                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                                                >
                                                    {editingTag === tag.id ? (
                                                        <div className="flex-1 flex gap-4 items-center">
                                                            <Input
                                                                value={editName}
                                                                onChange={(e) => setEditName(e.target.value)}
                                                                className="h-8 max-w-[200px]"
                                                                autoFocus
                                                            />
                                                            <input
                                                                type="color"
                                                                value={editColor}
                                                                onChange={(e) => setEditColor(e.target.value)}
                                                                className="w-8 h-8 rounded cursor-pointer"
                                                            />
                                                            <div className="flex gap-1 ml-auto">
                                                                <Button
                                                                    size="icon"
                                                                    variant="ghost"
                                                                    className="h-8 w-8 text-green-600"
                                                                    onClick={() => handleUpdateTag(tag.id)}
                                                                >
                                                                    <Check className="h-4 w-4" />
                                                                </Button>
                                                                <Button
                                                                    size="icon"
                                                                    variant="ghost"
                                                                    className="h-8 w-8 text-red-600"
                                                                    onClick={cancelEditing}
                                                                >
                                                                    <X className="h-4 w-4" />
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <>
                                                            <div className="flex items-center gap-3">
                                                                <div
                                                                    className="w-4 h-4 rounded-full"
                                                                    style={{ backgroundColor: tag.color || '#94a3b8' }}
                                                                />
                                                                <span className="font-medium">{tag.name}</span>
                                                                <span className="text-xs bg-muted px-2 py-0.5 rounded-full text-muted-foreground">
                                                                    {tag.episodeCount} episodes
                                                                </span>
                                                            </div>
                                                            <div className="flex gap-1">
                                                                <Button
                                                                    size="icon"
                                                                    variant="ghost"
                                                                    className="h-8 w-8"
                                                                    onClick={() => startEditing(tag)}
                                                                >
                                                                    <Edit2 className="h-4 w-4" />
                                                                </Button>
                                                                <Button
                                                                    size="icon"
                                                                    variant="ghost"
                                                                    className="h-8 w-8 text-destructive"
                                                                    onClick={() => handleDeleteTag(tag.id)}
                                                                >
                                                                    <Trash2 className="h-4 w-4" />
                                                                </Button>
                                                            </div>
                                                        </>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    <TabsContent value="general">
                        <Card>
                            <CardHeader>
                                <CardTitle>General Settings</CardTitle>
                                <CardDescription>
                                    Main application settings and preferences.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="space-y-2">
                                    <Label htmlFor="defaultView">Default View</Label>
                                    <p className="text-sm text-muted-foreground">
                                        Choose which view to use by default when loading the list.
                                    </p>
                                    <Select 
                                        value={defaultView} 
                                        onValueChange={(value) => handleDefaultViewChange(value as 'grid' | 'list')}
                                    >
                                        <SelectTrigger id="defaultView" className="w-[180px]">
                                            <SelectValue placeholder="Select view" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="grid">Grid View</SelectItem>
                                            <SelectItem value="list">List View</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="watchAction">Default Watch Action</Label>
                                    <p className="text-sm text-muted-foreground">
                                        Action to take when opening a video from the list.
                                    </p>
                                    <Select 
                                        value={watchAction} 
                                        onValueChange={(value) => handleWatchActionChange(value as 'none' | 'watched' | 'pending')}
                                    >
                                        <SelectTrigger id="watchAction" className="w-[180px]">
                                            <SelectValue placeholder="Select action" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="none">None</SelectItem>
                                            <SelectItem value="watched">Mark as Watched</SelectItem>
                                            <SelectItem value="pending">Mark as Pending</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {isAdmin && (
                        <TabsContent value="users">
                            <UserManagement />
                        </TabsContent>
                    )}
                </Tabs>
            </div>
        </Layout>
    );
}
