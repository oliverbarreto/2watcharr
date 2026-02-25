# Task List - Channel Statistics Charts

- [x] Research existing stats implementation
    - [x] Analyze [src/app/stats/page.tsx](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/app/stats/page.tsx)
    - [x] Analyze [src/app/api/stats/route.ts](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/app/api/stats/route.ts)
    - [x] Analyze [src/lib/services/stats.service.ts](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/lib/services/stats.service.ts)
    - [x] Check database schema and event types
- [x] Create implementation plan
- [ ] Implement backend changes [/]
    - [ ] Update `MediaEventType` in models
    - [ ] Update [MediaService](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/lib/services/media.service.ts#16-534) to log new events
    - [ ] Update [StatsService](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/lib/services/stats.service.ts#47-351) to calculate channel stats
- [ ] Implement frontend changes [ ]
    - [ ] Add "Channels" tab to stats page
    - [ ] Implement controls (radio buttons, select all/none)
    - [ ] Implement channel trend chart
- [ ] Verify implementation [ ]
    - [ ] Test chart responsiveness and data accuracy
    - [ ] Verify filtering logic
