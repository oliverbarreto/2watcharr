# Task: BUGFIX podcasts showing wrong metadata but link works

With the recent changes we must have changed something in the services taht retrieve information about podcasts.

Our feature supports adding a podcast from a url link (eg: https://podcasts.apple.com/es/podcast/tom-bilyeus-impact-theory/id1191775648?i=1000746445714). With this url we retrieve the podcast id and then we use it to retrieve the podcast information.

However, it seems that we are not retrieving the correct podcast information. We are retrieving the latest podcast in the channel instead of the podcast that we are linking to.

We should use the podcast id to retrieve the podcast information and not the episode id.

Here is the example:
- Using this url: https://podcasts.apple.com/es/podcast/tom-bilyeus-impact-theory/id1191775648?i=1000746445714
- Correct podcast data: 
    - Title: How Japan's Broken Bond Market Is Threatening Your Wealth-What You Must Know
    - Publish Date: 24 ENE 
    - Channel: Tom Bilyeu's Impact Theory
    - url stored: https://podcasts.apple.com/es/podcast/tom-bilyeus-impact-theory/id1191775648?i=1000746445714
    - ...
- Incorrect podcast data: 
    - Title: Fiat, Force, and Fallout: How Today's Financial Wars Will Reshape Your Future | Tom's
    - Publish Date: 3 hours ago
    - Channel: Tom Bilyeu's Impact Theory
    - url stored: https://podcasts.apple.com/es/podcast/tom-bilyeus-impact-theory/id1191775648?i=1000746445714
    - ...
Deepdive

AS you can see the information is retreieved for another podcast, while the url is correctly saved. It is the one we provided when adding the podcast.

Review how we are retrieving the podcast information. 

- Below are some basic examples of how to get the metadata for podcasts using iTunes public API, but we can investigate in more detail this api or other alternatives:

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