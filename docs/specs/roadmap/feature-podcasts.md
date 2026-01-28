
- [ ] Allow adding Podcasts to the watch list 
    - The user could add also podcast episodes to the watch list. Just like videos we must keep track of the Podcast channel. 
    - We need a way to distinguish between videos and podcasts in the app and UI
    - We need to use another way to get the metadata for podcasts. We cannot use yt-dlp for that. We need to use another tool for that. We could use iTunes public API
```markdown
Here’s a working command that calls the iTunes Search API and returns JSON metadata for the given Apple Podcasts ID:
curl -s "https://itunes.apple.com/lookup?id=1648228034&entity=podcast
Explanation
•	id=1648228034 → the numeric Apple Podcasts show ID
•	entity=podcast → ensures we get podcast metadata (not just tracks, etc.)

This returns JSON like:
{
 "resultCount":1,
 "results": [
{"wrapperType":"track", "kind":"podcast", "collectionId":1648228034, "trackId":1648228034, "artistName":"PHD Ventures", "collectionName":"Moonshots with Peter Diamandis", "trackName":"Moonshots with Peter Diamandis", "collectionCensoredName":"Moonshots with Peter Diamandis", "trackCensoredName":"Moonshots with Peter Diamandis", "collectionViewUrl":"https://podcasts.apple.com/us/podcast/moonshots-with-peter-diamandis/id1648228034?uo=4", "feedUrl":"https://feeds.megaphone.fm/DVVTS2890392624", "trackViewUrl":"https://podcasts.apple.com/us/podcast/moonshots-with-peter-diamandis/id1648228034?uo=4", "artworkUrl30":"https://is1-ssl.mzstatic.com/image/thumb/Podcasts211/v4/af/a6/d4/afa6d472-87ab-434d-b8e4-4d5ce50a19eb/mza_4821323350232938193.jpg/30x30bb.jpg", "artworkUrl60":"https://is1-ssl.mzstatic.com/image/thumb/Podcasts211/v4/af/a6/d4/afa6d472-87ab-434d-b8e4-4d5ce50a19eb/mza_4821323350232938193.jpg/60x60bb.jpg", "artworkUrl100":"https://is1-ssl.mzstatic.com/image/thumb/Podcasts211/v4/af/a6/d4/afa6d472-87ab-434d-b8e4-4d5ce50a19eb/mza_4821323350232938193.jpg/100x100bb.jpg", "collectionPrice":0.00, "trackPrice":0.00, "collectionHdPrice":0, "releaseDate":"2026-01-27T21:00:00Z", "collectionExplicitness":"notExplicit", "trackExplicitness":"cleaned", "trackCount":229, "trackTimeMillis":6096, "country":"USA", "currency":"USD", "primaryGenreName":"Business", "contentAdvisoryRating":"Clean", "artworkUrl600":"https://is1-ssl.mzstatic.com/image/thumb/Podcasts211/v4/af/a6/d4/afa6d472-87ab-434d-b8e4-4d5ce50a19eb/mza_4821323350232938193.jpg/600x600bb.jpg", "genreIds":["1321", "26"], "genres":["Business", "Podcasts"]}]
}
```
```markdown
The feedUrl returned is the actual RSS feed for the podcast. That’s the canonical source for all metadata. You can extract it with jq, for example:
curl -s "https://itunes.apple.com/lookup?id=1648228034&entity=podcast" \
  | jq -r '.results[0].feedUrl'
```
```markdown
Example: search for podcasts matching "Build One Ideas" (or any term).
curl -s "https://itunes.apple.com/search?term=build+one+ideas&media=podcast&limit=1"

Typical JSON response (trimmed):
{
  "resultCount": 1,
  "results": [
    {
      "collectionName": "Build One Ideas",
      "artistName": "Oliver Barreto",
      "feedUrl": "https://feeds.apple.com/buildoneideas/rss",
      "collectionId": 123456789
    }
  ]
}

👉 The key field is feedUrl — that’s the podcast RSS feed.
```
