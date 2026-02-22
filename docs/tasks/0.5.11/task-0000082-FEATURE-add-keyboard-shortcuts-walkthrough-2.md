# Walkthrough - New Keyboard Shortcuts

I have implemented several keyboard shortcuts to improve navigation and efficiency within the application. These shortcuts are context-aware and handle both macOS (CMD) and other platforms (CTRL).

## Key Shortcuts Added

### Search and Filter Panel
- **CMD+F** (macOS) / **CTRL+F** (Others): Toggles the search and filter panel on the Watch List and Channels pages.
- **ESC**: Closes the filter panel on both pages if it is currently open.

### Navigation
- **CMD+1** / **CTRL+1**: Navigate to the **Watch List** page (`/`).
- **CMD+2** / **CTRL+2**: Navigate to the **Channels** page (`/channels`).
- **CMD+3** / **CTRL+3**: Navigate to the **Watch Next** page (`/watchnext`).
- **CMD+4** / **CTRL+4**: Navigate to the **Stats** page (`/stats`).
- **CMD+,** / **CTRL+,**: Navigate to the **Settings** page (`/settings`).

### Actions
- **CMD+SHIFT+A** / **CTRL+SHIFT+A**: Opens the **Add New Media** modal from any page.

## Implementation Details

The shortcuts are managed by a custom hook [useKeyboardShortcuts](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/hooks/use-keyboard-shortcuts.ts#6-64) located in [use-keyboard-shortcuts.ts](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/hooks/use-keyboard-shortcuts.ts). This hook is integrated into the main [layout.tsx](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/components/layout/layout.tsx), ensuring availability across all pages.

Interaction with specific components is handled via custom browser events:
- `toggle-filters` and `close-filters` for the [HomePageContent](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/app/page.tsx#30-237).
- `open-add-episode` for the [AddEpisodeDialog](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/components/features/episodes/add-episode-dialog.tsx#33-234).

## Verification Results

- ✅ **Linting**: Passed with only minor unrelated warnings.
- ✅ **Navigation**: Shortcuts correctly trigger router navigation.
- ✅ **Modals/Panels**: Custom event dispatching correctly toggles the UI elements.
