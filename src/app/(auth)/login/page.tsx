"use client";

import { useEffect, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { getProfiles } from "@/lib/actions/user.actions";
import { UserProfile } from "@/lib/domain/models";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export default function LoginPage() {
  const router = useRouter();
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [selectedProfile, setSelectedProfile] = useState<UserProfile | null>(null);
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchProfiles() {
      const data = await getProfiles();
      setProfiles(data);
      
      // Handle "Remember me" profile auto-selection
      const rememberedId = localStorage.getItem("rememberedUser");
      const rememberedAt = localStorage.getItem("rememberedAt");
      
      if (rememberedId && rememberedAt) {
          const daysPassed = (Date.now() - parseInt(rememberedAt)) / (1000 * 60 * 60 * 24);
          if (daysPassed < 15) {
              const profile = data.find(p => p.id === rememberedId);
              if (profile) {
                  setSelectedProfile(profile);
                  setRememberMe(true);
              }
          } else {
              // Expired
              localStorage.removeItem("rememberedUser");
              localStorage.removeItem("rememberedAt");
          }
      }
    }
    fetchProfiles();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProfile) return;

    setLoading(true);
    const result = await signIn("credentials", {
      username: selectedProfile.username,
      password,
      redirect: false,
    });
    setLoading(false);

    if (result?.ok) {
        if (rememberMe) {
            localStorage.setItem("rememberedUser", selectedProfile.id);
            localStorage.setItem("rememberedAt", Date.now().toString());
        } else {
            localStorage.removeItem("rememberedUser");
            localStorage.removeItem("rememberedAt");
        }
      toast.success(`Welcome back, ${selectedProfile.displayName || selectedProfile.username}!`);
      router.push("/");
    } else {
      toast.error("Invalid password");
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-950 p-4 text-zinc-100">
      <h1 className="mb-12 text-5xl font-bold tracking-tight">Who's watching?</h1>
      
      {!selectedProfile ? (
        <div className="grid grid-cols-2 gap-8 md:grid-cols-3 lg:grid-cols-4">
          {profiles.map((profile) => (
            <button
              key={profile.id}
              onClick={() => setSelectedProfile(profile)}
              className="group flex flex-col items-center gap-4 transition-transform hover:scale-110"
            >
              <div 
                className="flex h-32 w-32 items-center justify-center rounded-lg text-6xl shadow-xl transition-all group-hover:ring-4 group-hover:ring-zinc-100"
                style={{ backgroundColor: profile.color || '#333' }}
              >
                {profile.emoji || '👤'}
              </div>
              <span className="text-xl font-medium text-zinc-400 group-hover:text-zinc-100">
                {profile.displayName || profile.username}
              </span>
            </button>
          ))}
        </div>
      ) : (
        <Card className="w-full max-w-sm border-zinc-800 bg-zinc-900 text-zinc-100">
          <CardHeader className="items-center pb-2">
             <div 
                className="mb-4 flex h-24 w-24 items-center justify-center rounded-lg text-5xl shadow-lg transition-transform hover:scale-105"
                style={{ backgroundColor: selectedProfile.color || '#333' }}
              >
                {selectedProfile.emoji || '👤'}
              </div>
            <CardTitle className="text-xl">Welcome, {selectedProfile.displayName || selectedProfile.username}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Input
                  type="password"
                  placeholder="Enter Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="border-zinc-700 bg-zinc-800 text-center text-lg focus-visible:ring-zinc-600"
                  autoFocus
                  required
                />
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox 
                    id="remember" 
                    checked={rememberMe} 
                    onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                    className="border-zinc-700 data-[state=checked]:bg-red-600"
                />
                <Label htmlFor="remember" className="text-sm cursor-pointer text-zinc-400 hover:text-zinc-200">Remember me for 15 days</Label>
              </div>
              <Button type="submit" className="w-full bg-red-600 font-semibold hover:bg-red-700" disabled={loading}>
                {loading ? "Logging in..." : "Login"}
              </Button>
              <Button 
                variant="ghost" 
                type="button" 
                onClick={() => {
                    setSelectedProfile(null);
                    setPassword("");
                }} 
                className="w-full text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100"
              >
                Back to profiles
              </Button>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
