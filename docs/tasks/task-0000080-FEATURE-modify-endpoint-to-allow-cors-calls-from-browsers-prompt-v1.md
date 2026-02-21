# TASK: FEATURE - Allow browser extension to call POST /api/shortcuts/add-episode by handling CORS preflight (OPTIONS) and returning CORS headers on both OPTIONS and POST.  

## Instructions

I am working on a Browser extension that makes calls to the 2watcharr API to add episodes. We re using the same api that we use for iOS Shortcuts /api/shortcuts/add-episode endpoint. 

The problem is that we are having some issues whehn using it from the Browser extension. 

I include next the diagnostic that the AI assistant implementing the browser extension gave me. I want you to evaluate it and provide your opinion with your full knowledge of our code base to check if the assessment is valid and we should implement the changes he proposes.


## Problem description

When making a call from the browser extension we have a problem when trying to add a video via the API /add-episode. 


I tried adding a video and got an error:

```
ERROR (json)7:21:01 PM
Base: http://localhost:3000
Video URL: https://www.youtube.com/watch?v=FZkCoJa-NWw
Tag: youtube
Request: POST http://localhost:3000/api/shortcuts/add-episode
Headers: {
  "Content-Type": "application/json",
  "X-API-Token": "07ea140536f300a7238bbccae08609feeb3e94b4ee1e0a4c574e8a8f74ebce02",
  "Authorization": "Bearer 07ea140536f300a7238bbccae08609feeb3e94b4ee1e0a4c574e8a8f74ebce02"
}
Body: {"url":"https://www.youtube.com/watch?v=FZkCoJa-NWw","tag":"youtube"}
NetworkError when attempting to fetch resource.
Token: 07ea…ce02
```

While in our backend api we are getting this message " OPTIONS /api/shortcuts/add-episode 204 in 31ms (compile: 25ms, render: 6ms)" NOT A POST call!

For this second video: the browser is sending a CORS preflight (OPTIONS) because the request includes non-simple headers (Authorization, X-API-Token) and JSON content-type. If the preflight response doesn’t include the right CORS allow headers, the browser blocks the POST. That’s exactly why you only see OPTIONS … 204 on the backend and no POST.

### Proposed solution

Allow the browser extension to call POST /api/shortcuts/add-episode by handling CORS preflight (OPTIONS) and returning CORS headers on both OPTIONS and POST.

Below we have the problem, the diagnostic that the AI assistant implementing the browser extension gave, and set of instructions to implement in our Next.js‑specific API.


Fix (server-side CORS): The `/api/shortcuts/add-episode` needs to respond to OPTIONS with:

- Access-Control-Allow-Origin: * (or your extension origin)
- Access-Control-Allow-Methods: POST, OPTIONS
- Access-Control-Allow-Headers: Content-Type, X-API-Token, Authorization

Once those are present, the POST will go through.

### What to implement (Next.js app router)

In the route file that handles /api/shortcuts/add-episode, add an OPTIONS handler.
Add CORS headers to both OPTIONS and POST responses.

### Minimal example (app router)

```ts
// app/api/shortcuts/add-episode/route.ts
const allowlist = new Set([
  'http://localhost:3000',
  'chrome-extension://<EXTENSION_ID>',
  'moz-extension://<EXTENSION_ID>'
]);

function corsHeaders(origin?: string) {
  if (!origin || !allowlist.has(origin)) return {};
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-API-Token, Authorization',
    'Access-Control-Max-Age': '600'
  };
}

export async function OPTIONS(req: Request) {
  const origin = req.headers.get('origin') ?? undefined;
  return new Response(null, { status: 204, headers: corsHeaders(origin) });
}

export async function POST(req: Request) {
  const origin = req.headers.get('origin') ?? undefined;
  const headers = corsHeaders(origin);

  // existing POST logic...
  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers
  });
}
```

### Notes

Replace <EXTENSION_ID> with the real extension ID.
If you’re using the pages router (not app router), the same headers can be set inside the handler and you must explicitly handle OPTIONS.
Quick test

```bash
curl -i -X OPTIONS http://localhost:3000/api/shortcuts/add-episode \
  -H "Origin: chrome-extension://<EXTENSION_ID>" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: content-type, x-api-token, authorization"
```

Expect 204 and the CORS headers listed above.
