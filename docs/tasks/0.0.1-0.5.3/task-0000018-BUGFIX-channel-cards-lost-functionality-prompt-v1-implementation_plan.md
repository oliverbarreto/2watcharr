# Implementation Plan: Channel Sync Improvements

## Overview

This plan addresses three improvements to the channel metadata sync feature based on user feedback.

---

## 1. Allow Non-Admin Users to Sync Metadata

### Current Situation
- Sync button is hidden for non-admin users
- API endpoint rejects non-admin requests with 401

### Proposed Change
**Enable sync for all authenticated users**

**Rationale:**
- Channels are shared resources across all users
- Metadata updates (name, description, thumbnail) benefit everyone
- No destructive operations are performed
- Similar to how any user can add episodes from channels

**Implementation:**
- Remove `isAdmin` check from [channels/page.tsx](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/app/channels/page.tsx)
- Remove `isAdmin` check from [api/channels/sync/route.ts](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/app/api/channels/sync/route.ts)
- Keep authentication requirement (must be logged in)

**Complexity:** Low (5 minutes)

---

## 2. Background Processing for Long-Running Sync

### Problem
- Syncing many channels takes time (yt-dlp spawns for each channel)
- User navigates away → progress lost
- No feedback on progress
- Blocks user from other activities

### Options Analysis

#### Option A: Simple Database-Backed Job Tracking (RECOMMENDED)
**How it works:**
1. API creates a job record in SQLite with status tracking
2. Immediately returns `jobId` to client
3. Sync runs asynchronously in Node.js (no external service needed)
4. Client polls `/api/jobs/{jobId}` for status updates
5. Shows progress toast/notification

**Pros:**
- ✅ No new infrastructure required
- ✅ Works with current SQLite database
- ✅ Simple to implement
- ✅ Works in Docker deployment
- ✅ User can navigate away and check back later

**Cons:**
- ⚠️ Limited to single server (not horizontally scalable)
- ⚠️ Server restart loses in-flight jobs
- ⚠️ Polling creates some overhead

**Implementation outline:**
```sql
CREATE TABLE sync_jobs (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  status TEXT, -- 'pending', 'running', 'completed', 'failed'
  total_channels INTEGER,
  synced_channels INTEGER,
  error_message TEXT,
  created_at INTEGER,
  updated_at INTEGER
);
```

#### Option B: Server-Sent Events (SSE)
**How it works:**
- API endpoint streams updates via SSE
- Client receives real-time progress updates
- No polling needed

**Pros:**
- ✅ Real-time updates
- ✅ More efficient than polling
- ✅ No additional infrastructure

**Cons:**
- ⚠️ User navigates away → connection lost
- ⚠️ More complex error handling
- ⚠️ Not suitable for long jobs (hours)

#### Option C: External Service (Trigger.dev, Inngest, etc.)
**Pros:**
- ✅ Highly reliable
- ✅ Built-in monitoring/retries
- ✅ Scales well

**Cons:**
- ❌ Requires external service/account
- ❌ Adds complexity to deployment
- ❌ May incur costs
- ❌ Overkill for this use case

### Recommendation: **Option A** (Database-Backed Job Tracking)

**Reasoning:**
- Matches current infrastructure (SQLite + Docker)
- No external dependencies
- Acceptable trade-offs for this use case
- Users likely have < 100 channels

---

## 3. YouTube API vs yt-dlp

### Current Approach: yt-dlp
```bash
yt-dlp --no-download --dump-single-json --flat-playlist "https://youtube.com/channel/..."
```

**Issues:**
- Spawns external process for each channel
- Slow (5-10 seconds per channel)
- Can fail due to YouTube anti-bot measures
- Requires yt-dlp installation
- Large JSON output can exceed buffer

### Proposed Approach: YouTube Data API v3

#### API Details
**Endpoint:** `https://www.googleapis.com/youtube/v3/channels`

**Sample Request:**
```
GET https://www.googleapis.com/youtube/v3/channels
  ?part=snippet,brandingSettings
  &id=CHANNEL_ID
  &key=YOUR_API_KEY
```

