# Task: BUGFIX - tags list alphabetical order not correct with capital letters
- IDE: Cursor 2.0 - Agent Mode
- Date: 2026-02-21
- Model: Cursor Sonnet 4.5

## Overview

Right now the tags list in the tags tab in settings is sorted alphabetically, but it has a gotcha. 

We now order alphahbetically first all tags that start with a capital letter, then those that start with lower case, and then we order the ones with emojis.

## Requirements

- The tags should be ordered alphabetically not taking into account the case of the letters.
- If there is a way that we can also order the tags that start with an emoji first, not taking into account the emoji but the first letter after the emoji, that would be great.