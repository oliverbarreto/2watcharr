# LabCastARR Integration API Guide

**Version:** 1.1.3
**Last Updated:** 2026-03-04

This guide is for developers building external integrations with LabCastARR — for example, n8n workflows, custom scripts, or home automation pipelines that automatically create podcast episodes from YouTube URLs.

---

## Table of Contents

- [LabCastARR Integration API Guide](#labcastarr-integration-api-guide)
  - [Table of Contents](#table-of-contents)
  - [Overview](#overview)
  - [Prerequisites](#prerequisites)
  - [Step 1: Generate Your Integration Token](#step-1-generate-your-integration-token)
  - [Authentication](#authentication)
  - [Base URL](#base-url)
  - [Endpoints](#endpoints)
    - [Create a Single Episode](#create-a-single-episode)
      - [Request](#request)
      - [Request Fields](#request-fields)
      - [Response — 201 Created](#response--201-created)
    - [Create Multiple Episodes (Bulk)](#create-multiple-episodes-bulk)
      - [Request](#request-1)
      - [Request Fields](#request-fields-1)
      - [Response — 200 OK](#response--200-ok)
      - [Result Fields](#result-fields)
  - [Episode Processing](#episode-processing)
  - [Error Responses](#error-responses)
    - [Common 401 Causes](#common-401-causes)
  - [Token Management](#token-management)
  - [Security Notes](#security-notes)
  - [Examples](#examples)
    - [curl](#curl)
    - [Python](#python)
    - [n8n Workflow](#n8n-workflow)

---

## Overview

LabCastARR exposes a set of **integration endpoints** that let external applications create podcast episodes without going through the web UI. This is useful for:

- **Automation workflows** (n8n, Make, Zapier) that watch YouTube channels and auto-publish episodes
- **Custom scripts** that batch-import videos from a playlist
- **Home automation** pipelines that trigger episode creation from other events

External apps authenticate using a **user-generated integration token** (not a password or JWT). Each user has one active token at a time, managed from **Settings → Integration** in the LabCastARR UI.

---

## Prerequisites

- A running LabCastARR instance (self-hosted)
- A user account on that instance with at least one channel already created
- Network access to the LabCastARR API from your integration environment

---

## Step 1: Generate Your Integration Token

1. Log in to your LabCastARR instance
2. Go to **Settings → Integration** tab
3. Toggle **Enable API Access** to ON
4. A token will be generated and displayed — **copy it immediately**
5. Store it securely (password manager, environment variable, or secret vault)

> **Important:** The full token is only shown once at generation time. If you lose it, use the **Regenerate** button to issue a new one (the old token becomes invalid immediately).

The token display in the UI shows a masked format: `abcd****...****wxyz`. Only the first and last 4 characters are visible. The token itself is ~64 characters.

---

## Authentication

All integration endpoints require the `X-Integration-Token` header:

```http
X-Integration-Token: YOUR_FULL_TOKEN_HERE
```

There is no bearer prefix or any other wrapper — just the raw token string.

> **Note:** The `X-API-Key` header used for the LabCastARR web UI is separate and is **not** required for integration endpoints. Integration endpoints use only `X-Integration-Token`.

---

## Base URL

Replace `<your-instance>` with your LabCastARR API URL:

| Environment              | Base URL                     |
| ------------------------ | ---------------------------- |
| Self-hosted (production) | `https://api.yourdomain.com` |
| Local development        | `http://localhost:8000`      |

All integration endpoints are under the `/v1/integration/` prefix.

---

## Endpoints

### Create a Single Episode

**`POST /v1/integration/episodes`**

Creates one podcast episode from a YouTube URL. The video is queued for download immediately after creation.

#### Request

```http
POST /v1/integration/episodes
X-Integration-Token: YOUR_TOKEN
Content-Type: application/json
```

```json
{
  "channel_id": 1,
  "video_url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
  "tags": ["tech", "interview"],
  "audio_language": "en",
  "audio_quality": "high"
}
```

#### Request Fields

| Field            | Type     | Required | Description                                                                                                 |
| ---------------- | -------- | -------- | ----------------------------------------------------------------------------------------------------------- |
| `channel_id`     | integer  | **Yes**  | ID of the target channel. Must belong to your account.                                                      |
| `video_url`      | string   | **Yes**  | Full YouTube URL. Accepted formats: `youtube.com/watch?v=…`, `youtu.be/…`                                   |
| `tags`           | string[] | No       | Tags to attach to the episode. Max 10 tags, max 50 characters each. Default: `[]`                           |
| `audio_language` | string   | No       | ISO 639-1 language code for the audio track (e.g. `"en"`, `"es"`, `"de"`). Uses channel default if omitted. |
| `audio_quality`  | string   | No       | One of `"low"`, `"medium"`, `"high"`. Uses channel default if omitted.                                      |

#### Response — 201 Created

```json
{
  "id": 42,
  "channel_id": 1,
  "video_id": "dQw4w9WgXcQ",
  "video_url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
  "title": "Never Gonna Give You Up",
  "description": "...",
  "status": "pending",
  "thumbnail_url": "https://i.ytimg.com/vi/dQw4w9WgXcQ/maxresdefault.jpg",
  "duration_seconds": 212,
  "tags": ["tech", "interview"],
  "audio_language": "en",
  "audio_quality": "high",
  "created_at": "2026-03-04T10:00:00Z"
}
```

The episode is created with `status: "pending"` and audio download begins asynchronously. See [Episode Processing](#episode-processing) for status tracking.

---

### Create Multiple Episodes (Bulk)

**`POST /v1/integration/episodes/bulk`**

Creates multiple episodes in a single request. URLs are processed sequentially. Partial failures are tolerated — if one URL fails, the rest still proceed.

#### Request

```http
POST /v1/integration/episodes/bulk
X-Integration-Token: YOUR_TOKEN
Content-Type: application/json
```

```json
{
  "channel_id": 1,
  "video_urls": [
    "https://www.youtube.com/watch?v=VIDEO_ID_1",
    "https://www.youtube.com/watch?v=VIDEO_ID_2",
    "https://www.youtube.com/watch?v=VIDEO_ID_3"
  ],
  "tags": ["batch-import"],
  "audio_quality": "medium"
}
```

#### Request Fields

| Field            | Type     | Required | Description                                                            |
| ---------------- | -------- | -------- | ---------------------------------------------------------------------- |
| `channel_id`     | integer  | **Yes**  | Target channel ID                                                      |
| `video_urls`     | string[] | **Yes**  | 1 to 50 YouTube URLs                                                   |
| `tags`           | string[] | No       | Tags applied to **all** episodes in this batch                         |
| `audio_language` | string   | No       | Applied to all episodes in the batch. Uses channel default if omitted. |
| `audio_quality`  | string   | No       | Applied to all episodes in the batch. Uses channel default if omitted. |

#### Response — 200 OK

The response is always 200 OK regardless of partial failures. Inspect each `result` entry:

```json
{
  "results": [
    {
      "video_url": "https://www.youtube.com/watch?v=VIDEO_ID_1",
      "success": true,
      "episode_id": 43,
      "error": null
    },
    {
      "video_url": "https://www.youtube.com/watch?v=VIDEO_ID_2",
      "success": false,
      "episode_id": null,
      "error": "Episode with this video URL already exists"
    },
    {
      "video_url": "https://www.youtube.com/watch?v=VIDEO_ID_3",
      "success": true,
      "episode_id": 44,
      "error": null
    }
  ],
  "created": 2,
  "failed": 1
}
```

#### Result Fields

| Field        | Type            | Description                                          |
| ------------ | --------------- | ---------------------------------------------------- |
| `video_url`  | string          | The URL that was processed                           |
| `success`    | boolean         | `true` if the episode was created                    |
| `episode_id` | integer or null | ID of the created episode, or `null` on failure      |
| `error`      | string or null  | Human-readable error message if `success` is `false` |
| `created`    | integer         | Total number of successfully created episodes        |
| `failed`     | integer         | Total number of failed URLs                          |

---

## Episode Processing

Episodes are processed **asynchronously**. The API returns immediately after creating the episode record with `status: "pending"`. Audio download and processing happen in the background.

**Episode status values:**

| Status        | Meaning                                        |
| ------------- | ---------------------------------------------- |
| `pending`     | Queued for download                            |
| `downloading` | Audio is being extracted from YouTube          |
| `processing`  | Audio is being converted/processed             |
| `completed`   | Episode is ready and available in the RSS feed |
| `failed`      | Processing failed (retryable from the UI)      |

To check progress programmatically, poll the episode endpoint (requires standard JWT authentication — this is handled by the LabCastARR UI, not typically called by integrations):

```
GET /v1/episodes/{episode_id}/progress
```

For most automation use cases, you can simply fire-and-forget: create the episode and trust LabCastARR to process it. Errors will appear in the LabCastARR events log.

---

## Error Responses

All errors return JSON with a `detail` field:

```json
{ "detail": "Human-readable explanation of the error" }
```

| HTTP Status                 | When it occurs                                                                                            |
| --------------------------- | --------------------------------------------------------------------------------------------------------- |
| `401 Unauthorized`          | `X-Integration-Token` header is missing or the token is invalid/revoked                                   |
| `400 Bad Request`           | Request body failed validation (bad URL format, field out of range, etc.)                                 |
| `404 Not Found`             | The specified `channel_id` does not exist                                                                 |
| `422 Unprocessable Entity`  | The YouTube URL is valid but the video couldn't be processed (private, age-restricted, unavailable, etc.) |
| `500 Internal Server Error` | Unexpected server error — check LabCastARR logs                                                           |

### Common 401 Causes

- Token was revoked (user clicked "Disable" or "Regenerate" in Settings)
- Token was never generated for this user
- Typo or truncation in the token string
- Wrong instance URL

---

## Token Management

Token lifecycle is managed by the **account owner** through the LabCastARR UI at **Settings → Integration**. The following API endpoints exist but require a JWT session (logged-in browser session) — they are not intended for use by external integrations:

| Method   | Endpoint                           | Description                                           |
| -------- | ---------------------------------- | ----------------------------------------------------- |
| `GET`    | `/v1/integration/token`            | Check if integration is enabled; returns masked token |
| `POST`   | `/v1/integration/token`            | Enable integration and generate a new token           |
| `DELETE` | `/v1/integration/token`            | Disable integration and revoke the token              |
| `POST`   | `/v1/integration/token/regenerate` | Revoke current token and issue a new one              |

**When to regenerate:** If you suspect a token has been leaked, use the Regenerate button immediately. The old token stops working within seconds.

---

## Security Notes

- **One token per user:** Each user account has at most one active integration token. Regenerating creates a new token and invalidates the previous one.
- **Token storage:** LabCastARR stores only a SHA-256 hash of your token — the raw value is never persisted on the server.
- **No expiry:** Tokens do not expire automatically. Revoke them manually when no longer needed.
- **HTTPS required in production:** Always use HTTPS in production deployments to prevent token interception.
- **Least privilege:** Integration tokens can only create episodes and are scoped to the account that generated them. They cannot access other users' data.

---

## Examples

### curl

**Create a single episode:**

```bash
curl -X POST https://api.yourdomain.com/v1/integration/episodes \
  -H "X-Integration-Token: YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "channel_id": 1,
    "video_url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    "tags": ["music"],
    "audio_quality": "high"
  }'
```

**Bulk create from a list of URLs:**

```bash
curl -X POST https://api.yourdomain.com/v1/integration/episodes/bulk \
  -H "X-Integration-Token: YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "channel_id": 1,
    "video_urls": [
      "https://www.youtube.com/watch?v=VIDEO_ID_1",
      "https://www.youtube.com/watch?v=VIDEO_ID_2"
    ]
  }'
```

---

### Python

```python
import httpx

LABCASTARR_URL = "https://api.yourdomain.com"
INTEGRATION_TOKEN = "your-token-here"

headers = {
    "X-Integration-Token": INTEGRATION_TOKEN,
    "Content-Type": "application/json",
}

# Create a single episode
response = httpx.post(
    f"{LABCASTARR_URL}/v1/integration/episodes",
    headers=headers,
    json={
        "channel_id": 1,
        "video_url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        "tags": ["tech"],
        "audio_quality": "high",
    },
)
response.raise_for_status()
episode = response.json()
print(f"Created episode #{episode['id']}: {episode['title']}")
```

```python
# Bulk create and handle partial failures
response = httpx.post(
    f"{LABCASTARR_URL}/v1/integration/episodes/bulk",
    headers=headers,
    json={
        "channel_id": 1,
        "video_urls": [
            "https://www.youtube.com/watch?v=VIDEO_ID_1",
            "https://www.youtube.com/watch?v=VIDEO_ID_2",
        ],
    },
)
response.raise_for_status()
result = response.json()

print(f"Created: {result['created']}, Failed: {result['failed']}")
for item in result["results"]:
    if item["success"]:
        print(f"  OK  episode #{item['episode_id']} — {item['video_url']}")
    else:
        print(f"  FAIL {item['video_url']} — {item['error']}")
```

---

### n8n Workflow

Use the **HTTP Request** node in n8n to integrate with LabCastARR.

**Node configuration for single episode creation:**

| Setting                       | Value                                                |
| ----------------------------- | ---------------------------------------------------- |
| Method                        | `POST`                                               |
| URL                           | `https://api.yourdomain.com/v1/integration/episodes` |
| Authentication                | None (handled via header)                            |
| Header: `X-Integration-Token` | `{{ $env.LABCASTARR_TOKEN }}`                        |
| Header: `Content-Type`        | `application/json`                                   |
| Body (JSON)                   | See below                                            |

```json
{
  "channel_id": 1,
  "video_url": "{{ $json.video_url }}"
}
```

**Tip:** Store your token as an n8n credential or environment variable rather than hardcoding it in the node.

**Error handling in n8n:** Set **On Error** to "Continue" and check `{{ $json.detail }}` from the error response to log failures without stopping the workflow.

---

_For questions about the LabCastARR API, see the full [API Reference](./03-API-REFERENCE.md) or open an issue in the project repository._
