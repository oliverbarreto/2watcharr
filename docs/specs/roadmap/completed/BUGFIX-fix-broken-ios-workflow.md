# Task: Fix broken iOS workflow

Currently the workflow for iOS is broken. We need to check if the api is working and if the workflow is correct. Right now we make a call to `https://2watcharr.oliverbarreto.com/api/shortcuts/add-episode`

The current process is documented in the file `docs/documentation/ios-shortcut-setup.md`.

- Method: Post
- Headers: `Content-Type: application/json`
- Request Body: `JSON`
- Add Field: `url` (Value: `VideoURL`), eg: `JSON: {"url": "https://www.youtube.com/watch?v=VIDEO_ID"}`


In case of necessary we should also update the `docs/documentation/ios-shortcut-setup.md` file to reflect the changes.


---

# Task 2: Fix iOS workflow authorization

ok we now get a response from the server when we execute the workflow on ios, but we get an error  "Server Response
{"success":false, "error"•"Unauthorized"}"

how can we provide a way to allow authorization ? 

We do not want to remove the existing infrastructure por user/password that we have. But, Should we create an api_token in the settings page that we can use on all devices from which we want to use the app and send that token ?