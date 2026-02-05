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
  const [confirmingRefresh, setConfirmingRefresh] = useState<{ id: string, username: string } | null>(null);
  const [deletingProfile, setDeletingProfile] = useState<{ id: string, username: string } | null>(null);
  
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

  const handleDeleteUser = async (id: string) => {
    setDeletingProfile(null);
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
    setConfirmingRefresh(null);
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
                        onClick={() => {
                          if (profile.username === 'admin') {
                            toast.error("Cannot delete the default admin account");
                          } else {
                            setDeletingProfile({ id: profile.id, username: profile.username });
                          }
                        }}
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
                      onClick={() => setConfirmingRefresh({ id: profile.id, username: profile.username })}
                      title="Regenerate Token"
                    >
                      <RefreshCw className="h-3 w-3" />
                    </Button>
                  </div>
                  <div className="flex items-center gap-2">
                    <Input
                      readOnly
                      value={profile.apiToken || 'No token generated'}
                      autoComplete="off"
                      data-1p-ignore
                      data-lpignore="true"
                      className="h-8 flex-1 bg-zinc-950 border-zinc-800 font-mono text-xs text-zinc-400 focus-visible:ring-0 focus-visible:ring-offset-0"
                    />
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

      {/* Confirmation Dialog for API Token Refresh */}
      <Dialog open={!!confirmingRefresh} onOpenChange={(open) => !open && setConfirmingRefresh(null)}>
        <DialogContent className="sm:max-w-[425px] bg-zinc-900 text-zinc-100 border-zinc-800">
          <DialogHeader>
            <DialogTitle>Regenerate API Token</DialogTitle>
            <DialogDescription className="text-zinc-400">
              Are you sure you want to regenerate the API token for <strong>@{confirmingRefresh?.username}</strong>? 
              The old token will stop working immediately.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="ghost" onClick={() => setConfirmingRefresh(null)} className="text-zinc-400 hover:text-white">
              Cancel
            </Button>
            <Button onClick={() => confirmingRefresh && handleRefreshApiToken(confirmingRefresh.id)} className="bg-red-600 hover:bg-red-700 text-white">
              Regenerate
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog for User Deletion */}
      <Dialog open={!!deletingProfile} onOpenChange={(open) => !open && setDeletingProfile(null)}>
        <DialogContent className="sm:max-w-[425px] bg-zinc-900 text-zinc-100 border-zinc-800">
          <DialogHeader>
            <DialogTitle>Delete User Profile</DialogTitle>
            <DialogDescription className="text-zinc-400">
              Are you sure you want to delete user <strong>@{deletingProfile?.username}</strong>? 
              All their data (watchlist, tags) will be <strong>permanently lost</strong>.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="ghost" onClick={() => setDeletingProfile(null)} className="text-zinc-400 hover:text-white">
              Cancel
            </Button>
            <Button onClick={() => deletingProfile && handleDeleteUser(deletingProfile.id)} className="bg-red-600 hover:bg-red-700 text-white">
              Delete Profile
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
