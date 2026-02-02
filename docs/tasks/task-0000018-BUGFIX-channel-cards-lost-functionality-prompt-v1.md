# Task: Channel Cards Lost Functionality

# Task: Channel Cards Lost Functionality

As you can see in the image we have lost some of the expected functionality of the channel cards. In the image there is one card that still has the expected functionality: "Matthew Berman" channel.

- The cards are not showing the correct information: Channel name, description, tags associated with them
- The cards, when clicked on the channel name, should open a new tab to the channel page on YouTube. This is only working for the "Matthew Berman" channel card since the other channel cards are not showing the channel name as a link, nor the description, number of episodes or tags.

I really like the design of the new cards with the image taking the whole space of the card. Let's keep that design but lets improve it with a mix of the old and new design. 

See the first image which shows a design using the approach that i want to reproduce. Lets try to overlay the remaining information on top of the image in a way that is readable and looks good as we are now doing with the delete button and the drag handle. Lets place a nice overlay on top of the drag with the information of the channel: name, description, number of episodes and tags. 
 

---

- The button to "Sync Metadata" is not working as expected. It should be a button that when clicked it will sync the metadata of the channels. When clicked now, it shows an toast error message "Failed to sync channel metadata" and does not provides any more information about the error in the logs.
