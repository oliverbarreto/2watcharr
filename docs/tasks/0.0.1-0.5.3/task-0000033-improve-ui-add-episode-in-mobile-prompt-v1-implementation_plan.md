# Implementation Plan - Improve UI for adding episodes in mobile

This plan aims to improve the user experience of the "Add New Media" dialog on mobile devices by reducing clutter and adding a convenient paste button.

## User Review Required

> [!IMPORTANT]
> The "Paste from clipboard" functionality requires the browser's `navigator.clipboard` API, which might prompt the user for permission the first time it's used.

## Proposed Changes

### Episode Components

#### [MODIFY] [add-episode-dialog.tsx](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/components/features/episodes/add-episode-dialog.tsx)

- Add `ClipboardPaste` icon from `lucide-react`.
- Add `showTags` state to control the visibility of the tags section on mobile.
- Implement `handlePaste` function to read from clipboard.
- Update the URL input field to include a "Paste" button.
- Wrap the tags section in a conditionally rendered block based on `showTags` and screen size.
- Add a "Add Tags" toggle button that is only visible on mobile.
- Ensure the tags section is always visible on larger screens (e.g., [md](file:///Users/oliver/.gemini/antigravity/brain/39564062-e496-459c-a56f-2cf5f8d4ba79/task.md) breakpoint).

## Verification Plan

### Manual Verification
1. **Paste Button**:
   - Open the "Add New Media" dialog.
   - Click the "Paste" button next to the URL field.
   - Verify that the clipboard content is correctly pasted into the input.
2. **Mobile Tag Toggle**:
   - Resize the browser to a mobile width (or use a mobile device).
   - Open the "Add New Media" dialog.
   - Verify that the tags section is hidden by default.
   - Click the "Add Tags" button and verify that the tags section appears.
3. **Desktop Visibility**:
   - Resize the browser to a desktop width.
   - Open the "Add New Media" dialog.
   - Verify that the tags section is always visible and there is no "Add Tags" toggle button.
