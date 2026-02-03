# Task: Fix broken iOS workflow

Currently the workflow for iOS is broken. We need to check if the api is working and if the workflow is correct. Right now we make a call to `https://2watcharr.oliverbarreto.com/api/shortcuts/add-video`

- Method: Post
- Headers: `Content-Type: application/json`
- Request Body: `JSON`
- Add Field: `url` (Value: `VideoURL`), eg: `JSON: {"url": "https://www.youtube.com/watch?v=VIDEO_ID"}`