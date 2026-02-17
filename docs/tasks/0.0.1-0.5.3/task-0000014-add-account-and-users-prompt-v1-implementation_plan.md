# Implementation Plan - Feature: Users

This plan outlines the steps to introduce user management, authentication, and a multi-user profile selection system to the 2watcharr application.

## User Review Required

> [!IMPORTANT]
> **Database Schema Changes**: I will be modifying the `episodes` and `tags` tables to support multi-user isolation by changing unique constraints from global to [(external_id/name, user_id)](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/lib/domain/models.ts#56-63).
> **Authentication**: I plan to use `next-auth` (Auth.js) with the `Credentials` provider for simplicity in a self-hosted Docker environment.
> **Shared Content**: Channels will remain shared across all users, but the watch list (episodes) and tags will be isolated per user profile.

## Proposed Changes

### Database & Models

#### [MODIFY] [schema.sql](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/lib/db/schema.sql)
- Update `users` table:
    - `username` (TEXT, UNIQUE)
    - `password_hash` (TEXT)
    - `display_name` (TEXT)
    - `emoji` (TEXT)
    - `color` (TEXT)
    - `is_admin` (BOOLEAN)
- Update `episodes` table:
    - Change `external_id` from `UNIQUE` to a unique constraint on [(external_id, user_id)](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/lib/domain/models.ts#56-63).
- Update `tags` table:
    - Change `name` from `UNIQUE` to a unique constraint on [(name, user_id)](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/lib/domain/models.ts#56-63).

#### [MODIFY] [models.ts](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/lib/domain/models.ts)
- Add `User` and `UserProfile` interfaces.
- Update [EpisodeFilters](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/lib/domain/models.ts#117-126) to include `userId`.

---

### Backend Services & Repositories

#### [MODIFY] [episode.repository.ts](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/lib/repositories/episode.repository.ts)
- Update [findAll](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/lib/repositories/episode.repository.ts#98-215) and other methods to filter by `userId`.
- Handle the new unique constraint in [create](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/lib/repositories/episode.repository.ts#15-53) and [findByExternalId](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/lib/repositories/episode.repository.ts#87-97).

#### [NEW] [user.repository.ts](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/lib/repositories/user.repository.ts)
- Implement CRUD operations for users.

#### [NEW] [auth.ts](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/lib/auth.ts)
- Configure `next-auth` with `CredentialsProvider`.
- Implement login logic verifying against `users` table.

---

### UI & Components

#### [NEW] [onboarding page](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/app/(auth)/onboarding/page.tsx)
- Create a flow to change admin name/password and initialize the first profile.
- Ask for emoji and color for the admin profile.
- Option to add more users.

#### [NEW] [login page](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/app/(auth)/login/page.tsx)
- Unified login for the "Account".
- Include "Remember me" checkbox with local storage persistence (up to 15 days).

#### [NEW] [profile selection page](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/app/(auth)/profiles/page.tsx)
- Disney+/AppleTV style grid of user profiles.
- Handle profile-specific password prompt if configured.

#### [MODIFY] [navigation bar](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/components/layout/nav-bar.tsx)
- Add user profile icon with a dropdown for switching profiles or managing users.

#### [MODIFY] [settings](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/app/settings/page.tsx)
- Add "User Management" tab for admin users to add/edit/remove profiles.

---

## Verification Plan

### Automated Tests
- Run existing tests to ensure no regressions: `npm test`
- Add new repository tests for `UserRepository`.
- Add integration tests for user-isolated watchlist.

### Manual Verification
- **Onboarding**: Wipe database, start app, and verify the onboarding flow triggers.
- **Multi-user Isolation**:
    1. Login as User A, add a video.
    2. Switch to User B, verify the watchlist is empty.
    3. Add the same video as User B, verify it works and has independent status (watched/favorite).
- **Admin Permissions**: Verify only the admin can see and use the "User Management" tab in settings.
- **Remember Me**: Check local storage and verify auto-login after session restart.
