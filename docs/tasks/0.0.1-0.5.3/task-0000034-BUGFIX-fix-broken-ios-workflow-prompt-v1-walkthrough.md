# Walkthrough - API Token Authentication for iOS Shortcut

I have implemented a secure API Token authentication system to allow iOS Shortcuts to interact with **2watcharr** without requiring session cookies.

## Changes Made

### 1. Database Schema Update
Added an `api_token` column to the `users` table to store unique, per-user tokens for external API access.
- **Migration**: `add_api_token`
- **Schema**: Updated [schema.sql](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/lib/db/schema.sql)

### 2. API Token Management in Settings
Administrators can now view, copy, and regenerate API tokens for any user profile in the **Settings > User Management** tab.
- **Service**: Added [generateApiToken](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/lib/services/user.service.ts#125-133) to [UserService](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/lib/services/user.service.ts#7-134).
- **UI**: Updated [UserManagement.tsx](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/components/features/users/user-management.tsx) with a new API Token section for each user card.

### 3. Secure Shortcut API
The Shortcut API endpoints now support authentication via the `X-API-Token` header.
- **Endpoint**: `/api/shortcuts/add-episode` (and `/api/shortcuts/add-video`)
- **Logic**: If no active session is found, the server checks the `X-API-Token` header. If the token matches a valid user, the request is authorized on behalf of that user.

### 4. Updated Documentation
Updated [ios-shortcut-setup.md](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/docs/documentation/ios-shortcut-setup.md) with step-by-step instructions on how to:
1. Obtain the API token from Settings.
2. Add the `X-API-Token` header to the iOS Shortcut "Get Contents of URL" action.

## Verification Results

### Code Integrity
All layers (Database, Repository, Service, Action, UI, API) have been updated and are consistent with the new authentication model.

### Manual Verification Required
1. Go to **Settings > User Management**.
2. Regenerate an API token for your user if one isn't already present.
3. Copy the token.
4. Update your iOS Shortcut to include the header:
   - Key: `X-API-Token`
   - Value: [(Your Copied Token)](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/lib/auth.ts#42-51)
5. Run the shortcut. It should now successfully add episodes to your list with a `200 OK` response.

```diff:route.ts
import { NextRequest, NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { getDatabase } from '@/lib/db/database';
import { MediaService } from '@/lib/services';
import { TagRepository, UserRepository } from '@/lib/repositories';
import { z } from 'zod';

// Request validation schema
const addVideoSchema = z.object({
    url: z.string().url('Invalid URL'),
    tag: z.string().optional(), // Tag name (will be created if doesn't exist)
});

/**
 * POST /api/shortcuts/add-video - Add video from iOS Shortcut
 */
export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        let userId: string;

        const db = await getDatabase();
        if (session?.user) {
            userId = (session.user as { id: string }).id;
        } else {
            // Fallback for iOS Shortcut which might not have session cookies
            // We'll use the first available user (usually the main user in a personal setup)
            const userRepo = new UserRepository(db);
            const profiles = await userRepo.findAllProfiles();
            
            if (profiles.length > 0) {
                // Prefer the first admin, or just the first user
                const defaultUser = profiles.find((p: any) => p.isAdmin) || profiles[0];
                userId = defaultUser.id;
            } else {
                return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
            }
        }

        const body = await request.json();
        const { url, tag } = addVideoSchema.parse(body);

        const mediaService = new MediaService(db);
        const tagRepo = new TagRepository(db);

        let tagIds: string[] | undefined;

        // If tag name is provided, find or create it for THIS user
        if (tag) {
            let tagEntity = await tagRepo.findByName(tag, userId);
            if (!tagEntity) {
                tagEntity = await tagRepo.create({ name: tag, userId });
            }
            tagIds = [tagEntity.id];
        }

        // Add the episode
        const episode = await mediaService.addEpisodeFromUrl(url, userId, tagIds);

        return NextResponse.json({
            success: true,
            episode: {
                id: episode.id,
                title: episode.title,
                type: episode.type,
                channel: episode.channelId,
            },
        });
    } catch (error) {
        console.error('Error adding episode from shortcut:', error);

        if (error instanceof z.ZodError) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Invalid request data',
                    details: error.issues,
                },
                { status: 400 }
            );
        }

        if (error instanceof Error) {
            return NextResponse.json(
                {
                    success: false,
                    error: error.message,
                },
                { status: 400 }
            );
        }

        return NextResponse.json(
            {
                success: false,
                error: 'Failed to add episode',
            },
            { status: 500 }
        );
    }
}
===
import { NextRequest, NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { getDatabase } from '@/lib/db/database';
import { MediaService } from '@/lib/services';
import { TagRepository, UserRepository } from '@/lib/repositories';
import { z } from 'zod';

// Request validation schema
const addEpisodeSchema = z.object({
    url: z.string().url('Invalid URL'),
    tag: z.string().optional(), // Tag name (will be created if doesn't exist)
});

/**
 * POST /api/shortcuts/add-episode - Add episode from iOS Shortcut
 */
export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        let userId: string;

        const db = await getDatabase();
        const userRepo = new UserRepository(db);

        if (session?.user) {
            userId = (session.user as { id: string }).id;
        } else {
            // Check for API Token in headers
            const apiToken = request.headers.get('X-API-Token');
            if (apiToken) {
                const user = await userRepo.findByApiToken(apiToken);
                if (user) {
                    userId = user.id;
                } else {
                    return NextResponse.json({ success: false, error: 'Invalid API Token' }, { status: 401 });
                }
            } else {
                return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
            }
        }

        const body = await request.json();
        const { url, tag } = addEpisodeSchema.parse(body);

        const mediaService = new MediaService(db);
        const tagRepo = new TagRepository(db);

        let tagIds: string[] | undefined;

        // If tag name is provided, find or create it for THIS user
        if (tag) {
            let tagEntity = await tagRepo.findByName(tag, userId);
            if (!tagEntity) {
                tagEntity = await tagRepo.create({ name: tag, userId });
            }
            tagIds = [tagEntity.id];
        }

        // Add the episode
        const episode = await mediaService.addEpisodeFromUrl(url, userId, tagIds);

        return NextResponse.json({
            success: true,
            episode: {
                id: episode.id,
                title: episode.title,
                type: episode.type,
                channel: episode.channelId,
            },
        });
    } catch (error) {
        console.error('Error adding episode from shortcut:', error);

        if (error instanceof z.ZodError) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Invalid request data',
                    details: error.issues,
                },
                { status: 400 }
            );
        }

        if (error instanceof Error) {
            return NextResponse.json(
                {
                    success: false,
                    error: error.message,
                },
                { status: 400 }
            );
        }

        return NextResponse.json(
            {
                success: false,
                error: 'Failed to add episode',
            },
            { status: 500 }
        );
    }
}
```
```diff:user-management.tsx
"use client";

import { useEffect, useState } from "react";
import { getProfiles, createProfile, deleteProfile, updateProfile } from "@/lib/actions/user.actions";
import { UserProfile } from "@/lib/domain/models";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Pencil, Trash2, UserPlus } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";

export function UserManagement() {
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProfile, setEditingProfile] = useState<UserProfile | null>(null);
  
  // New user state
  const [newUsername, setNewUsername] = useState("");
  const [newDisplayName, setNewDisplayName] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newEmoji, setNewEmoji] = useState("👤");
  const [newColor, setNewColor] = useState("#3B82F6");
  const [newIsAdmin, setNewIsAdmin] = useState(false);

  useEffect(() => {
    fetchProfiles();
  }, []);

  const fetchProfiles = async () => {
    setLoading(true);
    try {
        const data = await getProfiles();
        setProfiles(data);
    } catch (error) {
        console.error("Failed to fetch profiles:", error);
        toast.error("Failed to load user profiles");
    } finally {
        setLoading(false);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingProfile) {
        // Update existing user
        const result = await updateProfile(editingProfile.id, {
            username: newUsername,
            displayName: newDisplayName || newUsername,
            password: newPassword || undefined,
            emoji: newEmoji,
            color: newColor,
            isAdmin: newIsAdmin,
        });

        if (result.success) {
            toast.success("User updated successfully");
            setIsDialogOpen(false);
            resetForm();
            setEditingProfile(null);
            fetchProfiles();
        } else {
            toast.error(result.error || "Failed to update user");
        }
    } else {
        // Create new user
        const result = await createProfile({
          username: newUsername,
          displayName: newDisplayName || newUsername,
          password: newPassword,
          emoji: newEmoji,
          color: newColor,
          isAdmin: newIsAdmin,
        });

        if (result.success) {
          toast.success("User created successfully");
          setIsDialogOpen(false);
          resetForm();
          fetchProfiles();
        } else {
          toast.error(result.error || "Failed to create user");
        }
    }
  };

  const handleEditUser = (profile: UserProfile) => {
    setEditingProfile(profile);
    setNewUsername(profile.username);
    setNewDisplayName(profile.displayName || "");
    setNewPassword(""); // Don't show current password
    setNewEmoji(profile.emoji || "👤");
    setNewColor(profile.color || "#3B82F6");
    setNewIsAdmin(profile.isAdmin);
    setIsDialogOpen(true);
  };

  const handleDeleteUser = async (id: string, username: string) => {
    if (username === 'admin') {
        toast.error("Cannot delete the default admin account");
        return;
    }
    if (!confirm(`Are you sure you want to delete user "${username}"? All their data (watchlist, tags) will be permanently lost.`)) {
      return;
    }

    const result = await deleteProfile(id);
    if (result.success) {
      toast.success("User deleted successfully");
      fetchProfiles();
    } else {
      toast.error(result.error || "Failed to delete user");
    }
  };

  const resetForm = () => {
    setNewUsername("");
    setNewDisplayName("");
    setNewPassword("");
    setNewEmoji("👤");
    setNewColor("#3B82F6");
    setNewIsAdmin(false);
    setEditingProfile(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Users & Profiles</h2>
          <p className="text-sm text-muted-foreground">Manage who can access the application and their profiles.</p>
        </div>
        <Dialog 
            open={isDialogOpen} 
            onOpenChange={(open) => {
                setIsDialogOpen(open);
                if (!open) resetForm();
            }}
        >
          <DialogTrigger asChild>
            <Button className="bg-red-600 hover:bg-red-700 text-white">
              <UserPlus className="mr-2 h-4 w-4" />
              Add User
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px] bg-zinc-900 text-zinc-100 border-zinc-800">
            <DialogHeader>
              <DialogTitle>{editingProfile ? 'Edit User' : 'Add New User'}</DialogTitle>
              <DialogDescription className="text-zinc-400">
                {editingProfile ? 'Update user profile details.' : 'Create a new profile with its own watchlist and tags.'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateUser} className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Username</Label>
                <Input
                  id="name"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  placeholder="johndoe"
                  className="bg-zinc-800 border-zinc-700 text-zinc-100"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="display">Display Name</Label>
                <Input
                  id="display"
                  value={newDisplayName}
                  onChange={(e) => setNewDisplayName(e.target.value)}
                  placeholder="John"
                  className="bg-zinc-800 border-zinc-700 text-zinc-100"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pass">Password {editingProfile && '(optional)'}</Label>
                <Input
                  id="pass"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder={editingProfile ? "Leave empty to keep current" : "••••••••"}
                  className="bg-zinc-800 border-zinc-700 text-zinc-100"
                  required={!editingProfile}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="em">Emoji</Label>
                  <Input
                    id="em"
                    value={newEmoji}
                    onChange={(e) => setNewEmoji(e.target.value)}
                    className="bg-zinc-800 border-zinc-700 text-zinc-100"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="col">Color</Label>
                  <Input
                    id="col"
                    type="color"
                    value={newColor}
                    onChange={(e) => setNewColor(e.target.value)}
                    className="h-10 w-full bg-zinc-800 border-zinc-700 p-1"
                  />
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="admin" 
                  checked={newIsAdmin} 
                  onCheckedChange={(checked) => setNewIsAdmin(checked as boolean)}
                  className="border-zinc-700 data-[state=checked]:bg-red-600"
                />
                <Label htmlFor="admin" className="text-sm font-medium cursor-pointer">Administrator (can manage users)</Label>
              </div>
              <DialogFooter className="pt-4">
                <Button type="submit" className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold">
                    {editingProfile ? 'Update Profile' : 'Create Profile'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {loading ? (
             Array.from({ length: 3 }).map((_, i) => (
                <Card key={i} className="animate-pulse bg-zinc-900 border-zinc-800 h-24" />
             ))
        ) : (
          profiles.map((profile) => (
            <Card key={profile.id} className="bg-zinc-900 border-zinc-800 text-zinc-100 hover:border-zinc-700 transition-colors">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 text-left">
                    <div 
                      className="flex h-12 w-12 items-center justify-center rounded-lg text-2xl shadow-inner shrink-0"
                      style={{ backgroundColor: profile.color || '#333' }}
                    >
                      {profile.emoji || '👤'}
                    </div>
                    <div className="min-w-0">
                      <div className="font-semibold truncate">{profile.displayName || profile.username}</div>
                      <div className="text-xs text-zinc-500 flex items-center gap-1">
                        <span className="truncate">@{profile.username}</span>
                        {profile.isAdmin && <span className="bg-red-900/30 text-red-500 px-1.5 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider shrink-0">Admin</span>}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button 
                        size="icon" 
                        variant="ghost" 
                        className="text-zinc-500 hover:text-white hover:bg-white/10 shrink-0"
                        onClick={() => handleEditUser(profile)}
                    >
                        <Pencil className="h-4 w-4" />
                    </Button>
                    <Button 
                        size="icon" 
                        variant="ghost" 
                        className="text-zinc-500 hover:text-red-500 hover:bg-red-500/10 shrink-0"
                        onClick={() => handleDeleteUser(profile.id, profile.username)}
                        disabled={profile.username === 'admin'}
                    >
                        <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
===
"use client";

import { useEffect, useState } from "react";
import { getProfiles, createProfile, deleteProfile, updateProfile, refreshApiToken } from "@/lib/actions/user.actions";
import { UserProfile } from "@/lib/domain/models";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Pencil, Trash2, UserPlus, Key, RefreshCw, Copy } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";

export function UserManagement() {
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProfile, setEditingProfile] = useState<UserProfile | null>(null);
  
  // New user state
  const [newUsername, setNewUsername] = useState("");
  const [newDisplayName, setNewDisplayName] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newEmoji, setNewEmoji] = useState("👤");
  const [newColor, setNewColor] = useState("#3B82F6");
  const [newIsAdmin, setNewIsAdmin] = useState(false);

  useEffect(() => {
    fetchProfiles();
  }, []);

  const fetchProfiles = async () => {
    setLoading(true);
    try {
        const data = await getProfiles();
        setProfiles(data);
    } catch (error) {
        console.error("Failed to fetch profiles:", error);
        toast.error("Failed to load user profiles");
    } finally {
        setLoading(false);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingProfile) {
        // Update existing user
        const result = await updateProfile(editingProfile.id, {
            username: newUsername,
            displayName: newDisplayName || newUsername,
            password: newPassword || undefined,
            emoji: newEmoji,
            color: newColor,
            isAdmin: newIsAdmin,
        });

        if (result.success) {
            toast.success("User updated successfully");
            setIsDialogOpen(false);
            resetForm();
            setEditingProfile(null);
            fetchProfiles();
        } else {
            toast.error(result.error || "Failed to update user");
        }
    } else {
        // Create new user
        const result = await createProfile({
          username: newUsername,
          displayName: newDisplayName || newUsername,
          password: newPassword,
          emoji: newEmoji,
          color: newColor,
          isAdmin: newIsAdmin,
        });

        if (result.success) {
          toast.success("User created successfully");
          setIsDialogOpen(false);
          resetForm();
          fetchProfiles();
        } else {
          toast.error(result.error || "Failed to create user");
        }
    }
  };

  const handleEditUser = (profile: UserProfile) => {
    setEditingProfile(profile);
    setNewUsername(profile.username);
    setNewDisplayName(profile.displayName || "");
    setNewPassword(""); // Don't show current password
    setNewEmoji(profile.emoji || "👤");
    setNewColor(profile.color || "#3B82F6");
    setNewIsAdmin(profile.isAdmin);
    setIsDialogOpen(true);
  };

  const handleDeleteUser = async (id: string, username: string) => {
    if (username === 'admin') {
        toast.error("Cannot delete the default admin account");
        return;
    }
    if (!confirm(`Are you sure you want to delete user "${username}"? All their data (watchlist, tags) will be permanently lost.`)) {
      return;
    }

    const result = await deleteProfile(id);
    if (result.success) {
      toast.success("User deleted successfully");
      fetchProfiles();
    } else {
      toast.error(result.error || "Failed to delete user");
    }
  };

  const resetForm = () => {
    setNewUsername("");
    setNewDisplayName("");
    setNewPassword("");
    setNewEmoji("👤");
    setNewColor("#3B82F6");
    setNewIsAdmin(false);
    setEditingProfile(null);
  };

  const handleRefreshApiToken = async (userId: string) => {
    if (!confirm("Are you sure you want to regenerate the API token? The old one will stop working immediately.")) {
        return;
    }

    const result = await refreshApiToken(userId);
    if (result.success) {
        toast.success("API token regenerated successfully");
        fetchProfiles();
    } else {
        toast.error(result.error || "Failed to regenerate API token");
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Users & Profiles</h2>
          <p className="text-sm text-muted-foreground">Manage who can access the application and their profiles.</p>
        </div>
        <Dialog 
            open={isDialogOpen} 
            onOpenChange={(open) => {
                setIsDialogOpen(open);
                if (!open) resetForm();
            }}
        >
          <DialogTrigger asChild>
            <Button className="bg-red-600 hover:bg-red-700 text-white">
              <UserPlus className="mr-2 h-4 w-4" />
              Add User
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px] bg-zinc-900 text-zinc-100 border-zinc-800">
            <DialogHeader>
              <DialogTitle>{editingProfile ? 'Edit User' : 'Add New User'}</DialogTitle>
              <DialogDescription className="text-zinc-400">
                {editingProfile ? 'Update user profile details.' : 'Create a new profile with its own watchlist and tags.'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateUser} className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Username</Label>
                <Input
                  id="name"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  placeholder="johndoe"
                  className="bg-zinc-800 border-zinc-700 text-zinc-100"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="display">Display Name</Label>
                <Input
                  id="display"
                  value={newDisplayName}
                  onChange={(e) => setNewDisplayName(e.target.value)}
                  placeholder="John"
                  className="bg-zinc-800 border-zinc-700 text-zinc-100"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pass">Password {editingProfile && '(optional)'}</Label>
                <Input
                  id="pass"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder={editingProfile ? "Leave empty to keep current" : "••••••••"}
                  className="bg-zinc-800 border-zinc-700 text-zinc-100"
                  required={!editingProfile}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="em">Emoji</Label>
                  <Input
                    id="em"
                    value={newEmoji}
                    onChange={(e) => setNewEmoji(e.target.value)}
                    className="bg-zinc-800 border-zinc-700 text-zinc-100"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="col">Color</Label>
                  <Input
                    id="col"
                    type="color"
                    value={newColor}
                    onChange={(e) => setNewColor(e.target.value)}
                    className="h-10 w-full bg-zinc-800 border-zinc-700 p-1"
                  />
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="admin" 
                  checked={newIsAdmin} 
                  onCheckedChange={(checked) => setNewIsAdmin(checked as boolean)}
                  className="border-zinc-700 data-[state=checked]:bg-red-600"
                />
                <Label htmlFor="admin" className="text-sm font-medium cursor-pointer">Administrator (can manage users)</Label>
              </div>
              <DialogFooter className="pt-4">
                <Button type="submit" className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold">
                    {editingProfile ? 'Update Profile' : 'Create Profile'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {loading ? (
             Array.from({ length: 3 }).map((_, i) => (
                <Card key={i} className="animate-pulse bg-zinc-900 border-zinc-800 h-24" />
             ))
        ) : (
          profiles.map((profile) => (
            <Card key={profile.id} className="bg-zinc-900 border-zinc-800 text-zinc-100 hover:border-zinc-700 transition-colors">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 text-left">
                    <div 
                      className="flex h-12 w-12 items-center justify-center rounded-lg text-2xl shadow-inner shrink-0"
                      style={{ backgroundColor: profile.color || '#333' }}
                    >
                      {profile.emoji || '👤'}
                    </div>
                    <div className="min-w-0">
                      <div className="font-semibold truncate">{profile.displayName || profile.username}</div>
                      <div className="text-xs text-zinc-500 flex items-center gap-1">
                        <span className="truncate">@{profile.username}</span>
                        {profile.isAdmin && <span className="bg-red-900/30 text-red-500 px-1.5 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider shrink-0">Admin</span>}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button 
                        size="icon" 
                        variant="ghost" 
                        className="text-zinc-500 hover:text-white hover:bg-white/10 shrink-0"
                        onClick={() => handleEditUser(profile)}
                    >
                        <Pencil className="h-4 w-4" />
                    </Button>
                    <Button 
                        size="icon" 
                        variant="ghost" 
                        className="text-zinc-500 hover:text-red-500 hover:bg-red-500/10 shrink-0"
                        onClick={() => handleDeleteUser(profile.id, profile.username)}
                        disabled={profile.username === 'admin'}
                    >
                        <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                {/* API Token Section */}
                <div className="mt-4 pt-4 border-t border-zinc-800">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2 text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                      <Key className="h-3 w-3" />
                      API Token
                    </div>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-6 w-6 text-zinc-500 hover:text-white"
                      onClick={() => handleRefreshApiToken(profile.id)}
                      title="Regenerate Token"
                    >
                      <RefreshCw className="h-3 w-3" />
                    </Button>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-zinc-950 px-3 py-1.5 rounded border border-zinc-800 font-mono text-xs text-zinc-400 truncate">
                      {profile.apiToken || 'No token generated'}
                    </div>
                    {profile.apiToken && (
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-zinc-500 hover:text-white"
                        onClick={() => copyToClipboard(profile.apiToken!)}
                        title="Copy to clipboard"
                      >
                        <Copy className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </div>
                  <p className="text-[10px] text-zinc-600 mt-2 italic">
                    Use this token in the `X-API-Token` header for iOS Shortcuts.
                  </p>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
```
