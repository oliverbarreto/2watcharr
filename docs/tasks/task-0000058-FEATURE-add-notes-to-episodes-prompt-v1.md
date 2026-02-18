# FEATURE: Add notes to episodes
- IDE: Antigravity
- Date: 20260218
- Model: Gemini Flash 3.0


## Overview

We want to allow the user to add notes to an episode. As an example, I could want to add that this episode covers a specific topic or theme, or a note to reflect that the user liked the diagram or methodology, liked the characters, etc. 

I would like to add a new option button in the options menu (with the vertical ellipsis icon) of the episode card to open a modal to add/edit the notes associated with the episode. 


## Requirements

- An episode should only have one note. I want you to analyze if it is best to add a new column to the database to store the notes or create a new table for the notes?
- The notes should have a maximum length of characters, and the modal should show how many characters are left. (Propose a max legnth limit to provide good performance and space occupation of the db)
- It should be retro compatible with the current database.
- Add a new button to the episode card to open a modal to add/edit the notes associated with the episode.
- The video cards should have an icon when it has a note associated.
- The modal should be centered in the screen.
- The modal should have a save button and a cancel button.
- The modal should close when the save button is clicked.
- The modal should close when the cancel button is clicked.
- The modal should close when the escape key is pressed.
- The modal should close when the user clicks outside the modal.