**Response includes:**
- Channel name
- Description
- Thumbnails (multiple sizes)
- Custom URL
- Published date
- Country

**Quota Cost:** 1 unit per request  
**Daily Limit:** 10,000 units (default free tier)  
**Cost per channel sync:** If you have 100 channels, one sync = 100 units (1% of daily quota)

#### Implementation Plan

**New Service:** `YouTubeApiService`

```typescript
class YouTubeApiService {
  private apiKey: string;
  
  async getChannelMetadata(channelId: string): Promise<ChannelMetadata> {
    const url = `https://www.googleapis.com/youtube/v3/channels?part=snippet,brandingSettings&id=${channelId}&key=${this.apiKey}`;
    const response = await fetch(url);
    const data = await response.json();
    // Parse and return
  }
}
```

**Environment Variable:**
```bash
YOUTUBE_API_KEY=your_key_here  # Optional
```

**Fallback Strategy:**
- If `YOUTUBE_API_KEY` is set → use YouTube API
- If not set → fallback to yt-dlp (current behavior)
- Log warning if API key not configured

**Migration:**
- Keep yt-dlp code as fallback
- Update `MetadataService.extractChannelMetadata()` to try API first
- Document API key setup in README

#### Pros vs Cons

**YouTube API Pros:**
- ⚡ **10-50x faster** (HTTP request vs spawning process)
- 🎯 More reliable (official API)
- 📦 No external binary dependency
- 🔒 Less likely to be blocked
- 💰 Free for reasonable use (10K daily quota)

**YouTube API Cons:**
- 🔑 Requires API key setup
- 📊 Quota limits (but generous for this use case)
- 🌐 Requires internet access (same as yt-dlp)

**Recommendation:** Implement YouTube API with yt-dlp fallback

---

## Implementation Phases

### Phase 1: Quick Wins (Immediate)
**Tasks:**
1. Remove admin-only restriction from sync button/API
2. Increase yt-dlp buffer size (already done)

**Effort:** 10 minutes  
**Impact:** Makes sync available to all users

### Phase 2: Background Jobs (Short-term)
**Tasks:**
1. Create `sync_jobs` table migration
2. Add job tracking repository
3. Modify sync API to create job and return immediately
4. Implement async sync worker
5. Add polling endpoint `/api/jobs/{id}`
6. Update UI for polling and progress display

**Effort:** 4-6 hours  
**Impact:** Non-blocking sync, better UX

### Phase 3: YouTube API (Medium-term)
**Tasks:**
1. Get YouTube API key
2. Create `YouTubeApiService`
3. Update [MetadataService](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/lib/services/metadata.service.ts#5-56) with fallback logic
4. Add environment configuration
5. Update documentation

**Effort:** 2-3 hours  
**Impact:** 10-50x faster sync, more reliable

---

## User Review Required

> [!IMPORTANT]
> **Questions for approval:**
> 
> 1. **Non-admin access:** Approve removing admin restriction?
> 2. **Background jobs:** Is Option A (database-backed polling) acceptable? Or prefer SSE (Option B)?
> 3. **YouTube API:** Are you willing to create a free Google Cloud project and API key?
> 4. **Implementation order:** Agree with phased approach above?

---

## Recommended Approach

**My recommendation:**

1. ✅ **Phase 1 now** - Remove admin restriction (5 min)
2. ✅ **Phase 3 next** - Add YouTube API support (2-3 hrs)
   - Much bigger performance win
   - Simpler than background jobs
   - Makes background jobs less critical
3. ⏸️ **Phase 2 optional** - Only if sync still feels slow after YouTube API

**Reasoning:** With YouTube API, syncing 50 channels might take 5-10 seconds instead of 5-10 minutes. At that speed, background jobs become less critical.

---

## Testing Plan

### Phase 1
- Verify non-admin users can trigger sync
- Verify sync works correctly

### Phase 2 (if implemented)
- Test job creation and status tracking
- Test navigation away and back
- Test concurrent sync requests
- Test server restart behavior

### Phase 3
- Test API key validation
- Test fallback to yt-dlp when API fails
- Test quota limit handling
- Compare sync speed: API vs yt-dlp
