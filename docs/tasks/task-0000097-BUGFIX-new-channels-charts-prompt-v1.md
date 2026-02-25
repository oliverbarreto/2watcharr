# BUGFIX: modify archived episodes page and move episodes to archived episodes list
- IDE: Antigravity - Agent Mode
- Date: 2026-02-25
- Model: Gemini 3 Flash

## Overview

We need to fix a couple of things related to the "Channels Stats":

1. When we click on the "Channels Stats" page (/stats) and we select the Channels option in the radio buttons group we can select added, watched, favorited, with priority, liked, and disliked episodes to show in the chart. With each option, we show 5 channels on the chart, with the rest of the channels unselected and therefore, not shown on the chart. Is this the way we created the chart ? This is just a question. I like it since it is very clean. And another question, are these 5 channels the ones with the most episodes for each category ?

2. In the section below where we show all channels, we need to add a search textfield to allow filtering the channels by name. Add a button to clear the selection. This is important because we have a lot of channels and it is difficult to find a specific channel.

---

## V2

1. Change the trash bin icon used in the clear search textfield to a cross inside a circle like the one we use in the seach panel textfield
2. Add a reset to defaults button to reset the chart to the default view (top 5 channels for the selected metric and period). Use a reset icon for the button.