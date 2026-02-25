# Walkthrough - Context Menu Bug Fixes

I have fixed the issue where the context menu of episode cards and list rows stayed visible after an action was performed or when clicking outside the menu.

## Changes Made

### Episode Card & List Row Components
- **Removed `e.preventDefault()`**: In the `DropdownMenuItem`'s `onSelect` handlers, `e.preventDefault()` was being called, which prevented Radix UI from automatically closing the menu after an item was selected.
- **Improved Event Propagation**: Removed redundant `onClick={(e) => e.stopPropagation()}` calls from the `DropdownMenuTrigger` and `DropdownMenuContent`. These were potentially interfering with the "click outside" detection logic.
- **Refined Row Action Handlers**: In [episode-list-row.tsx](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/components/features/episodes/episode-list-row.tsx), I updated the `onSelect` handlers to pass a mock event object where necessary to satisfy existing function signatures while allowing the menu to close.

## Verification Results

### Automated Browser Testing
I verified the fixes using a browser subagent that performed the following steps:
1. **Grid View**: Opened the context menu, clicked "Like", and verified the menu closed.
2. **Grid View**: Opened the menu and clicked outside, verifying it closed.
3. **List View**: Switched to list view, clicked "Mark Watched", and verified the menu closed.
4. **List View**: Opened the menu and clicked outside, verifying it closed.

### Visual Evidence

![Context Menu Verification Recording](/Users/oliver/.gemini/antigravity/brain/f7131090-2d37-4950-acd2-dfb7ec8b0657/verify_context_menu_fix_1772016541655.webp)
*Verification of context menu behavior in both Grid and List views.*

````carousel
![Grid View Context Menu](/Users/oliver/.gemini/antigravity/brain/f7131090-2d37-4950-acd2-dfb7ec8b0657/.system_generated/click_feedback/click_feedback_1772016582145.png)
<!-- slide -->
![List View Context Menu](/Users/oliver/.gemini/antigravity/brain/f7131090-2d37-4950-acd2-dfb7ec8b0657/.system_generated/click_feedback/click_feedback_1772016719196.png)
````
