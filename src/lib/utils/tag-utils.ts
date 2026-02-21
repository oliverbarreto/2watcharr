/**
 * Sorts an array of objects with a 'name' property alphabetically.
 * The sorting is case-insensitive and ignores leading non-alphanumeric characters (like emojis).
 */
export function sortTagsAlphabetically<T extends { name: string }>(tags: T[]): T[] {
    const collator = new Intl.Collator('en', {
        numeric: true,
        sensitivity: 'base',
        usage: 'sort'
    });

    const getSortableName = (name: string): string => {
        // Find the first alphanumeric character
        const match = name.match(/[a-zA-Z0-9]/);
        if (!match || match.index === undefined) {
            return name; // Fallback to original name if no alphanumeric characters found
        }
        return name.slice(match.index);
    };

    return [...tags].sort((a, b) => {
        const nameA = getSortableName(a.name);
        const nameB = getSortableName(b.name);
        
        return collator.compare(nameA, nameB);
    });
}

/**
 * Sorts an array of strings alphabetically using the same logic as sortTagsAlphabetically.
 */
export function sortStringsAlphabetically(strings: string[]): string[] {
    return sortTagsAlphabetically(strings.map(name => ({ name }))).map(t => t.name);
}

