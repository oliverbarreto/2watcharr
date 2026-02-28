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
                                <NavLinks className="text-lg py-6" onClick={() => { }} />
                            </div>
                        </SheetContent>
                    </Sheet>

                    <Link href="/" className="hidden sm:flex items-center gap-2 font-bold text-xl">
                        <Image src="/2watcharr-icon-v1.png" alt="2watcharr logo" width={32} height={32} className="rounded-lg" />
                        <span className="hidden xs:inline-block">2watcharr</span>
                    </Link>

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
