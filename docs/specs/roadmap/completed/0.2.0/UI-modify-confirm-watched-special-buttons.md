# Task: UI modify confirm watched special buttons

## Description

I provide an image that shows the UI for the three states of an episode card in grid view: 
1. Unwatched
2. Watched
3. Pending confirmation

In the grid view, we have some redundant information about pending confirmation of have watched. This is not the case in the list view. 

IMPORTANT: We need only modify how we present the information on screen in grid view for the case of pending confirmation of have watched. We must not update the list view.

IMPORTANT: The UI for the episode card that we display when the episode has been watched, should not be modified. You can see it in another image provided.

## Requirements

- Let's remove some of the pills that are used to show information about the episode in grid view. There are some with redundant information. The UI that shows that the episode is marked as favorite, should be simplified. 
1. We have to remove the pill with the icon and label "Favorite" with white text. We must leave only the star button that marks/unmarks the episode as favorite with the current styles that already exists and displayed a filled icon when marked as favorite.
2. The pill with the icon and label "Pending confirmation of have watched" should be removed. We already have a button for this action "Confirm watched" button.
3. Modify the "Confirm watched" button with the style in the other image. Remove the red background fill in the pill, and let's use red border and red text. 
4. the red border that we display when the episode is marked as pending confirmation of have watched, should be removed.

---

Almost there. A few more changes to the episode card:
- Add a red border to the "Confirm watched" button
- Lets remove the "Watched" button that is displayed on top of the thumbnail, that also shows another button to confirm watched when hovered over.
- Also, lets modify the layout of the image that shows the thumbnail of the episode in the episode card in grid view. Lets remove the padding (padding left and right of the image, and padding top) and make the image fill the top space of the card. See the provided image with a design.