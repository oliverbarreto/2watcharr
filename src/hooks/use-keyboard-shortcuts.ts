'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export function useKeyboardShortcuts() {
    const router = useRouter();

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
            const modifier = isMac ? event.metaKey : event.ctrlKey;

            // CMD/CTRL + F: Toggle Search/Filter
            if (modifier && event.key.toLowerCase() === 'f') {
                event.preventDefault();
                window.dispatchEvent(new CustomEvent('toggle-filters'));
            }

            // ESC: Close Filter Panel
            if (event.key === 'Escape') {
                window.dispatchEvent(new CustomEvent('close-filters'));
            }

            // Navigation Shortcuts: CMD/CTRL + 1-4
            if (modifier && !event.shiftKey) {
                switch (event.key) {
                    case '1':
                        event.preventDefault();
                        router.push('/');
                        break;
                    case '2':
                        event.preventDefault();
                        router.push('/channels');
                        break;
                    case '3':
                        event.preventDefault();
                        router.push('/watchnext');
                        break;
                    case '4':
                        event.preventDefault();
                        router.push('/stats');
                        break;
                }
            }

            // CMD/CTRL + , : Settings
            if (modifier && event.key === ',') {
                event.preventDefault();
                router.push('/settings');
            }

            // CMD/CTRL + SHIFT + A: Add New Episode
            if (modifier && event.shiftKey && event.key.toLowerCase() === 'a') {
                event.preventDefault();
                window.dispatchEvent(new CustomEvent('open-add-episode'));
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [router]);
}
