# Walkthrough: Stats Table Pagination and Search

## Summary

Added pagination and search functionality to the Detailed History table on the stats page to improve performance and usability when viewing large datasets.

## Changes Made

### State Management

Added three new state variables to [stats/page.tsx](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/app/stats/page.tsx):
- `searchQuery`: Stores the raw search term for the input field
- `debouncedSearchQuery`: Stores the debounced search term used for filtering
- `currentPage`: Tracks the current page number (starts at 1)
- `rowsPerPage`: Controls how many rows to display per page (default: 20)

### Search Debouncing

- **Debounce Timer**: Added a `useEffect` hook with a 300ms `setTimeout` to update `debouncedSearchQuery` only after the user stops typing.
- **Improved Performance**: This ensures that expensive filtering and re-rendering operations don't occur on every single keystroke.
- **Responsive UI**: The search input field remains immediate and responsive as it uses the raw `searchQuery` state.

### Search Functionality

- **Case-insensitive search**: Filters table entries by title using the debounced search term.
- **Real-time filtering**: Results update automatically 300ms after the last keystroke.
- **Auto-reset pagination**: Automatically returns to page 1 when the debounced search query changes.

### Pagination Logic

The implementation follows this flow:
1. **Filter** by search query (if present)
2. **Sort** by selected column and direction
3. **Paginate** the filtered/sorted results

### UI Components

#### Search Input
- Text input field with search icon
- Placeholder: "Search by title..."
- Located above the table for easy access

#### Rows Per Page Selector
- Dropdown with options: 10, 20, 50, 100, 200
- Default: 20 rows
- Maximum: 200 rows (as requested)

#### Pagination Controls
- **Info display**: Shows "Showing X to Y of Z entries"
- **Filtered count**: When searching, displays "(filtered from N total)"
- **Navigation buttons**: Previous/Next page with chevron icons
- **Page indicator**: Shows "Page X of Y"
- **Disabled states**: Buttons disable when at first/last page

### Empty States

Updated empty state messages:
- When no data: "No activity found for this period."
- When search has no results: "No results found for your search."

## Technical Details

### Performance Optimization

The pagination ensures optimal performance by:
- Only rendering the current page's rows in the DOM
- Limiting maximum rows per page to 200
- Efficient filtering using native JavaScript array methods

### Responsive Design

All controls are responsive:
- Search and rows-per-page controls stack on mobile
- Pagination info and navigation stack on smaller screens
- Maintains consistent styling with existing UI components

## Testing

You can manually test the following scenarios:
1. **Search**: Type partial titles to filter results
2. **Pagination**: Navigate between pages using the buttons
3. **Rows per page**: Change the dropdown to see different page sizes
4. **Combined**: Search and then paginate through filtered results
5. **Sorting**: Verify sorting still works with pagination
6. **Edge cases**: Test with empty results, single page, etc.
