# TASK: FEATURE - UI: like/dislike/meh buttons on list view
- IDE: Antigravity - Agent Mode
- Date: 2026-02-25
- Model: Gemini 3 Flash

## Overview

BUGFIX: In the watch next page there is a weird bug when we use "Move to beginning" and "Move to end" options in the context menu of episode cards and list rows. In some random cases, i move a video to the end/beginning and it doesn't move it to the end/beginning, but instead:
- if i want to place it at the beginning it is placed after the first epiosde in the queue, 
- if i want to place it at the end of the queue it is placed before the last epiosde in the queue.

I want you to investigate it. Remember that we only want reordering in the "Watch Next" page.

Episodes in the "Watch Next" page are only those which have been marked with priority. When an episode is marked with priority is added to at the top of this list. When an episode is unmarked with priority is removed from this list. 

The sorting has nothing to do with the priority, nor date added, or other factor. It's just a reordering of the episodes in the queue. 

---

## v2
it now works but now when i add an episode to the watch next list it is placed ant the end of the list. It should be placed at the beginning, meaning it should be shown at the top of the page.
