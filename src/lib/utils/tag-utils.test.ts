import { describe, it, expect } from 'vitest';
import { sortTagsAlphabetically } from './tag-utils';

describe('tag-utils', () => {
    describe('sortTagsAlphabetically', () => {
        it('should sort tags case-insensitively', () => {
            const tags = [
                { name: 'workshops' },
                { name: 'Coding Agents' },
                { name: 'arr' },
                { name: 'Media' }
            ];

            const sorted = sortTagsAlphabetically(tags);

            expect(sorted.map(t => t.name)).toEqual([
                'arr',
                'Coding Agents',
                'Media',
                'workshops'
            ]);
        });

        it('should ignore leading emojis when sorting', () => {
            const tags = [
                { name: 'Media' },
                { name: '📚 Books' },
                { name: 'arr' },
                { name: '🎯 Goals' }
            ];

            const sorted = sortTagsAlphabetically(tags);

            expect(sorted.map(t => t.name)).toEqual([
                'arr',
                '📚 Books',
                '🎯 Goals',
                'Media'
            ]);
        });

        it('should handle the specific example provided by the user', () => {
            const tags = [
                { name: 'arr' },
                { name: '📚 Books' },
                { name: 'Coding Agents' },
                { name: '🎯 Goals' },
                { name: 'Media' },
                { name: 'workshops' }
            ].sort(() => Math.random() - 0.5); // Randomize to test sorting

            const sorted = sortTagsAlphabetically(tags);

            expect(sorted.map(t => t.name)).toEqual([
                'arr',
                '📚 Books',
                'Coding Agents',
                '🎯 Goals',
                'Media',
                'workshops'
            ]);
        });

        it('should handle tags with only emojis or symbols', () => {
            const tags = [
                { name: '!!!' },
                { name: '⭐⭐⭐' },
                { name: 'abc' }
            ];

            const sorted = sortTagsAlphabetically(tags);
            // If no alphanumeric characters are found, it falls back to the original name
            // '!!!' and '⭐⭐⭐' will be compared as they are.
            // Symbol comparison in JS: '!' < '*' < 'a'
            expect(sorted.map(t => t.name)).toEqual([
                '!!!',
                '⭐⭐⭐',
                'abc'
            ]);
        });
    });
});
