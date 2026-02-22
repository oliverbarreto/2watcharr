# TASK: FEATURE - Simplify duplicated code removing duplicated /add-video api call

One important thing to check. I want to check if we are using the other endpoint in our app for anything "POST /api/shortcuts/add-video". 

If not, what i expect, but require your confirmation, we should only use one of these endpoint for the same task, which should be "POST /api/shortcuts/add-episode". 

We should avoid duplicated code


---

## v2

### Prompt

I don't fully understand how CORS work. The thing is that the extension which i am running against the local server is now working after we added centralized CORS handling and used a placeholder extension ID. 

You gave me instruction so if my browser extension has a specific ID already, we can update it in `src/lib/utils/cors.ts`.

```ts
/**
 * Common CORS allowlist
 */
const ALLOWLIST = new Set([
  'http://localhost:3000',
  'chrome-extension://cngjokpjmgicghgegnjdfmddghmhmfmd', // Placeholder or real ID if provided
  'moz-extension://cngjokpjmgicghgegnjdfmddghmhmfmd'    // Placeholder or real ID if provided
]);
```

Two things:

1. We also need to handle the case that the extension should point to the production app. In this case, should we add the production url in "https://2watcharr.oliverbarreto.com" ???

2. Don't know where we can get/ddefine the browser extension, if possible.


### Response

Progress Updates
1
Addressing CORS questions and planning simplification

I have addressed your questions and prepared a plan to simplify the duplicated code.

1. CORS in Production
You do NOT need to add the production URL (https://2watcharr.oliverbarreto.com) to the ALLOWLIST.

CORS is a security mechanism where the server says "I allow requests from these client origins".
The origin is determined by where the request starts (the browser extension), not where it's going (your production server).

So, the ALLOWLIST remains focused on the extension IDs and localhost.

2. Finding the Extension ID
Chrome: Go to chrome://extensions, enable "Developer mode" (top right), and look for the "ID" under your extension.

Firefox: Go to about:debugging#/runtime/this-firefox and look for the "Extension ID" or "Internal UUID".

3. Simplification Plan
I've confirmed that /api/shortcuts/add-video and /api/shortcuts/add-episode are identical. To avoid duplication, I propose making add-video a simple alias of add-episode. This keeps it working for existing iOS Shortcuts while keeping the code DRY.

Please review the updated implementation plan.