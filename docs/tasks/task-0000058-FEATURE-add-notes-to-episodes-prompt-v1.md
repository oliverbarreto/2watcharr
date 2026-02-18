# FEATURE: Add notes to episodes
- IDE: Antigravity
- Date: 20260218
- Model: Gemini Flash 3.0


## Overview

We want to allow the user to add notes to an episode. As an example, I could want to add that this episode covers a specific topic or theme, or a note to reflect that the user liked the diagram or methodology, liked the characters, etc. 

I would like to add a new option button in the options menu (with the vertical ellipsis icon) of the episode card to open a modal to add/edit the notes associated with the episode. 


## Requirements

- Add a new column to the database to store the notes.
- It should be retro compatible with the current database.
- Add a new button to the episode card to open a modal to add/edit the notes associated with the episode.
- The notes should have a maximum length of 255 characters, and the modal should show how many characters are left.
- The modal should have a save button and a cancel button.
- The modal should close when the save button is clicked.
- The modal should close when the cancel button is clicked.
- The modal should close when the escape key is pressed.
- The modal should close when the user clicks outside the modal.

