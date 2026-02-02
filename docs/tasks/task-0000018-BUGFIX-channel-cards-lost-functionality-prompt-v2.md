
# Task: Channel Cards Lost Functionality

# Task: Channel Cards Lost Functionality

The channel page looks great but we need to make some changes. You can see in the image how the cards UI is right now in the channel page. We want to make some improvements to it:

- Remove the red bar at the top of the card that allows draggin the channel cards for all cards. It should only be visible and work when the user is hovering over the card. The cards should keep the feature to be draggable to allow reordering of the channels for all users.
- Do not remove the effect that makes the image grow on hover. This is a nice effect that we want to keep.
- Make the overlay cover the whole card and not only the bottom part of the card. This way we can have more space to display the channel information and the rest of information we want to display, specially the tags of videos from the channel.
- Remove the "sync metadata" button from the top of the page for admin users, and add a "Sync metadata" button to every card that allows sycning the channel information for all types of users (not only admin users). Use yt-dlp to sync the channel information. There are some instructions below on how to use yt-dlp to sync the channel information. The button should be placed on the top left corner of the card.


## How to use yt-dlp to sync channel information

yt-dlp can extract channel info like:
- channel name
- description
- channel URL / ID
- thumbnails (avatars & banners)
- subscriber count (when available)
- playlist of uploads (optionally)

...and it can do it without downloading any videos.


The key flags we want to use are:

1. `--dump-json` (or `-J`)

This is the big one. It prints all extracted metadata as JSON.

2. `--skip-download`

So nothing gets downloaded.

3. (Optional) `--flat-playlist`

If you don’t want full video metadata for every upload.


### Example: get channel metadata only

The follwoing command returns a single JSON object containing channel-level info:
`yt-dlp --skip-download --dump-json https://www.youtube.com/@veritasium`

Typical fields you’ll see:

```json
{
  "id": "UCHnyfMqiRRG1u-2MsSQLbXA",
  "channel": "Veritasium",
  "channel_id": "UCHnyfMqiRRG1u-2MsSQLbXA",
  "channel_url": "https://www.youtube.com/channel/UCHnyfMqiRRG1u-2MsSQLbXA",
  "title": "Veritasium",
  "description": "An element of truth...",
  "thumbnails": [
    {
      "url": "...",
      "width": 176,
      "height": 176
    }
  ],
  "subscriber_count": 15300000
}
```
⚠️ Some fields (like subscriber count) may be missing depending on region, cookies, or YouTube experiments.
