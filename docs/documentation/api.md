# API Documentation

Base URL: `/api`

## Videos

### List Videos
GET `/api/videos`

Fetch a list of videos with optional filtering and sorting.

**Query Parameters:**
- `tags`: Comma-separated list of tag IDs
- `search`: Search query (title, description, channel)
- `watched`: `true` or `false`
- `favorite`: `true` or `false`
- `channelId`: Filter by channel ID
- `sort`: Sort field (`created_at`, `priority`, `favorite`, `duration`, `title`)
- `order`: Sort order (`asc`, `desc`)

**Response:**
```json
{
  "videos": [
    {
      "id": "uuid",
      "title": "Video Title",
      "videoUrl": "https://youtube.com/...",
      "watched": false,
      "favorite": true,
      "priority": "medium",
      ...
    }
  ],
  "total": 15
}
```

### Add Video
POST `/api/videos`

Add a new YouTube video. Metadata is automatically extracted.

**Body:**
```json
{
  "url": "https://www.youtube.com/watch?v=VIDEO_ID",
  "tagIds": ["optional-tag-uuid"]
}
```

### Get Video
GET `/api/videos/:id`

Get details for a single video.

### Update Video
PATCH `/api/videos/:id`

Update video properties.

**Body:**
```json
{
  "watched": true,
  "favorite": false,
  "priority": "high",
  "tagIds": ["tag-uuid-1", "tag-uuid-2"]
}
```

### Delete Video
DELETE `/api/videos/:id`

Permanently delete a video.

### Reorder Videos
POST `/api/videos/reorder`

Update the custom order of videos.

**Body:**
```json
{
  "videoIds": ["uuid-1", "uuid-2", "uuid-3"]
}
```

## Channels

### List Channels
GET `/api/channels`

Get all channels with video counts.

**Response:**
```json
{
  "channels": [
    {
      "id": "UC...",
      "name": "Channel Name",
      "videoCount": 5
    }
  ]
}
```

## Tags

### List Tags
GET `/api/tags`

Get all tags with video counts.

### Create Tag
POST `/api/tags`

**Body:**
```json
{
  "name": "Music",
  "color": "#ff0000"
}
```

### Delete Tag
DELETE `/api/tags/:id`

## iOS Integration

### Add Video from Shortcut
POST `/api/shortcuts/add-video`

Simplified endpoint for iOS Shortcuts. `tag` creates a new tag if it doesn't exist.

**Body:**
```json
{
  "url": "https://youtube.com/...",
  "tag": "Watch Later"
}
```
