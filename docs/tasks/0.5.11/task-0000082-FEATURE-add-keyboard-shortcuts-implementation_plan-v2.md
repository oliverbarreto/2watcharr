# Implementation Plan - Add Keyboard Shortcuts

We will add keyboard shortcuts to improve user navigation and interaction efficiency.

## User Review Required

> [!IMPORTANT]
> The shortcut `CTRL+3` / `CMD+3` is planned for `/watchnext`, but this route does not yet exist in the codebase. I will implement the shortcut as requested, but it will result in a 404 if the page hasn't been created yet.
>
> I will also implement `ESC` to close the filter panel, but this requires the filter panel to be open.

## Proposed Changes

### [Hooks]

#### [NEW] [use-keyboard-shortcuts.ts](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/hooks/use-keyboard-shortcuts.ts)
- Create a custom hook to handle global keyboard events.
- Implement logic for:
    - `CMD/CTRL + F`: Toggle search/filter panel (dispatch `toggle-filters` event).
    - `ESC`: Close search/filter panel (dispatch `close-filters` event).
    - `CMD/CTRL + 1-4`: Navigate to `/`, `/channels`, `/watchnext`, `/stats`.
    - `CMD/CTRL + ,`: Navigate to `/settings`.
    - `CMD/CTRL + SHIFT + A`: Open "Add New Episode" modal (dispatch `open-add-episode` event).

### [Components]

#### [MODIFY] [layout.tsx](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/components/layout/layout.tsx)
- Use the `useKeyboardShortcuts` hook.

#### [MODIFY] [add-episode-dialog.tsx](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/components/features/episodes/add-episode-dialog.tsx)
- Add a listener for the `open-add-episode` custom event to set `open` state to `true`.

#### [MODIFY] [page.tsx](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/app/page.tsx)
- Add a listener for a new `close-filters` event (or handle it in `toggle-filters` if it's already open).
- Actually, `ESC` should only close it if it's open.

## Verification Plan

### Automated Tests
- I will attempt to write a Vitest test for the `useKeyboardShortcuts` hook if applicable.

### Manual Verification
- Test all shortcuts in the browser:
    - `CMD+F`: Check if filter panel appears.
    - `ESC`: Check if filter panel disappears.
    - `CMD+1`: Navigates to `/`.
    - `CMD+2`: Navigates to `/channels`.
    - `CMD+3`: Navigates to `/watchnext` (Verify if it 404s as expected or if the route was hidden).
    - `CMD+4`: Navigates to `/stats`.
    - `CMD+,`: Navigates to `/settings`.
    - `CMD+SHIFT+A`: Check if "Add New Media" modal opens.
