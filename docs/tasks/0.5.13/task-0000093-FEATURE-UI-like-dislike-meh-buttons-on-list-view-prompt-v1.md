# TASK: FEATURE - UI: like/dislike/meh buttons on list view
- IDE: Antigravity - Agent Mode
- Date: 2026-02-25
- Model: Gemini 3 Flash

## Overview

In the episode card in the list view, we need to include a way to add the like/dislike buttons like we already have them in the cards in the grid view. 

We need to add the like/dislike buttons to the list view cards to be able to set like/dislike (and the empty status as well, remember that empty is a valid status to allow the user to say that he does not like nor dislike an episode, it's kind of `meh`) of an episode.

Since the space available in the list view is different, I would like to only have one button to reflect all three states. The empty status should be represented by a thumbs up icon, but not filled, just the border and colored in gray. When the user clicks on it, it should rotate over the three states: 
- like (thumbs up filled)
- dislike (thumbs down filled)
- empty (thumbs up border, gray). 

We should also add a tooltip to the button to show the current state, e.g. "Like", "Dislike", "Meh".