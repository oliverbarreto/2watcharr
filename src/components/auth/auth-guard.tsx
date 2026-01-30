"use client";

import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState, useMemo } from "react";
import { checkOnboardingStatus } from "@/lib/actions/user.actions";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [checkingOnboarding, setCheckingOnboarding] = useState(true);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);

  // Memoize public paths to avoid unnecessary re-renders
  const isPublicPath = useMemo(() => {
    const publicPaths = ["/login", "/onboarding", "/api/auth"];
    return publicPaths.some(path => pathname.startsWith(path));
  }, [pathname]);

  useEffect(() => {
    async function check() {
      // Set checking to true immediately when we start a re-check
      setCheckingOnboarding(true);
      try {
        const onboardingStatus = await checkOnboardingStatus();
        setNeedsOnboarding(onboardingStatus);
      } catch (error) {
        console.error("Failed to check onboarding status:", error);
      } finally {
        setCheckingOnboarding(false);
      }
    }
    
    // Check on mount and also when navigating to critical paths to ensure state is fresh
    if (pathname === "/" || pathname === "/login" || pathname === "/onboarding") {
      check();
    } else {
      setCheckingOnboarding(false);
    }
  }, [pathname]);

  useEffect(() => {
    if (checkingOnboarding || status === "loading") return;

    if (needsOnboarding) {
      if (pathname !== "/onboarding") {
        router.push("/onboarding");
      }
    } else if (!session) {
      if (!isPublicPath) {
        router.push("/login");
      }
    } else if (isPublicPath && pathname !== "/api/auth") {
      // If authenticated and on login/onboarding, go home
      router.push("/");
    }
  }, [session, status, needsOnboarding, checkingOnboarding, pathname, router, isPublicPath]);

  // Handle loading state
  if (checkingOnboarding || status === "loading") {
    return (
      <div className="flex animate-pulse h-screen w-full items-center justify-center bg-zinc-950 text-xl font-bold italic tracking-tighter text-red-600">
        2WATCHARR
      </div>
    );
  }

  // Allow rendering if on public path or authenticated
  if (isPublicPath || session) {
    return <>{children}</>;
  }

  // Prevent flash of content before redirect
  return null;
}
