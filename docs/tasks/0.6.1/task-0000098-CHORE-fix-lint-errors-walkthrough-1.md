# Walkthrough - Fix Linting Errors

I have successfully resolved the linting warnings in the project.

## Changes Made

### Stats Page

- Removed unused `isResetting` and `setIsResetting` state variables from [src/app/stats/page.tsx](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/app/stats/page.tsx).

## Verification Results

### Automated Tests

#### Linting
I ran `npm run lint` and it now completes without any warnings or errors.

```bash
> 2watcharr@0.6.0 lint
> eslint
```

### Manual Verification
- Verified that the "Stats" page still loads and functions correctly.
