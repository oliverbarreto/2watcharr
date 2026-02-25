# Task: BUGFIX - UI: fix context menu of episode cards

- [x] Planning and Research
    - [x] Inspect [episode-card.tsx](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/components/features/episodes/episode-card.tsx) and [episode-list-row.tsx](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/components/features/episodes/episode-list-row.tsx) to understand current context menu implementation
    - [x] Identify why the menu doesn't close on action or click outside
- [x] Implementation
    - [x] Create a reusable context menu component or fix existing logic in both files
    - [x] Implement "close on click outside" behavior
    - [x] Implement "close on action" behavior
- [x] Verification
    - [x] Verify fix in grid view (episode card)
    - [x] Verify fix in list view (episode list row)

# V2: Remove Reorder Options from Watchlist Context Menu

- [x] Planning and Research
    - [x] Identify where `showReorderOptions` is lost in the component tree
    - [x] Update implementation plan
- [x] Implementation
    - [x] Update [GroupedEpisodeList](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/components/features/episodes/grouped-episode-list.tsx#19-82) to accept and pass `showReorderOptions`
    - [x] Update [EpisodeList](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/components/features/episodes/episode-list.tsx#57-357) to pass `showReorderOptions` to [GroupedEpisodeList](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/components/features/episodes/grouped-episode-list.tsx#19-82)
- [x] Verification
    - [x] Verify "Move to..." options are hidden on Watchlist
    - [x] Verify "Move to..." options are visible on Watch Next
