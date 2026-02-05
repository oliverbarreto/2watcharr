# Task: Fix broken iOS workflow

- [x] Research why the iOS workflow is broken
    - [x] Check API endpoint name (resolved: keep as `add-episode`)
    - [x] Review authentication requirements (found session requirement issue)
- [x] Implement API Token Authentication
    - [x] Add `api_token` column to `users` table via migration
    - [x] Update [UserRepository](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/lib/repositories/user.repository.ts#5-147) and [UserService](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/lib/services/user.service.ts#7-134) to handle tokens
    - [x] Create [refreshApiToken](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/lib/actions/user.actions.ts#142-157) server action
    - [x] Update [UserManagement](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/components/features/users/user-management.tsx#23-350) UI to show/copy/rotate tokens
    - [x] Update `add-episode` (and `add-video`) routes to validate `X-API-Token` header
- [x] Verify and Document
    - [x] Update [docs/documentation/ios-shortcut-setup.md](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/docs/documentation/ios-shortcut-setup.md) with token instructions
    - [x] Update bugfix spec and roadmap references
    - [x] Create final walkthrough artifact
