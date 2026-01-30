# Task: FIX: Database Schema Inconsistencies

- [ ] Investigate current database schema [id: 0]
- [ ] Fix naming mismatches in Repositories [id: 1]
    - [ ] [ChannelRepository](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/lib/repositories/channel.repository.ts#4-169) (thumbnailUrl -> thumbnail_url) [id: 2]
    - [ ] [EpisodeRepository](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/lib/repositories/episode.repository.ts#12-438) (check for camelCase columns) [id: 3]
- [ ] Fix errors in [migrations.ts](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/lib/db/migrations.ts) [id: 4]
    - [ ] Check `add_podcast_support` migration for `channel_url` vs `url` [id: 5]
- [ ] Verify fix with `npm run build` and tests [id: 6]
- [ ] Manual verification [id: 7]
