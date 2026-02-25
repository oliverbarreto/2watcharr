# Task List - Channel Statistics Charts

- [x] Research existing stats implementation
    - [x] Analyze [src/app/stats/page.tsx](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/app/stats/page.tsx)
    - [x] Analyze [src/app/api/stats/route.ts](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/app/api/stats/route.ts)
    - [x] Analyze [src/lib/services/stats.service.ts](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/lib/services/stats.service.ts)
    - [x] Check database schema and event types
- [x] Create implementation plan
- [x] Implement backend changes
    - [x] Update [MediaEventType](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/lib/domain/models.ts#8-9) in models
    - [x] Update [MediaService](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/lib/services/media.service.ts#16-559) to log new events
    - [x] Update [StatsService](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/lib/services/stats.service.ts#55-476) to calculate channel stats
- [x] Implement frontend changes
    - [x] Add "Channels" tab to stats page
    - [x] Implement controls (radio buttons, select all/none)
    - [x] Implement channel trend chart
- [ ] Verify implementation [/]
    - [x] Test chart responsiveness and data accuracy
    - [x] Verify filtering logic
