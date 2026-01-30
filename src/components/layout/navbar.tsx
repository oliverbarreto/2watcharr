import Link from 'next/link';
import { Plus, Settings, LogOut, User, BarChart3, Menu, Radio, Library } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ModeToggle } from '@/components/mode-toggle';
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

export function Navbar() {
    const { data: session } = useSession();
    const user = session?.user as any;

    const handleEpisodeAdded = () => {
        window.dispatchEvent(new CustomEvent('episode-added'));
    };

    const handleSignOut = () => {
        signOut({ callbackUrl: '/login' });
    };

    const NavLinks = ({ className, onClick }: { className?: string, onClick?: () => void }) => (
        <>
            <Link href="/" onClick={onClick}>
                <Button variant="ghost" className={cn("w-full justify-start sm:w-auto", className)}>
                    <Library className="mr-2 h-4 w-4 sm:hidden" />
                    Watch List
                </Button>
            </Link>
            <Link href="/channels" onClick={onClick}>
                <Button variant="ghost" className={cn("w-full justify-start sm:w-auto", className)}>
                    <Radio className="mr-2 h-4 w-4 sm:hidden" />
                    Channels
                </Button>
            </Link>
            <Link href="/stats" onClick={onClick}>
                <Button variant="ghost" className={cn("w-full justify-start sm:w-auto", className)}>
                    <BarChart3 className="mr-2 h-4 w-4 sm:hidden" />
                    Stats
                </Button>
            </Link>
        </>
    );

    return (
        <nav className="border-b bg-background sticky top-0 z-40">
            <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Sheet>
                        <SheetTrigger asChild>
                            <Button variant="ghost" size="icon" className="sm:hidden -ml-2">
                                <Menu className="h-6 w-6" />
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="left" className="w-[280px] sm:w-[350px]">
                            <SheetHeader>
                                <SheetTitle className="flex items-center gap-2 font-bold text-xl pt-4">
                                    <img src="/icon.png" alt="2watcharr logo" className="h-8 w-8 rounded-lg" />
                                    <span>2watcharr</span>
                                </SheetTitle>
                            </SheetHeader>
                            <div className="flex flex-col gap-2 mt-8">
                                <NavLinks className="text-lg py-6" onClick={() => {}} />
                            </div>
                        </SheetContent>
                    </Sheet>

                    <Link href="/" className="flex items-center gap-2 font-bold text-xl">
                        <img src="/icon.png" alt="2watcharr logo" className="h-8 w-8 rounded-lg" />
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
                                className="rounded-full bg-red-600 hover:bg-red-700 text-white h-9 w-9"
                            >
                                <Plus className="h-5 w-5" />
                            </Button>
                        }
                    />
                    
                    <Link href="/settings">
                        <Button variant="ghost" size="icon" className="rounded-full h-9 w-9">
                            <Settings className="h-5 w-5" />
                        </Button>
                    </Link>
                    
                    <ModeToggle />

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
