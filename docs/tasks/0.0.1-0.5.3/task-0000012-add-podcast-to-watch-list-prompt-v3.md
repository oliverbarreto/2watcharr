After the finalization of the implementation plan for the feature "add podcast to watch list", I am running the app with npm run dev and tried to add a podcast url (https://podcasts.apple.com/es/podcast/cathie-woods-2026-vision-7-gdp-growth-rising-ai-demand/id1648228034?i=1000747203082) and got an error

```bash
❯ npm run dev

> 2watcharr@0.1.0 dev
> next dev

▲ Next.js 16.1.4 (Turbopack)
- Local:         http://localhost:3000
- Network:       http://192.168.12.105:3000

✓ Starting...
✓ Ready in 831ms
 GET / 200 in 2.5s (compile: 2.3s, render: 196ms)
Running add_podcast_support migration...
Running add_podcast_support migration...
add_podcast_support migration completed.
Error running add_podcast_support migration: [Error: SQLITE_ERROR: no such column: channel_url] {
  errno: 1,
  code: 'SQLITE_ERROR'
}
Error listing tags: [Error: SQLITE_ERROR: no such column: channel_url] {
  errno: 1,
  code: 'SQLITE_ERROR'
}
 GET /api/tags 500 in 568ms (compile: 495ms, render: 73ms)
 GET /api/episodes?sort=custom&order=asc 200 in 570ms (compile: 535ms, render: 35ms)
 GET /api/episodes?sort=custom&order=asc 200 in 5ms (compile: 1780µs, render: 4ms)
 GET / 200 in 86ms (compile: 3ms, render: 83ms)
 GET /api/tags 200 in 8ms (compile: 3ms, render: 6ms)
 GET /api/episodes?sort=custom&order=asc 200 in 10ms (compile: 5ms, render: 5ms)
 GET /api/episodes?sort=custom&order=asc 200 in 4ms (compile: 1266µs, render: 3ms)
 GET /api/tags 200 in 7ms (compile: 3ms, render: 3ms)
 GET /api/tags 200 in 65ms (compile: 47ms, render: 18ms)
Error adding episode: [Error: SQLITE_ERROR: table channels has no column named thumbnailUrl] {
  errno: 1,
  code: 'SQLITE_ERROR'
}
 POST /api/episodes 400 in 1050ms (compile: 3ms, render: 1047ms)
 GET / 200 in 84ms (compile: 9ms, render: 75ms)
 GET /api/tags 200 in 11ms (compile: 1670µs, render: 9ms)
 GET /api/episodes?sort=custom&order=asc 200 in 12ms (compile: 5ms, render: 8ms)
 GET /api/episodes?sort=custom&order=asc 200 in 4ms (compile: 1480µs, render: 3ms)
 GET /api/tags 200 in 6ms (compile: 1544µs, render: 4ms)
 ```

## Sumamry of analysis of the task by AI Antifgravity

Debugging Database Schema Inconsistencies
I am investigating database errors reported by the user after the refactoring. The errors indicate mismatches between the repository code and the database schema (snake_case vs camelCase) and issues in the migration script. I will start by creating a task list and implementation plan to fix these issues.