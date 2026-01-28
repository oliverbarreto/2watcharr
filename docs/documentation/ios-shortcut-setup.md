# iOS Shortcut Setup Guide

This guide will help you set up a robust iOS Shortcut to save YouTube videos to your **2watcharr** list.

## Prerequisites

1. Your **2watcharr** server must be running and accessible from your iOS device.
   - If running locally on your Mac, your iPhone must be on the **same Wi-Fi network**.
   - Use your Mac's local IP address (e.g., `192.168.1.100`) instead of `localhost`.

## Step-by-Step Setup

### 1. Basic Configuration
1. **Open the "Shortcuts" app** and create a new shortcut named **"Save to 2watcharr"**.
2. Tap the **"i" (Info)** icon and toggle on **"Show in Share Sheet"**.
3. Set it to receive **only URLs** from the Share Sheet.

### 2. Configure Actions

Follow these steps to add error handling and progress feedback:

1.  **Receive URLs** from Share Sheet. (If no input: `Continue`).
2.  **Set Variable**: Name it `VideoURL` and set it to the `Shortcut Input`.
3.  **Show Notification** (Progress):
    - Title: `2watcharr`
    - Body: `Añadiendo video: VideoURL...`
4.  **Get Contents of URL**:
    - URL: `http://YOUR_MAC_IP:3000/api/shortcuts/add-video`
    - Method: `POST`
    - Headers: `Content-Type: application/json`
    - Request Body: `JSON`
    - Add Field: `url` (Value: `VideoURL`)
5.  **Get Dictionary from Input**: (Pass the result of the previous action).
6.  **Get Value for Key** `success` in `Dictionary`.
7.  **If `Value` is 1** (or is true):
    - **Show Notification**:
        - Title: `2watcharr`
        - Body: `✅ Se ha añadido el video: VideoURL`
8.  **Otherwise**:
    - **Get Value for Key** `error` in `Dictionary`.
    - **Show Notification**:
        - Title: `2watcharr`
        - Body: `❌ Error al añadir video: VideoURL. Error: Value` (Value here is the error message).
9.  **End If**

## Pro-Tips

### Fixing "Documento PDF..."
If your notification shows "Documento PDF...", it's because Shortcuts is trying to pass the entire "Shortcut Input" (which contains Safari metadata) into the notification. 
**The Fix**: Always use a **"Get URLs from Input"** action or assign the input to a **Text** variable (`VideoURL`) at the beginning, and use that variable in your notifications.

### Showing Progress
Showing a notification right before the **"Get Contents of URL"** action acts as a progress indicator. The shortcut will show the first notification, then wait for the network call, and finally show the success/error notification.

### Local Testing
If you are testing on your Mac using the Shortcuts app:
- You can use `http://localhost:3000`.
- If using an iPhone, you **must** use your Mac's IP (e.g., `http://192.168.1.5:3000`).

## Troubleshooting

- **Connection Refused**: Double check the IP address. In Terminal, run `ipconfig getifaddr en0` to find your Mac's local IP.
- **Wait Time**: Large video metadata might take a few seconds to process. The progress notification helps confirm it's working.
