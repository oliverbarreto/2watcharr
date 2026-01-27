import Link from 'next/link';
import { Plus, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ModeToggle } from '@/components/mode-toggle';
import { AddVideoDialog } from '@/components/features/videos/add-video-dialog';

export function Navbar() {
    const handleVideoAdded = () => {
        window.dispatchEvent(new CustomEvent('video-added'));
    };

    return (
        <nav className="border-b bg-background">
            <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                <Link href="/" className="flex items-center gap-2 font-bold text-xl">
                    <img src="/icon.png" alt="2watcharr logo" className="h-8 w-8 rounded-lg" />
                    <span>2watcharr</span>
                </Link>

                <div className="flex items-center gap-4">
                    <AddVideoDialog
                        onVideoAdded={handleVideoAdded}
                        trigger={
                            <Button
                                size="icon"
                                className="rounded-full bg-red-600 hover:bg-red-700 text-white h-9 w-9"
                            >
                                <Plus className="h-5 w-5" />
                            </Button>
                        }
                    />
                    <Link href="/">
                        <Button variant="ghost">Watch List</Button>
                    </Link>
                    <Link href="/channels">
                        <Button variant="ghost">Channels</Button>
                    </Link>
                    <Link href="/settings">
                        <Button variant="ghost" size="icon" className="rounded-full">
                            <Settings className="h-5 w-5" />
                        </Button>
                    </Link>
                    <ModeToggle />
                </div>
            </div>
        </nav>
    );
}
