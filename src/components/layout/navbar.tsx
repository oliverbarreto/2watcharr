import Link from 'next/link';
import { Video, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function Navbar() {
    return (
        <nav className="border-b bg-background">
            <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                <Link href="/" className="flex items-center gap-2 font-bold text-xl">
                    <Video className="h-6 w-6" />
                    <span>2watcharr</span>
                </Link>

                <div className="flex items-center gap-4">
                    <Link href="/channels">
                        <Button variant="ghost">Channels</Button>
                    </Link>
                </div>
            </div>
        </nav>
    );
}
