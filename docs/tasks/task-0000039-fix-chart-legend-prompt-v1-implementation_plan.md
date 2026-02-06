# Add Legend to Activity Trend Chart

The goal is to add a legend to the Activity Trend chart (AreaChart) in the stats page to help users identify the "Added" and "Watched" lines.

## Proposed Changes

### Stats Page

#### [MODIFY] [page.tsx](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/app/stats/page.tsx)

- Import `ChartLegend` and `ChartLegendContent` from `@/components/ui/chart`.
- Add `<ChartLegend content={<ChartLegendContent />} />` within the `AreaChart` component in [src/app/stats/page.tsx](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/app/stats/page.tsx).

## Verification Plan

### Manual Verification
- Start the development server using `npm run dev`.
- Navigate to the stats page (`/stats`).
- Verify that the legend is displayed below the "Activity Trend" chart and correctly labels the "Added" (blue) and "Watched" (green) areas.
