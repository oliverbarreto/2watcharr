# iOS Shortcut Setup Guide

This guide will help you set up an iOS Shortcut to easily save YouTube videos to your **2watcharr** list directly from the YouTube app on your iPhone or iPad.

## Prerequisites

1. Your **2watcharr** server must be running and accessible from your iOS device.
   - If running locally on your Mac, your iPhone must be on the **same Wi-Fi network**.
   - You need your Mac's local IP address (e.g., `192.168.1.100`).

## Step-by-Step Setup

1. **Open the "Shortcuts" app** on your iOS device.
2. Tap the **+** button to create a new shortcut.
3. Tap **"Rename"** at the top and name it **"Save to 2watcharr"**.
4. Enable **"Show in Share Sheet"**:
   - Tap the "i" info icon at the bottom.
   - Toggle on **"Show in Share Sheet"**.
   - Tap "Done".

### Configure Shortcut Actions

Add the following actions in order:

1. **Receive**
   - Tap "Receive" and set it to receive **URLs** and **Media** (uncheck others) from **Share Sheet**.
   - It should look like: `Receive URLs and Media input from Share Sheet`.

2. **Get Variable** (Optional but recommended)
   - Add a "Text" action to define your server URL.
   - Text: `http://192.168.1.XX:3000` (Replace with your actual IP and port).
   - Add "Set Variable" action. Name it `ServerURL`.

3. **Get Contents of URL**
   - Search for "Get Contents of URL" action.
   - Set URL to: `ServerURL/api/shortcuts/add-video`
   - Expand the arrow (`>`) to configure:
     - **Method**: `POST`
     - **Headers**:
       - Key: `Content-Type`
       - Value: `application/json`
     - **Request Body**: `JSON`
     - Add new field:
       - Key: `url`
       - Value: Select `Shortcut Input` (magic variable)

4. **Show Notification**
   - Search for "Show Notification" action.
   - Title: `2watcharr`
   - Body: `Video added successfully!` (You can also map this to the API response if you want advanced feedback).

## How to Use

1. Open the **YouTube app** on your iPhone.
2. Find a video you want to watch later.
3. Tap **Share**.
4. Tap **More...** to see the full system share sheet.
5. Tap **"Save to 2watcharr"**.

You should see a notification confirming the video was added!

## Troubleshooting

- **"Connection Refused"**: Ensure your Mac and iPhone are on the same Wi-Fi network and the IP address is correct.
- **"Invalid URL"**: Make sure you are sharing a video URL, not a playlist or channel page.
- **Firewall**: Check if your Mac's firewall is blocking connections to port 3000.
