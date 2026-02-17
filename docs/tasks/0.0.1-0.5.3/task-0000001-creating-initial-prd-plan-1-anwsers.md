# Responding to the questions for the implementation plan

Here the clarifications for the questions asked:

1. User Authentication & Multi-User Support
The PoC should be strictly single-user (no auth at all), but design the database schema to accommodate future multi-user support in the future

2. Video Metadata Scope
We should use yt-dlp to extract metadata for:
- Title, description, channel name, duration, thumbnail URL, upload date, published date, video url, youtube video id, tags, etc
- We should also store the channel information separately (for potential future "subscribe to channel" features)

3. Sharing Flow Details
For the iOS share feature, should the PoC include: i do not think we need a custom share extension for iOS. But the web app should have an endpoint that can be invoked by a custom iOS shortcut (a simple post curl will do the job) that send the required parameters to the app to trigger adding the video to the list. First it can be only the url of the current video, it would be great if we can also send the tag/folder to associate the video in the app.

4. Reordering & Prioritization
The videos should be ordered by date added, the default order should be to place the latest video on top, but the ui of the webapp should allow the user manual reordering using drag-and-drop

The list in the web app should support multiple sort options (by date added, by priority, by favorite, by duration, alphabetically, etc.)?

5. Watched Status
When a video is marked as "watched," should it should always stay in the same tag category but be visually distinct. We must mark it with a property "watched" that is a boolean. "Not watched" is the default value. "Watched" is the value when the user marks a video as watched.

6. Deployment Target
Docker Compose setup MUST be production-ready but it will be deployed locally on a macbook. 

7. Testing Strategy
For the PoC, what testing depth do you want?
- Unit tests for services/utilities only?
- Integration tests for API endpoints?


8. yt-dlp Service Scope
We will use `yt-dlp` library only to access videos metadata. We are not downloading any video or audio. The app will only store the metadata in the database and will not download any video or audio. It will have a link to play the video in the YouTube app or website using the default browser. In iOS it should open the YouTube iOS native app if installed on the device, otherwise it should open the YouTube website in the default browser.


NEW FEATURES:

From the questions, I also have more requirements:
- We should be able to have a list with the list of all channels of the videos registered by the user in our app. Everytime we upload a video we get the channel info, and we store it in the database. If the channel is already in the database, we don't add it again. If it's not, we add it. We should also store the channel thumbnail url, channel name, channel id, channel url, and channel description.
- Model the following concepts:
    - priority: videos can be marked as high priority, medium priority, low priority, or no priority. This is a relative priority that the user can set for each video. Videos then must be ordered in the list by priority. inside every priority the order is by date added, latest first.
    - favorite: videos can be marked as favorite or not. This is a boolean flag that the user can set for each video. Favorite videos are always on top of the list, and inside the favorite videos the order is by date added, latest first.
- The app should have a list for all videos to watch later and a nice UX/UI to easily select watched and favorite videos



