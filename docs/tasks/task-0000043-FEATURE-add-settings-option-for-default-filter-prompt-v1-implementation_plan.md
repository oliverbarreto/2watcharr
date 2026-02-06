# Add Default Filter Setting for Watchlist

Add a new setting in the "General" tab of the settings page to allow users to select their preferred default sort/filter for the watchlist page.

## Proposed Changes

### Settings Page
#### [MODIFY] [page.tsx](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/app/settings/page.tsx)
- Add state for `defaultSortField`.
- Load `defaultSortField` from `localStorage` on mount.
- Add a new `Select` component in the "General" section to choose the default filter.
- Save the selection to `localStorage` under the key `defaultSortField`.

### Watchlist Page
#### [MODIFY] [page.tsx](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/app/page.tsx)
- Update the initial state of the `sort` state to load from `localStorage`.
- Use `date_added` as the fallback if no preference is set (as requested by the user).
- Default order for `date_added` should be `desc` (newest first).

## Verification Plan

### Manual Verification
1.  Go to **Settings** -> **General**.
2.  Change the **Default Filter** to "Date Added".
3.  Refresh the page or navigate away and back to **Settings** to ensure the value is persisted in the UI.
4.  Navigate to the **Watchlist** page.
5.  Verify that the episodes are sorted by "Date Added" by default.
6.  Change the **Default Filter** to "Manual" in Settings.
7.  Navigate back to the **Watchlist** page.
8.  Verify that the episodes are sorted "Manual" (by custom order).
9.  Test other options: "Date Watched", "Date Favorited", "Date Removed".
