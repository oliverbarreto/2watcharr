# Navigation Bar and Menu Updates Walkthrough

I have updated the navigation bar to improve the mobile experience and streamline the "Archive" access.

## Changes Made

### 1. Mobile Navigation Enhancements
- Updated the mobile hamburger menu button (the logo) to display the current page title (e.g., "Watch List", "Archive") next to the logo icon.
- Adjusted the responsive visibility of the main page title to ensure it only appears once on all screen sizes (mobile uses the hamburger title, desktop uses the standalone title).

### 2. "Archive" Menu Option
- Added "Archive" as a standard menu option in the main navigation (via [NavLinks](file:///Users/oliver/local/dev/2watcharr/src/components/layout/navbar.tsx#34-83)).
- Positioned "Archive" between "Watch Next" and "Stats" in both the desktop top bar and the mobile drawer menu.
- Removed the standalone "Archive" icon button from the top-right action area to reduce clutter.

## Visual Verification

### Desktop View
- The navigation bar now includes "Archive" between "Watch Next" and "Stats".
- The standalone Archive icon button in the top right is gone.

### Mobile View
- The logo in the top left now shows the current page name to its right.
- Clicking the logo opens the menu, which now includes the "Archive" option.
- The top-right area is cleaner with one fewer icon.

### 3. Database Initialization (Start Fresh)
- Updated the database connection logic to automatically create the `data` directory if it doesn't exist.
- This prevents `SQLITE_CANTOPEN` errors when running the app for the first time or in a fresh environment.

```diff:navbar.tsx
'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Plus, Settings, LogOut, User, BarChart3, Radio, Library, Search, Gem, Archive, Trash2 } from 'lucide-react';

import { usePathname, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';

import { AddEpisodeDialog } from '@/components/features/episodes/add-episode-dialog';
import { useSession, signOut } from 'next-auth/react';
import { cn } from '@/lib/utils';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from '@/components/ui/sheet';

interface NavLinksProps {
    className?: string;
    onClick?: () => void;
}

const NavLinks = ({ className, onClick }: NavLinksProps) => {
    const pathname = usePathname();
    
    const getLinkClass = (path: string) => {
        const isActive = pathname === path || (path === '/channels' && pathname.startsWith('/channels/'));
        return cn(
            "w-full justify-start sm:w-auto transition-all duration-200",
            isActive
                ? "bg-primary/15 text-primary hover:bg-primary/20 hover:text-primary/90" 
                : "hover:bg-accent hover:text-accent-foreground",
            className
        );
    };

    return (
        <>
            <Link href="/" onClick={onClick}>
                <Button variant="ghost" className={getLinkClass("/")}>
                    <Library className="mr-2 h-4 w-4 sm:hidden" />
                    Watch List
                </Button>
            </Link>
            <Link href="/channels" onClick={onClick}>
                <Button variant="ghost" className={getLinkClass("/channels")}>
                    <Radio className="mr-2 h-4 w-4 sm:hidden" />
                    Channels
                </Button>
            </Link>
            <Link href="/watchnext" onClick={onClick}>
                <Button variant="ghost" className={getLinkClass("/watchnext")}>
                    <Gem className="mr-2 h-4 w-4 sm:hidden" />
                    Watch Next
                </Button>
            </Link>
            <Link href="/stats" onClick={onClick}>
                <Button variant="ghost" className={getLinkClass("/stats")}>
                    <BarChart3 className="mr-2 h-4 w-4 sm:hidden" />
                    Stats
                </Button>
            </Link>
        </>
    );
};

export function Navbar() {
    const { data: session } = useSession();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    
    // Check if any filters are active
    const hasActiveFilters = Array.from(searchParams.keys()).some(key => 
        ['search', 'status', 'watched', 'watchStatus', 'tags', 'channels', 'channelId', 'favorite', 'hasNotes', 'likeStatus', 'type', 'isShort', 'priority'].includes(key)
    );

    // Get dynamic title based on pathname
    const getPageTitle = () => {
        if (pathname === '/') return 'Watch List';
        if (pathname === '/watchnext') return 'Watch Next';
        if (pathname === '/channels') return 'Channels';
        if (pathname === '/stats') return 'Stats';
        if (pathname === '/archived') return 'Archived';
        if (pathname === '/deleted') return 'Deleted';

        if (pathname === '/settings') return 'Settings';
        if (pathname.startsWith('/channels/')) return 'Channel';
        return '';
    };

    const user = session?.user as { id?: string; name?: string | null; email?: string | null; image?: string | null; emoji?: string | null; isAdmin?: boolean; color?: string | null } | undefined;

    const handleEpisodeAdded = () => {
        window.dispatchEvent(new CustomEvent('episode-added'));
    };

    const handleSignOut = async () => {
        await signOut({ redirect: false });
        window.location.href = '/login';
    };

    return (
        <nav className="border-b bg-background sticky top-0 z-40">
            <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Sheet>
                        <SheetTrigger asChild>
                            <Button variant="ghost" className="sm:hidden -ml-2 p-0 hover:bg-transparent flex items-center gap-2 font-bold text-xl">
                                <Image src="/2watcharr-icon-v1.png" alt="2watcharr logo" width={32} height={32} className="rounded-lg" />
                                <span className="hidden">2watcharr</span>
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="left" className="w-[280px] sm:w-[350px]">
                            <SheetHeader>
                                <SheetTitle className="flex items-center gap-2 font-bold text-xl pt-4">
                                    <Image src="/2watcharr-icon-v1.png" alt="2watcharr logo" width={32} height={32} className="rounded-lg" />
                                    <span>2watcharr</span>
                                </SheetTitle>
                            </SheetHeader>
                            <div className="flex flex-col gap-2 mt-8">
                                <NavLinks className="text-lg py-6" onClick={() => {}} />
                            </div>
                        </SheetContent>
                    </Sheet>

                    <Link href="/" className="hidden sm:flex items-center gap-2 font-bold text-xl">
                        <Image src="/2watcharr-icon-v1.png" alt="2watcharr logo" width={32} height={32} className="rounded-lg" />
                        <span className="hidden xs:inline-block">2watcharr</span>
                    </Link>

                    {getPageTitle() && (
                        <div className="flex items-center gap-2">
                            <div className="h-6 w-px bg-border mx-1 hidden xs:block" />
                            <h1 className="text-sm font-medium text-muted-foreground uppercase tracking-wider hidden xs:block">
                                {getPageTitle()}
                            </h1>
                        </div>
                    )}
                </div>

                <div className="flex items-center gap-2 sm:gap-3">
                    <div className="hidden sm:flex items-center gap-1">
                        <NavLinks />
                    </div>

                    <div className="h-8 w-px bg-border mx-1 hidden sm:block" />

                    <AddEpisodeDialog
                        onEpisodeAdded={handleEpisodeAdded}
                        trigger={
                            <Button
                                size="icon"
                                variant="ghost"
                                className="rounded-full h-9 w-9 bg-primary/15 text-primary hover:bg-primary/25 hover:text-primary/90"
                            >
                                <Plus className="h-5 w-5 stroke-[2.5px]" />
                            </Button>
                        }
                    />

                    {!['/stats', '/settings'].includes(pathname) && (
                        <Button
                            size="icon"
                            variant="ghost"
                            className={cn("rounded-full h-9 w-9", hasActiveFilters && "bg-primary/10 text-primary hover:bg-primary/20 hover:text-primary/80")}
                            onClick={() => window.dispatchEvent(new CustomEvent('toggle-filters'))}
                        >
                            <Search className={cn("h-5 w-5", hasActiveFilters && "stroke-[2.5px]")} />
                        </Button>
                    )}
                    
                    <Link href="/archived">
                        <Button 
                            variant="ghost" 
                            size="icon" 
                            className={cn(
                                "rounded-full h-9 w-9",
                                pathname === '/archived' && "bg-primary/15 text-primary hover:bg-primary/20 hover:text-primary/90"
                            )}
                            title="Archived Episodes"
                        >
                            <Archive className="h-5 w-5" />
                        </Button>
                    </Link>

                    <Link href="/settings">
                        <Button 
                            variant="ghost" 
                            size="icon" 
                            className={cn(
                                "rounded-full h-9 w-9",
                                pathname === '/settings' && "bg-primary/15 text-primary hover:bg-primary/20 hover:text-primary/90"
                            )}
                        >
                            <Settings className="h-5 w-5" />
                        </Button>
                    </Link>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-10 w-10 relative overflow-hidden rounded-lg p-0">
                                {user?.emoji ? (
                                    <div 
                                        className="flex h-full w-full items-center justify-center text-xl"
                                        style={{ backgroundColor: user.color || '#333' }}
                                    >
                                        {user.emoji}
                                    </div>
                                ) : (
                                    <div className="flex h-full w-full items-center justify-center bg-zinc-800">
                                        <User className="h-5 w-5" />
                                    </div>
                                )}
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56">
                            <DropdownMenuLabel>
                                <div className="flex flex-col space-y-1">
                                    <p className="text-sm font-medium leading-none">{user?.name}</p>
                                    <p className="text-xs leading-none text-muted-foreground italic">
                                        @{user?.email}
                                    </p>
                                </div>
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem asChild>
                                <Link href="/settings" className="cursor-pointer">
                                    <Settings className="mr-2 h-4 w-4" />
                                    <span>Settings</span>
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                                <Link href="/stats" className="cursor-pointer">
                                    <BarChart3 className="mr-2 h-4 w-4" />
                                    <span>Stats</span>
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem asChild>
                                <Link href="/archived" className="cursor-pointer">
                                    <Archive className="mr-2 h-4 w-4" />
                                    <span>Archived</span>
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                                <Link href="/deleted" className="cursor-pointer">
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    <span>Deleted</span>
                                </Link>
                            </DropdownMenuItem>

                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                                className="text-red-500 hover:text-red-600 cursor-pointer"
                                onClick={handleSignOut}
                            >
                                <LogOut className="mr-2 h-4 w-4" />
                                <span>Switch Profile</span>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        </nav>
    );
}
===
'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Plus, Settings, LogOut, User, BarChart3, Radio, Library, Search, Gem, Archive, Trash2 } from 'lucide-react';

import { usePathname, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';

import { AddEpisodeDialog } from '@/components/features/episodes/add-episode-dialog';
import { useSession, signOut } from 'next-auth/react';
import { cn } from '@/lib/utils';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from '@/components/ui/sheet';

interface NavLinksProps {
    className?: string;
    onClick?: () => void;
}

const NavLinks = ({ className, onClick }: NavLinksProps) => {
    const pathname = usePathname();
    
    const getLinkClass = (path: string) => {
        const isActive = pathname === path || (path === '/channels' && pathname.startsWith('/channels/'));
        return cn(
            "w-full justify-start sm:w-auto transition-all duration-200",
            isActive
                ? "bg-primary/15 text-primary hover:bg-primary/20 hover:text-primary/90" 
                : "hover:bg-accent hover:text-accent-foreground",
            className
        );
    };

    return (
        <>
            <Link href="/" onClick={onClick}>
                <Button variant="ghost" className={getLinkClass("/")}>
                    <Library className="mr-2 h-4 w-4 sm:hidden" />
                    Watch List
                </Button>
            </Link>
            <Link href="/channels" onClick={onClick}>
                <Button variant="ghost" className={getLinkClass("/channels")}>
                    <Radio className="mr-2 h-4 w-4 sm:hidden" />
                    Channels
                </Button>
            </Link>
            <Link href="/watchnext" onClick={onClick}>
                <Button variant="ghost" className={getLinkClass("/watchnext")}>
                    <Gem className="mr-2 h-4 w-4 sm:hidden" />
                    Watch Next
                </Button>
            </Link>
            <Link href="/archived" onClick={onClick}>
                <Button variant="ghost" className={getLinkClass("/archived")}>
                    <Archive className="mr-2 h-4 w-4 sm:hidden" />
                    Archive
                </Button>
            </Link>
            <Link href="/stats" onClick={onClick}>
                <Button variant="ghost" className={getLinkClass("/stats")}>
                    <BarChart3 className="mr-2 h-4 w-4 sm:hidden" />
                    Stats
                </Button>
            </Link>
        </>
    );
};

export function Navbar() {
    const { data: session } = useSession();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    
    // Check if any filters are active
    const hasActiveFilters = Array.from(searchParams.keys()).some(key => 
        ['search', 'status', 'watched', 'watchStatus', 'tags', 'channels', 'channelId', 'favorite', 'hasNotes', 'likeStatus', 'type', 'isShort', 'priority'].includes(key)
    );

    // Get dynamic title based on pathname
    const getPageTitle = () => {
        if (pathname === '/') return 'Watch List';
        if (pathname === '/watchnext') return 'Watch Next';
        if (pathname === '/channels') return 'Channels';
        if (pathname === '/stats') return 'Stats';
        if (pathname === '/archived') return 'Archived';
        if (pathname === '/deleted') return 'Deleted';

        if (pathname === '/settings') return 'Settings';
        if (pathname.startsWith('/channels/')) return 'Channel';
        return '';
    };

    const user = session?.user as { id?: string; name?: string | null; email?: string | null; image?: string | null; emoji?: string | null; isAdmin?: boolean; color?: string | null } | undefined;

    const handleEpisodeAdded = () => {
        window.dispatchEvent(new CustomEvent('episode-added'));
    };

    const handleSignOut = async () => {
        await signOut({ redirect: false });
        window.location.href = '/login';
    };

    return (
        <nav className="border-b bg-background sticky top-0 z-40">
            <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Sheet>
                        <SheetTrigger asChild>
                            <Button variant="ghost" className="sm:hidden -ml-2 p-0 hover:bg-transparent flex items-center gap-2 font-bold text-xl">
                                <Image src="/2watcharr-icon-v1.png" alt="2watcharr logo" width={32} height={32} className="rounded-lg" />
                                <span className="hidden">2watcharr</span>
                                {getPageTitle() && (
                                    <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider ml-1">
                                        {getPageTitle()}
                                    </span>
                                )}
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="left" className="w-[280px] sm:w-[350px]">
                            <SheetHeader>
                                <SheetTitle className="flex items-center gap-2 font-bold text-xl pt-4">
                                    <Image src="/2watcharr-icon-v1.png" alt="2watcharr logo" width={32} height={32} className="rounded-lg" />
                                    <span>2watcharr</span>
                                </SheetTitle>
                            </SheetHeader>
                            <div className="flex flex-col gap-2 mt-8">
                                <NavLinks className="text-lg py-6" onClick={() => {}} />
                            </div>
                        </SheetContent>
                    </Sheet>

                    <Link href="/" className="hidden sm:flex items-center gap-2 font-bold text-xl">
                        <Image src="/2watcharr-icon-v1.png" alt="2watcharr logo" width={32} height={32} className="rounded-lg" />
                        <span className="hidden xs:inline-block">2watcharr</span>
                    </Link>

                    {getPageTitle() && (
                        <div className="flex items-center gap-2">
                            <div className="h-6 w-px bg-border mx-1 hidden sm:block" />
                            <h1 className="text-sm font-medium text-muted-foreground uppercase tracking-wider hidden sm:block">
                                {getPageTitle()}
                            </h1>
                        </div>
                    )}
                </div>

                <div className="flex items-center gap-2 sm:gap-3">
                    <div className="hidden sm:flex items-center gap-1">
                        <NavLinks />
                    </div>

                    <div className="h-8 w-px bg-border mx-1 hidden sm:block" />

                    <AddEpisodeDialog
                        onEpisodeAdded={handleEpisodeAdded}
                        trigger={
                            <Button
                                size="icon"
                                variant="ghost"
                                className="rounded-full h-9 w-9 bg-primary/15 text-primary hover:bg-primary/25 hover:text-primary/90"
                            >
                                <Plus className="h-5 w-5 stroke-[2.5px]" />
                            </Button>
                        }
                    />

                    {!['/stats', '/settings'].includes(pathname) && (
                        <Button
                            size="icon"
                            variant="ghost"
                            className={cn("rounded-full h-9 w-9", hasActiveFilters && "bg-primary/10 text-primary hover:bg-primary/20 hover:text-primary/80")}
                            onClick={() => window.dispatchEvent(new CustomEvent('toggle-filters'))}
                        >
                            <Search className={cn("h-5 w-5", hasActiveFilters && "stroke-[2.5px]")} />
                        </Button>
                    )}
                    

                    <Link href="/settings">
                        <Button 
                            variant="ghost" 
                            size="icon" 
                            className={cn(
                                "rounded-full h-9 w-9",
                                pathname === '/settings' && "bg-primary/15 text-primary hover:bg-primary/20 hover:text-primary/90"
                            )}
                        >
                            <Settings className="h-5 w-5" />
                        </Button>
                    </Link>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-10 w-10 relative overflow-hidden rounded-lg p-0">
                                {user?.emoji ? (
                                    <div 
                                        className="flex h-full w-full items-center justify-center text-xl"
                                        style={{ backgroundColor: user.color || '#333' }}
                                    >
                                        {user.emoji}
                                    </div>
                                ) : (
                                    <div className="flex h-full w-full items-center justify-center bg-zinc-800">
                                        <User className="h-5 w-5" />
                                    </div>
                                )}
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56">
                            <DropdownMenuLabel>
                                <div className="flex flex-col space-y-1">
                                    <p className="text-sm font-medium leading-none">{user?.name}</p>
                                    <p className="text-xs leading-none text-muted-foreground italic">
                                        @{user?.email}
                                    </p>
                                </div>
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem asChild>
                                <Link href="/settings" className="cursor-pointer">
                                    <Settings className="mr-2 h-4 w-4" />
                                    <span>Settings</span>
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                                <Link href="/stats" className="cursor-pointer">
                                    <BarChart3 className="mr-2 h-4 w-4" />
                                    <span>Stats</span>
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem asChild>
                                <Link href="/archived" className="cursor-pointer">
                                    <Archive className="mr-2 h-4 w-4" />
                                    <span>Archived</span>
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                                <Link href="/deleted" className="cursor-pointer">
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    <span>Deleted</span>
                                </Link>
                            </DropdownMenuItem>

                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                                className="text-red-500 hover:text-red-600 cursor-pointer"
                                onClick={handleSignOut}
                            >
                                <LogOut className="mr-2 h-4 w-4" />
                                <span>Switch Profile</span>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        </nav>
    );
}
```
```diff:database.ts
import sqlite3 from 'sqlite3';
import { open, Database } from 'sqlite';
import { runMigrations } from './migrations';
import path from 'path';

let db: Database | null = null;

/**
 * Get or create the database connection
 * @returns Promise resolving to the database instance
 */
export async function getDatabase(): Promise<Database> {
    if (!db) {
        let dbPath = process.env.DATABASE_PATH || './data/2watcharr.db';
        
        // Ensure path is absolute for reliability in different environments
        if (!path.isAbsolute(dbPath)) {
            dbPath = path.resolve(process.cwd(), dbPath);
        }

        db = await open({
            filename: dbPath,
            driver: sqlite3.Database
        });

        // Enable WAL mode for better concurrency
        await db.run('PRAGMA journal_mode = WAL');

        // Enable foreign keys
        await db.run('PRAGMA foreign_keys = ON');

        try {
            // Run migrations
            await runMigrations(db);
        } catch (error) {
            // If migrations fail, reset the db connection so we don't return a partially initialized DB
            console.error('Failed to run database migrations:', error);
            await db.close();
            db = null;
            throw error;
        }
    }

    return db;
}

/**
 * Close the database connection
 */
export async function closeDatabase(): Promise<void> {
    if (db) {
        await db.close();
        db = null;
    }
}
===
import sqlite3 from 'sqlite3';
import { open, Database } from 'sqlite';
import { runMigrations } from './migrations';
import path from 'path';
import fs from 'fs';

let db: Database | null = null;

/**
 * Get or create the database connection
 * @returns Promise resolving to the database instance
 */
export async function getDatabase(): Promise<Database> {
    if (!db) {
        let dbPath = process.env.DATABASE_PATH || './data/2watcharr.db';
        
        // Ensure path is absolute for reliability in different environments
        if (!path.isAbsolute(dbPath)) {
            dbPath = path.resolve(process.cwd(), dbPath);
        }

        // Ensure the directory exists
        const dbDir = path.dirname(dbPath);
        if (!fs.existsSync(dbDir)) {
            fs.mkdirSync(dbDir, { recursive: true });
        }

        db = await open({
            filename: dbPath,
            driver: sqlite3.Database
        });

        // Enable WAL mode for better concurrency
        await db.run('PRAGMA journal_mode = WAL');

        // Enable foreign keys
        await db.run('PRAGMA foreign_keys = ON');

        try {
            // Run migrations
            await runMigrations(db);
        } catch (error) {
            // If migrations fail, reset the db connection so we don't return a partially initialized DB
            console.error('Failed to run database migrations:', error);
            await db.close();
            db = null;
            throw error;
        }
    }

    return db;
}

/**
 * Close the database connection
 */
export async function closeDatabase(): Promise<void> {
    if (db) {
        await db.close();
        db = null;
    }
}
```
