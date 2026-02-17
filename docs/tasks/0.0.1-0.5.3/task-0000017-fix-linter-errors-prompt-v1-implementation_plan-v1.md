# Implementation Plan - Fix Lint Errors

Fix lint errors identified by `npm run lint`.

## Proposed Changes

### UI Components

#### [MODIFY] [navbar.tsx](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/components/layout/navbar.tsx)
- Move [NavLinks](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/components/layout/navbar.tsx#36-58) component outside of [Navbar](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/components/layout/navbar.tsx#24-169) to avoid "component created during render" error.

#### [MODIFY] [chart.tsx](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/components/ui/chart.tsx)
- Fix `any` types where possible.

### Domain Models

#### [MODIFY] [models.ts](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/lib/domain/models.ts)
- Change [UserProfile](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/lib/domain/models.ts#28-29) from empty interface to type alias.

### Repositories and Services

#### [MODIFY] Various Files
- Replace `any` with specific types or `unknown`.
- Remove unused imports and variables.
- Fix any other minor lint issues.

Files to modify include:
- [src/lib/repositories/channel.repository.ts](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/lib/repositories/channel.repository.ts)
- [src/lib/repositories/episode.repository.ts](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/lib/repositories/episode.repository.ts)
- [src/lib/repositories/tag.repository.ts](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/lib/repositories/tag.repository.ts)
- [src/lib/repositories/user.repository.ts](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/lib/repositories/user.repository.ts)
- [src/lib/services/media.service.ts](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/lib/services/media.service.ts)
- [src/lib/services/youtube-metadata.service.ts](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/lib/services/youtube-metadata.service.ts)
- [src/lib/auth.ts](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/lib/auth.ts)
- [src/lib/actions/user.actions.ts](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/lib/actions/user.actions.ts)

## Verification Plan

### Automated Tests
- Run `npm run lint` and ensure it passes with zero errors and minimal warnings.
- Run `npm run build` to ensure no regressions.
