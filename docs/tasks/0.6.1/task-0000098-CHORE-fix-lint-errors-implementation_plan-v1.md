# Fix Linting Errors in Stats Page

Remove unused state variables `isResetting` and `setIsResetting` from [src/app/stats/page.tsx](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/app/stats/page.tsx).

## Proposed Changes

### Stats Page

#### [MODIFY] [page.tsx](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/app/stats/page.tsx)

Remove the unused `isResetting` state declaration.

## Verification Plan

### Automated Tests
- Run `npm run lint` to ensure no more warnings are present.
- Run `npm run build` to ensure the project still builds correctly.
