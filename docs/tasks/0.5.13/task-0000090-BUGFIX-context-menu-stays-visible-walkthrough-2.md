# Walkthrough - Context Menu Bug Fixes

I have fixed the issue where the context menu of episode cards and list rows stayed visible after an action was performed or when clicking outside the menu.

## Changes Made

### Episode Card & List Row Components
- **Removed `e.preventDefault()`**: In the `DropdownMenuItem`'s `onSelect` handlers, `e.preventDefault()` was being called, which prevented Radix UI from automatically closing the menu after an item was selected.
- **Improved Event Propagation**: Removed redundant `onClick={(e) => e.stopPropagation()}` calls from the `DropdownMenuTrigger` and `DropdownMenuContent`. These were potentially interfering with the "click outside" detection logic.
- **Refined Row Action Handlers**: In [episode-list-row.tsx](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/components/features/episodes/episode-list-row.tsx), I updated the `onSelect` handlers to pass a mock event object where necessary to satisfy existing function signatures while allowing the menu to close.

## V2: Contextual Reorder Options

I have updated the application to remove the "Move to beginning" and "Move to end" options from the context menu on the main **Watchlist** page, as reordering is only supported on the **Watch Next** page.

### Changes Made
- **Propagated `showReorderOptions`**: Updated [EpisodeList](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/components/features/episodes/episode-list.tsx#57-357) and [GroupedEpisodeList](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/components/features/episodes/grouped-episode-list.tsx#19-82) to correctly pass the `showReorderOptions` prop down to [EpisodeCard](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/components/features/episodes/episode-card.tsx#62-898) and [EpisodeListRow](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/components/features/episodes/episode-list-row.tsx#61-820).
- **Conditional Rendering**: In [EpisodeCard](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/components/features/episodes/episode-card.tsx#62-898) and [EpisodeListRow](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/components/features/episodes/episode-list-row.tsx#61-820), the reorder options are now conditionally rendered based on the `showReorderOptions` prop.

## Verification Results

### Automated Browser Testing (V1 & V2)
I verified the fixes using browser subagents:
1.  **V1 (Menu Dismissal):** Confirmed the menu closes on action and on click outside for both Grid and List views.
2.  **V2 (Reorder Filtering):** 
    *   **Watchlist:** Verified "Move to..." options are hidden in both Grid and List views.
    *   **Watch Next:** Verified "Move to..." options are visible in both Grid and List views.

### Visual Evidence (V2)

![Reorder Filtering Verification Recording](/Users/oliver/.gemini/antigravity/brain/f7131090-2d37-4950-acd2-dfb7ec8b0657/verify_reorder_filtering_v2_1772017410817.webp)
*Verification of contextual reorder options on Watchlist vs Watch Next.*

````carousel
![Watchlist Context Menu (Reorder Hidden)](/Users/oliver/.gemini/antigravity/brain/f7131090-2d37-4950-acd2-dfb7ec8b0657/.system_generated/click_feedback/click_feedback_1772017466470.png)
<!-- slide -->
![Watch Next Context Menu (Reorder Visible)](/Users/oliver/.gemini/antigravity/brain/f7131090-2d37-4950-acd2-dfb7ec8b0657/.system_generated/click_feedback/click_feedback_1772017559064.png)
````
