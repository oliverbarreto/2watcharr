# Initial Product Requirements Document to create a PoC for an App idea
- Session File: @file-name:
- IDE: Antigravity
- Date: 2026-01-26
- Model: Claude Sonnet 4.5


I want to create a PoC project to: createa an app that allows a user to manage its own private list of "Watch Later" videos (Youtube initially but can be extended to other platforms or websites).

## Requeriments

The idea is to build a web application that allows users to manage their Youtube favorites and subscriptions in one place.

### Main Idea

The main idea is that the user should be able to:

- have a place where he can easily keep track of a list of videos he wants to watch later categorized by tags
- the basic flow will be that me as a user want to use Youtube app and use the share button in my iPhone to send a video url to the app to watch later
- the app should then parse the url and extract the video id and title and a few more pieces of metadata using `yt-dlp` library and add it to the list of videos to watch later
- the app should also allow me to add a tag to the video (those will be my own tags or categories like music, personal develompent, ai, politics, news, etc.)
- the app should keep metadata about the videos we upload (date created, edited, etc...) 
- Then the user should have a place where he can easily access the list of all videos and be able to filter them by tag, or search for a specific video using text for the title/desccriptiojn/channel name/date...
- The list should allow the user to mark a video as watched and move it to a different category, also to delete it and to reorder the list. This is an important feature for the user to be able to keep track of the videos he wants to watch later and prioritize them.
- The user can then access the list from the browser (or from the mobile app in the future) from his phone or computer and launch individual videos in the Youtube app when on iPhone or iPad or on Android devices and on the browser when on the PC.

### Tech Stack

The app should now be for a single user and it should rely on the following tech stack
- react and nextjs
- tailwindcss
- shadcn ui
- typescript
- sqlite
- docker
- docker compose
- yt-dlp

Future features:
- Login with their Google/github/appleID or other accounts using Auth

## Tasks

- Do not create any conde yet, just focus on creating an implementation plan with phases, tasks and smaller subtasks. 
- The plan will be implemented by an AI assistant so it must have clear objectives and success criteria
- We want to use separation of responsability and modularity principles of Clean Arquitecture, but not overcomplicate it. Just be practical. Separate responsabilities for example for:
1. to create a service that takes the three parameters (url, language and quality) as input and that checks availability first 
2. to create a "download service" that takes the three parameters (url, language and quality) as input 
- We want to use docker compose to deploy the app locally
- We want to also use a strict methodology where: 
1. We want to always create proper tests to validate new features and tasks in the plan 
2. We want to create proper logging for the app 
3. We want to create proper documentation for the app 
4. we want to keep track of the evolution of the project by keeping a changelog markdown file and by having a list of features for the app in a json file. We want to follow the methodology in https://keepachangelog.com/en/1.1.0/

## Development Guidelines

### Creating Tests

Always create unit tests for new features. Tests must pass to consider the feature completed or bug fixed.

### Feature Release Process

When a feature is complete or we fix a bug:

1.  **Update Tracking**: Add the feature to `docs/tracking/features.json` or bug to `docs/tracking/bugs.json`.

Example of `docs/tracking/features.json`:
```json
[
  {
    "id": "feature-001",
    "title": "YouTube Audio Download",
    "description": "Core functionality to download audio from YouTube videos using yt-dlp.",
    "date": "2025-12-11",
    "version": "0.1.0",
    "tags": ["core", "download", "yt-dlp"]
  },
  {
    "id": "feature-002",
    "title": "Language Selection",
    "description": "Ability for users to specify a preferred language code (e.g., 'en', 'es') for the audio track.",
    "date": "2025-12-11",
    "version": "0.1.1",
    "tags": ["core", "language"]
  }
]
```

Example of `docs/tracking/bugs.json`:
```json
[
  {
    "id": "bug-001",
    "title": "yt-dlp Download Error",
    "description": "Fixed 'Requested format is not available' and 'challenge solving failed' errors by updating runtime dependencies.",
    "date": "2025-12-11",
    "version": "0.1.0",
    "status": "fixed"
  },
  {
    "id": "bug-002",
    "title": "Default Language Selection",
    "description": "Ensure default behavior prioritizes original audio when no language is specified, instead of arbitrary language selection.",
    "date": "2025-12-11",
    "version": "0.1.0",
    "status": "fixed"
  }
]
```

2.  **Update Changelog**: Add an entry to `CHANGELOG.md` under `[Unreleased]` or a new version header. Follow [Keep a Changelog](https://keepachangelog.com/en/1.0.0/) format.
3.  **Versioning**: Determine the semantic version (Major, Minor, Patch).
4.  **Commit**: Commit changes with a descriptive message.
5.  **Tag**: Tag the commit with the version number (e.g., `git tag v0.4.0`).
6.  **Push**: Push the commit and tags.

## Planning

The goal is to plan a detailed PoC implementation plan markdown document. Ask any questions your might need to better understand the goal of this project and to have a clear vision of the project, goals, scope and features before actually creating the implementation plan.

