TASK-0000078: FEATURE: Add endpoint for list of URL

## Overview

Right now we have an endpoint that is being used by iOS shortcuts, with token security, to add a new channel. This endpoint works fine.

But we now want to create a browser extension that can be used to add a new channel from a web browser. This extension will also use token security, but it will be more user friendly in non apple devices. The extension now needs to have a new API endpoint ready that allows the extension to add a multiple new channels at once.

The endpoint should be able to handle a list of URLs associated to a specific tag.

## Requirements

- The endpoint should be able to handle a list of URLs associated to a specific tag. All individual URLs should be associated with the same tag.
- The endpoint should have error handling for the operation and return the appropriate error message.
- The operation needs to be async and should not block the main thread.
- The endpoint should be secured with a token.
