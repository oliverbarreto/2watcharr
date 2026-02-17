# FEATURE. UI: Add filter by channel in watchlist page
- IDE: Antigravity
- Date: 20260217
- Model: Gemini Flash 3.0


## Overview

In watchlist page we should add a way to allow the user to filter the list of episodes by channel, alongside all other filters. This filter should be added to the existing filter bar, to the most right of the bar.

The user for example could want to filter all videos of a certain tag, favorited and of a certain channel.

It should be an icon like the others that when toggled it filters the existing list of episodes by channel. When clicked the button should display a menu in the center of the page like the one we use to select/create tags for an episode (using the macOS spotlight style) but with all the channels of the videos currently displayed in the list of episodes (it might be filtered, or not showing all the episodes). 

The menu should have a search bar to search for a channel, and a list of all the channels with a checkbox to select/deselect them. The list should be scrollable if there are many channels. The menu should close when the user clicks outside of it or presses the escape key. The user can select more than one channel to filter.