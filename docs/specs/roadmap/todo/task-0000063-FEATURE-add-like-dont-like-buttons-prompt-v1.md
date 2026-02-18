# FEATURE: Allow the user to like/dont-like episodes
- IDE: Antigravity
- Date: 20260218
- Model: Gemini Flash 3.0

## Overview

We want to add some more filters to the watchlist page to allow the user to like/dont-like episodes.

This is a different concept than marking an episode as favorite. Favorites are special episodes for the user. I can perfectly mark an episode with "like" and do not mark it as favorite.

## Requirements

- The default state for the like/dont-like field is not set. The user MUST select his opinion. A vide not marked as "liked" does not mean it is "not liked". It means it is "not set".
- Add two buttons with thumb-up and down icons to the episode card, right below the information with the name of the channel, views and publish and added dates. Both, for the episode card in grid view and the row cell for list view.
- Add the same buttons as options in the dropdown option menu in the episode card and cell row in the watchlist page. Place the options menu below "Add favorite".
- The buttons should be toggles meaning that when a user selects one of them, the other should be disabled, also saving the state in the database. Once set, the user can change it later, if he so wants.
- We need also to add a filter to allow the user to filter by "liked" and "not liked" episodes. Add the filter to the watchlist page, to the right of the favorite filter button. Just like the favorite filter, the the user can be listing "unwatched" episodes and select "liked" or "not liked" to filter the list. 
- By default, both filters (liked, not liked) should not be selected.