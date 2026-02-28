# FEATURE. UI: Show floating bubble with number of episodes in infinite scroll prompt
- IDE: Antigravity
- Date: 20260217
- Model: Gemini Flash 3.0


## Overview

In watchlist page we have infinite scroll to load more episodes. When the user scrolls to the bottom of the page, a prompt is shown to load more episodes. We should show a floating bubble with the number of episodes to load.

This number is only shown and correctly updated on the top of the page, not on the bottom. We want to provide feedack and information to the user by adding a way to show the user the number of episodes to load on the bottom of the page.

This should use a subtle animation to show in the bottom left of the page a floating bubble with the number of episodes eg: "Showing 100 of 208 episodes". The bubble should disapear after a delay of a few seconds (5 seconds for example) with a subtle animation.