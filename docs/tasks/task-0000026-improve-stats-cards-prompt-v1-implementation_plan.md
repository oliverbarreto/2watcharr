# Optimization of Stats Cards Layout

The goal is to make the statistics cards more compact by rearranging their elements. Instead of having separate rows for icon/title and value/description, we will move the icon and value to the first row, followed by the title and then the description.

## Proposed Changes

### [Component] Stats Page

#### [MODIFY] [page.tsx](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/app/stats/page.tsx)

- Update the [StatCard](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/app/stats/page.tsx#621-641) component to use a more compact layout:
    - **Row 1**: Icon and Value side-by-side using `flex items-center gap-4`.
    - **Row 2**: Title.
    - **Row 3**: Description.
- Adjust padding and margins to ensure the card feels compact.
- Ensure the icon size and padding are consistent with the new layout.

## Verification Plan

### Automated Tests
- I will run the development server and use the browser tool to capture a screenshot of the new layout to verify it matches the user's request.
- Command: `npm run dev` (already running)

### Manual Verification
- Verify the layout on different screen sizes (responsive grid is already in place).
- Check that hover effects and colors are preserved.
