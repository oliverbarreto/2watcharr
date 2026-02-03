# Fix Channel Card Spacing

The current implementation of channel cards uses a fixed `min-h-[320px]` combined with `aspect-square`. This enforces a minimum width of 320px. At certain screen sizes (specifically at the start of the `lg` and `xl` breakpoints), the grid cells are narrower than 320px, causing the cards to touch or overlap despite the defined grid gap.

This plan aims to reduce the minimum height to `280px`, which ensures the cards fit within their cells across all breakpoints while maintaining a premium feel.

## Proposed Changes

### Channels Page

#### [MODIFY] [page.tsx](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/app/channels/page.tsx)
- Change `min-h-[320px]` to `min-h-[280px]` in:
    - [SortableChannelCard](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/app/channels/page.tsx#72-228) component class list.
    - [ChannelsPageContent](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/app/channels/page.tsx#229-446) loading state skeletons.
    - [ChannelsPage](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/app/channels/page.tsx#447-479) Suspense fallback skeletons.
- This reduction allows the `aspect-square` cards to scale down to fit grid cells as small as 280px (the minimum cell width at the start of the `xl` breakpoint is ~294px).

## Verification Plan

### Automated Tests
- No automated UI tests are currently available for layout verification.

### Manual Verification
- **Browser Layout Check**: use the browser tool to visit `http://localhost:3000/channels` at different viewport widths:
    - `1024px` (start of `lg` breakpoint, 3 columns)
    - `1280px` (start of `xl` breakpoint, 4 columns)
    - `1440px` (standard desktop)
- Verify that there is visible spacing (gap) between all cards at these sizes.
- Verify that cards remain square and content is not overly cramped.
