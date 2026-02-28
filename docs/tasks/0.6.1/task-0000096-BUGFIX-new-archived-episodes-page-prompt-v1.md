# BUGFIX: modify archived episodes page and move episodes to archived episodes list
- IDE: Antigravity - Agent Mode
- Date: 2026-02-25
- Model: Gemini 3 Flash

## Overview

We need to fix a couple of things related to the "Archived" episodes:

1. We need to slightly modify the criteria we use when we archive episodes and show the list of archived episodes. 

Currently, when we use the button "Archive Watched Episodes" in the "Watch Next" page to archive episodes, we archive all episodes that are watched. 

We should only archive episodes that are marked as watched AND are marked with priority. This way we don't end up with a lot of episodes in the archived episodes list that never were selected to watch next.

2. On the "Archived" episodes page (https://2watcharr.oliverbarreto.com/archived) when we click on the option to unarchive a single episode we get an error "Failed to unarchive episode" both in list and grid view.