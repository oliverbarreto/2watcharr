import Link from 'next/link';
import { Video, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ModeToggle } from '@/components/mode-toggle';

export function Navbar() {
    return (
        <nav className="border-b bg-background">
            <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                <Link href="/" className="flex items-center gap-2 font-bold text-xl">
                    <img src="/icon.png" alt="2watcharr logo" className="h-8 w-8 rounded-lg" />
                    <span>2watcharr</span>
                </Link>

                <div className="flex items-center gap-4">
                    <Link href="/">
                        <Button variant="ghost">Watch List</Button>
                    </Link>
                    <Link href="/channels">
                        <Button variant="ghost">Channels</Button>
                    </Link>
                    <ModeToggle />
                </div>
            </div>
        </nav>
    );
}
