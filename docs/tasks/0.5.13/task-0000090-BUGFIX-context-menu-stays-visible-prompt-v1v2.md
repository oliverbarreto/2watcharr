# TASK: BUGFIX - UI: fix context menu of episode cards
- IDE: Antigravity - Agent Mode
- Date: 2026-02-25
- Model: Gemini 3 Flash

## Overview

We need to fix an issue where the dropdown context menu of episode cards (both in list and grid view) stays visible when we click any menu option like "add priority" and others. We need to dismiss it after the action is performed.

Also, we need to dismiss the context menu if we click outside the menu.


---

## v2 

Remove the options "Move to beggining" and "Move to end" from the context menu of episode cards (both in list and grid view) but only on the "Watchlist", not in the "Watch Next" page.