# Implementation Plan: LabcastARR Integration

This feature integrates 2watchARR with LabcastARR to automatically or manually send episodes from 2watchARR to a LabcastARR channel. It is designed to be multi-tenant, allowing different users to have their own integrations, and allowing a single user to configure multiple integrations (e.g., sending videos with the tag `Podcast A` to Channel A, and videos with the tag `Podcast B` to Channel B).

## Proposed Changes

### Database & Models
- We will add a new table `labcastarr_integrations` in the database schema to store the integration settings per user.
- **Fields**: `id`, `user_id` (foreign key to `users`), `enabled`, `api_url`, `api_token`, `channel_id`, `auto_tag`, `audio_quality`, `audio_language`, `created_at`, `updated_at`.
- Because multiple channels can be configured by a single user, this table will have a one-to-many relationship with the user.
- The `api_token` will be securely stored (encrypted at rest if the environment supports an encryption key, otherwise securely isolated).
- Create corresponding repository and service classes in `src/lib/repositories` and `src/lib/services`.

---
### Settings UI
#### [MODIFY] src/app/settings/page.tsx
- Add a new `TabsTrigger` and `TabsContent` for "Integrations".
- Within the "Integrations" tab, list the user's configured LabcastARR integrations.
- Add a button to "Add New Integration".
- The form for an integration will include: enabled toggle, API URL, API Token, LabcastARR Channel ID, Auto Tag (e.g., `2WatchARR`), Audio Quality, and Audio Language.
- Implement the "Test connection" button functionality that calls standard LabcastARR endpoints.
- Allow users to edit or delete their configured integrations.

---
### API Integration
#### [NEW] src/app/api/settings/integrations/labcastarr/route.ts
- Create API endpoints (`GET`, `POST`, `PUT`, `DELETE`) to manage the user's multi-tenant LabcastARR integration settings securely.
#### [NEW] src/app/api/integrations/labcastarr/route.ts
- Create an API route in 2watchARR to handle "Send to LabcastARR" requests from the UI.
- Implement API client logic in `src/lib/integrations/labcastarr.client.ts` implementing `POST /v1/integration/episodes` and `/v1/integration/episodes/bulk`.

---
### Episode UI and Flow
#### [MODIFY] src/components/features/episodes/episode-card.tsx & src/components/features/episodes/episode-list-row.tsx
- Add a distinctive icon/badge next to the tag pill if the episode has a tag that matches *any* of the user's active LabcastARR integrations.
- Add the "Send to LabcastARR" action in the context menu if the episode has a valid YouTube URL. If the user has multiple integrations, this might open a submenu or a small dialog to select *which* channel to send to.
#### [MODIFY] src/app/episode/[id]/page.tsx (or equivalent episode details wrapper)
- Include "Send to LabcastARR" action with target channel selection.
- Show a user-friendly toast notification when sending to LabcastARR fails or succeeds.

---
### Tags and Automation
#### [MODIFY] src/lib/services/media.service.ts
- Intercept when an episode is added (e.g., in `addEpisodeFromUrl` or `saveEpisodeFromMetadata`), or when tags are updated.
- Check if the added tags include any of the `auto_tag`s configured in the user's active LabcastARR integrations. If a match is found, trigger the API call to schedule it for the corresponding LabcastARR channel.
#### [MODIFY] src/app/settings/page.tsx (Tags section)
- Add a new "Send to LabcastARR" bulk button next to the tag's delete option.
- Implement a modal for confirmation. If the user has multiple integrations, the modal will ask which LabcastARR channel they want to send the episodes to.

## Verification Plan

### Automated Tests
- Run existing test suites (`npm run test`) to ensure no regressions.
- Write unit tests for the repositories and the new `LabcastarrClient`.

### Manual Verification
1. Log in as a user, go to `Settings -> Integrations`, and create two different LabcastARR integrations with different tags and channel IDs.
2. Verify connection tests work for both.
3. Add a video with the tag for Integration 1 and verify it auto-sends to Channel 1.
4. Open an episode's menu, click "Send to LabcastARR", choose Channel 2, and verify it sends correctly.
5. In `Settings -> Tags`, click the bulk send button, select Channel 1, and ensure the confirmation modal and bulk sending behavior works.
