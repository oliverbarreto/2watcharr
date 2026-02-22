# TASK: Add new endpoint to add multiple urls for one tag
- IDE: Antigravity - Agent Mode
- Date: 2026-02-22
- Model: Gemini 3 Flash


## Overview

We want to add a new endpoint to add multiple Youtube video URLs for one tag. This endpoint should be exposed and secured by an API token like the one we already have that allows adding new episodes from iOS Shortcuts and Browser extention.

## Requirements

- The operation should be able to handle multiple URLs, and for each URL it should try to extract the metadata and create a new episode. 
- If the URL is a video URL, it should create a new video and add the episode to the database. 
- The endpoint should be able to handle only video url. We will create a separate endpoint to handle channel urls.
- The endpoint should check for valid video or short urls and reject invalid urls.
- The endpoint must handle CORS like the existing /add-episode endpoint.
- The end point should accept a list of objects with a url and tag for each url.
- The endpoint will add all the videos it can, and report back to the caller a list with all the urls and the status of the operation for each url. If it can't add a video, it should report NOK and the reason. If it can add a video, it should report OK. There is no need to return the id of the new video since we have the url.