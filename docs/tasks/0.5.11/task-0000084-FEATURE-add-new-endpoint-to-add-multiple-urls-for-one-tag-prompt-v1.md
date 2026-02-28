# TASK: Add new endpoint to add multiple urls for one tag
- IDE: Antigravity - Agent Mode
- Date: 2026-02-22
- Model: Gemini 3 Flash


## Overview

We want to add a new endpoint to add multiple Youtube video URLs for one tag. This endpoint should be exposed and secured by an API token like the one we already have that allows adding new episodes from iOS Shortcuts and Browser extention.

The endpoint should be called "api/shortcuts/add-videos" and should accept a list of objects with a url and tag for each video url.


## Requirements

- The operation should be able to handle multiple URLs, and for each URL it should try to extract the metadata and create a new episode. 
- If the URL is a video URL, it should create a new video and add the episode to the database. 
- The endpoint should be able to handle only video url. We will create a separate endpoint to handle channel urls.
- The endpoint should check for valid video or short urls and reject invalid urls.
- The endpoint must handle CORS like the existing /add-episode endpoint.
- The end point should accept a list of objects with a url and tag for each url.
- The endpoint will add all the videos it can, and report back to the caller a list with all the urls and the status of the operation for each url. If it can't add a video, it should report NOK and the reason. If it can add a video, it should report OK. There is no need to return the id of the new video since we have the url.
- Videos can be added without any tag, but not with multiple tags. Tags can already exist, in that case the video should be added to the existing tag. If the tag does not exist, it should be created.
- We should handle errors gracefully and return a meaningful error message to the caller.
- We should provide a way to notify the client that the operation is executing and when it is done, preferably using async mechanism.

## Validation
- Create and execute tests using a max of 3 urls to test the new api endpoint. 


---

# V2

Did you create a test that is ran with the validation vitest everytime we want to run test before releaseing for production ? If not, create them and document with other tests