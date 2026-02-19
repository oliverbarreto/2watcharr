# FEATURE: Add option to create notes for episodes in the dropdown option menu of episode cards
- IDE: Antigravity
- Date: 20260218
- Model: Gemini Flash 3.0

## Overview

We want to add the option to create notes for episodes in the dropdown option menu of episode cards.

## Requirements

- Add the button as option in the dropdown option menu in the episode card and cell row in the watchlist page.
- Place the option menu below "Add favorite"

---

## v2

The image shows all three states of the button to confirm that an episode has been watched: "Mark Watched", "Watched", "Confirm Watched".

But you can see in the image that the button with the vertical ellipsis is practivally invisible in the "Confirm Watched" state since the text occupies more space than the other states messages. Make the font smaller in this state to make some room.

Make sure the ellipsis button is always visible.