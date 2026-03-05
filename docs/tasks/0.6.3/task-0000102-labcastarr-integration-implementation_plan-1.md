# Implementation Plan: LabcastARR Integration

This feature integrates 2watchARR with LabcastARR to automatically or manually send episodes from 2watchARR to a LabcastARR channel.

## User Review Required

> [!WARNING]
> We need to decide where to store the LabcastARR integration settings (API URL, Token, etc.). If 2watchARR is single-tenant, we can store it in a `settings` table. If multi-tenant, it should be associated with the `User` model or a `UserSettings` table. I will plan to add it to a `settings` table or the user profile, but please confirm the preferred database approach.

## Proposed Changes

### Database & Models
- We will add a new table or columns in the database schema to store the `LabcastARR` integration settings: `enabled`, `api_url`, `api_token`, `channel_id`, `auto_tag` (default `2WatchARR`), `audio_quality`, `audio_language`.
- Create corresponding repository and service classes in `src/lib/repositories` and `src/lib/services`.

---
### Settings UI
#### [MODIFY] src/app/settings/page.tsx
- Add a new `TabsTrigger` and `TabsContent` for "Integrations".
- Add the LabcastARR settings form inside this tab with fields: enabled toggle, URL, Token, Channel ID, Tag, Audio Quality, and Audio Language.
- Implement the "Test connection" button functionality that calls standard LabcastARR endpoints.
- Add "Save" and "Cancel" buttons.

---
### API Integration
#### [NEW] src/app/api/settings/integration/route.ts
- Create API endpoints to `GET` and `POST` the LabcastARR integration settings securely.
#### [NEW] src/app/api/integrations/labcastarr/route.ts
- Create an API route in 2watchARR to handle "Send to LabcastARR" requests.
- Implement API client logic in `src/lib/integrations/labcastarr.client.ts` implementing `POST /v1/integration/episodes` and `/v1/integration/episodes/bulk`.

---
### Episode UI and Flow
#### [MODIFY] src/components/features/episodes/episode-card.tsx
- Add the "Send to LabcastARR" action in the context menu if the episode has a valid YouTube URL and integration is enabled.
- Add a distinctive icon/badge next to the tag pill if the episode has the automated integration tag.
#### [MODIFY] src/components/features/episodes/episode-list-row.tsx
- Apply the same context menu and tag badge changes for the list view.
#### [MODIFY] src/app/episode/[id]/page.tsx (or equivalent episode details wrapper)
- Include "Send to LabcastARR" action.
- Ensure the user gets friendly toast notifications when sending to LabcastARR fails or succeeds.

---
### Tags and Automation
#### [MODIFY] src/lib/services/media.service.ts
- Intercept when an episode is added (e.g., in `addEpisodeFromUrl` or `saveEpisodeFromMetadata`).
- Check if the added tags include the `auto_tag` configured for LabcastARR. If so, trigger the API call to schedule it for LabcastARR.
#### [MODIFY] src/app/settings/page.tsx (Tags section)
- Add a new "Send to LabcastARR" bulk button next to the tag's delete option.
- Implement a modal for confirmation.

## Verification Plan

### Automated Tests
- Run existing test suites (`npm run test`) to ensure no regressions in episode creation and tag assignments.
- Write unit tests for the `LabcastarrClient` verifying the payload structure mapped to LabcastARR integration endpoints.

### Manual Verification
1. Go to `Settings -> Integrations`, enter mock local LabcastARR details, and click `Test Connection`.
2. Save the settings.
3. Go to the main view, open an episode's menu, and verify "Send to LabcastARR" works and shows a toast.
4. Add the configured `2WatchARR` tag to a new video and ensure a `POST` request is fired to the backend integration route.
5. In `Settings -> Tags`, click the bulk send button for a tag and verify the confirmation modal appears.
