import { ReactNode } from 'react';
import { Navbar } from './navbar';
import { Toaster } from '@/components/ui/sonner';
import { useKeyboardShortcuts } from '@/hooks/use-keyboard-shortcuts';

interface LayoutProps {
    children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
    useKeyboardShortcuts();

    return (
        <div className="min-h-screen bg-background">
            <Navbar />
            <main className="container mx-auto px-4 py-8">
                {children}
            </main>
            <Toaster />
        </div>
    );
}
