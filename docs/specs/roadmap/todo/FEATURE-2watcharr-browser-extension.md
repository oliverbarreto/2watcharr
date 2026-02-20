# TASK: 2watcharr browser extension

## Overview

We want to build a browser extension for a web app called 2watcharr. This app allows the user to have a watchlist made with youtube videos/shorts and podcasts. The user can add videos/shorts and podcasts to his 2watcharr account using the iOS Shortcuts app. The user can also add videos/shorts and podcasts to his 2watcharr account using the web app. It provides a way to store and manage the user's watchlist outside of Youtube and Apple Podcasts.

The scope of our new browser extension is to help the user in various fronts:

1. we want to allow the user to add videos, shorts and podcasts to his 2watcharr account from the browser instead of manually using the app or iOS Shortcuts. This will allow non-iOS users to add videos to their 2watcharr account.
2. we want to allow the user to download information from Youtube website or Apple Podcasts to update his 2watcharr account with playlists and history of videos/podcasts.

## Scope

The scope of the extension will be focused only on Youtube interactions:

1. should allow the user to add videos and shorts to his 2watcharr account from the browser. We have a token that we already use to accep incoming calls from iOS Shortcuts. We should use the same token for the browser extension.

2. should allow the user to download information from Youtube website to update his 2watcharr account. This includes: 
    - list of playlists from https://www.youtube.com/feed/playlists
    - list of videos in a playlist from eg: https://www.youtube.com/playlist?list=PLuDxp0nv-2x1DQGfIkyAa95orgJi_ojqU
    - watched history (automatically genrated by Youtube) from https://www.youtube.com/feed/history (this is a very long page with all videos watched in the whole history)
    - liked videos (automatically genrated by Youtube) from https://www.youtube.com/playlist?list=LL


## Some considerations:

- Some playlist are very long and the user needs to scroll to load all videos until the end of the page is reached. This should be a manuall interaction by the user, or can the extension scroll down automatically? If complicated i do not see too much firction here.
- We should implement a way to save available information (Title, Description, url, Privacy:private/public, total number of videos, last updated in Youtube, and Thumbnail) of all playlists and also, a way to sync and save all videos in a playlis. 
- The user should select the playlist he wants to sync with 2watcharr and associate it with a tag (tags are equivalent to playlists in 2watcharr). The user can choose to add to an existing tag or create a new tag. We do not expose created tags via a public api, and I think that we should not do it. This will be a manual interaction for the user in the extension. The extension will save videos in the 2watcharr backend with the tag. 
- We should not save videos one by one. 
1. Option 1: We can store locally the list with all urls and the tag in the extension and make calls in the background to the already existing endpoint that is used to add videos to 2watcharr with the iOS shourtcut (setup instructions guide bellow). We should implement a way to show the status of the sync process to the user in the extension. 
2. Option 2: Ideally, the interaction should send a list with all the urls and the tag, and the backend should process in the background and save the videos in the 2watcharr backend with the tag. We should keep a description of the task with all solicited urls and the tag, keeping track of the status of each url (pending, processing, completed, error). This should be visible to the user in the extension.  

We want to implement option 1 for now !!!

## Goals

- [ ] we need to fully understand the scope and requirements of the browser extension
- [ ] We need to analyze the scope and requirements and decide the best technology stack
- [ ] We want to analyze the scope and requirements and create a detailed implementation plan to start the project. The plan should be a phased plan that includes the following:
    - technology stack
    - architecture and components
    - data model
    - api integration
    - background sync process
    - workflow process
    - implementation plan
    - UI/UX design
    - testing plan
    - instructions to setup extension in the browser
- [ ] We want to implement the browser extension 

## Requirements
- [ ] The implementation plan should also include additional Mermaid diagrams when possible to provide more clarity.
- [ ] For the app use Typescript and React
- [ ] For the background sync process use Node.js and Express
- [ ] For the background sync process use local storage if possible. Otherwise we need to investigate if we can use a database to store the list of urls and the tag, or more simple to use a text or markdown file to keep track of the sync process.
- [ ] The extension should be able to run in Chrome (and chrome based browsers), Firefox and Safari.
- [ ] Make it work in all browsers. In order of importance: Chrome, Firefox and finally Safari.


## Reference: iOS Shortcut Setup Guide

This guide will help you set up a robust iOS Shortcut to save YouTube videos to your **2watcharr** list.

### Step-by-Step Setup

Follow these steps to add error handling and progress feedback:

1.  **Receive URLs** from Share Sheet. (If no input: `Continue`).
2.  **Set Variable**: Name it `VideoURL` and set it to the `Shortcut Input`.
3.  **Show Notification** (Progress):
    - Title: `2watcharr`
    - Body: `Añadiendo video: VideoURL...`
4.  **Get Contents of URL**:
    - URL: `http://YOUR_MAC_IP:3000/api/shortcuts/add-episode`
    - Method: `POST`
    - Headers:
        - `Content-Type: application/json`
        - `X-API-Token: YOUR_API_TOKEN` (Paste your token here)
    - Request Body: `JSON`
    - Add Field: `url` (Value: `VideoURL`)
5.  **Get Dictionary from Input**: (Pass the result of the previous action).
6.  **Get Value for Key** `success` in `Dictionary`.
7.  **If `Value` is 1** (or is true):
    - **Show Notification**:
        - Title: `2watcharr`
        - Body: `✅ Se ha añadido el video: VideoURL`
8.  **Otherwise**:
    - **Get Value for Key** `error` in `Dictionary`.
    - **Show Notification**:
        - Title: `2watcharr`
        - Body: `❌ Error al añadir video: VideoURL. Error: Value` (Value here is the error message).
9.  **End If**

### Pro-Tips

#### Troubleshooting

- **Connection Refused**: Double check the IP address. In Terminal, run `ipconfig getifaddr en0` to find your Mac's local IP.
- **Wait Time**: Large video metadata might take a few seconds to process. The progress notification helps confirm it's working.


#### Environment Configuration

For local development use the following variable in the iOS Workflow:

```bash
URL: http://localhost:3000/api/shortcuts/add-episode
```

For production use:

```bash
URL: https://yourdomain.com/api/shortcuts/add-episode
```