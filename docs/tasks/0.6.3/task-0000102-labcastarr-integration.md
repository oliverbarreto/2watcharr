# TASK: FEATURE - Integration with other apps

## Overview

We want to start a new feature that will allow 2watcharr to integrate with other applications in a similar way that we already allow a web browser extension to connect to 2watcharr using a user generated token, but now, 2watcharr will connect to antoher app. 

The first integration will be with LabcastARR, a tool for publishing and managing podcast channels that allows users to create new podcast episodes by providing a valid Youtube video url, or a list of urls.

This integration will allow 2watchARR users to easily send episodes from 2watchARR to LabcastARR and create podcast episodes with them. User can manually send episodes or automatically send episodes when they are added to a tag.

### Functional Requirements

In 2watchARR we need to:

- All videos sent to LabcastARR will include a tag that will be used to identify them in LabcastARR. We will use the same tag that is configured in the settings of the integration.
- When we send to LabcastARR we will always send the tag "2WatchARR" as the only tag we send in the API call. We will not send any other tags. This tag will be used by LabcastARR to identify the episodes that were sent from 2watchARR. It has nothing to do with the tag configured in the settings of the integration, which will be used to identify when 2WatchARR should automatically send episodes to LabcastARR.
- Add a new option in the episode details page to "Send to LabcastARR" that will be visible only if the integration is enabled and the episode has a valid Youtube video url. This option will allow the user to send that particular video to LabcastARR, thus triggering the API call to LabcastARR to create the episode in the configured channel with the provided video url. LabcastARR api will take care of creating the episode in the configured channel.
- If the integration is enabled, when the user adds an episode in 2watcharr that has a valid Youtube video url and the tag associated to the integration, we will automatically send it to LabcastARR utilizing the API to create an episode in the configured channel with the provided url.
- We also want to distinguish the tag associated to the integration from other tags in 2watcharr. To do so, when a video uses the tag associated to the integration, and the integration is enabled, we want to modify the way we show the tag on the app, for example in the episode details page or episode cards and in the tags tab, by adding a badge or icon that indicates that the tag is the one used with the integration, like a badge "API" inside the pill that we currently use to show the tag.
- Also, we will allow the user to send multiple users at once. To do so, we need to include a new option in the tags tab in settings page to allow users to select a tag and by using that option button the user can send all videos from that tag to LabcastARR, even though they may not be the tag associated to the integration. This option will be a button that will trigger a modal to ask for confirmation to send all episodes, indicating how many videos will be sent to LabcastARR, and when authorized, it will send them using the LabcastARR Integration API. In this case we will not add the badge or icon in the tag, since it is not the tag associated to the integration, but we will still send the episodes to LabcastARR when they are added to that tag. 
- LabcastARR API is asynchronous so we must be able to handle the response from the API and update the status of the episode in 2watcharr accordingly. We will use the status field in the episode details page to show the status of the episode in LabcastARR. 
- We need to gracefully manage errors from the API and show them to the user in the episode details page utilizing domain error messages and user friendly messages for the user, for example, as we already do with other api calls to `yt-dlp`.

### Requirements in Settings

In settings tab we need to:

- [ ] Add a new tab named "Integrations"
  - [ ] This tab will include a section named "Integration with LabcastARR" with the following fields:
    - [ ] a toggle to enable/disable the integration with LabcastARR (when disabled the rest of the fields will be hidden)
    - [ ] LabcastARR API URL
    - [ ] LabcastARR API TOKEN
    - [ ] LabcastARR Channel ID (where the episodes will be created)
    - [ ] a text field for the 2watchARR tag that will be used to identify the episodes that we want to automatically send to LabcastARR when the integration is enabled. By default the tag will be "2WatchARR" but the user can change it to any other tag they want. This field will only be visible if the integration is enabled.
    - [ ] a dropdown with audio quality options: "default", "low", "medium", "high". When default is selected we ommit sending this opttion in the API and LabcastARR will use default option.
    - [ ] a dropdown with audio language options: "default", "en", "es". When default is selected we ommit sending this opttion in the API and LabcastARR will use default option."
    - [ ] a "Test connection" button that will check if the provided credentials are valid and show a success or error message accordingly
    - [ ] a "Save" button that will save the provided credentials and enable the integration if the test connection was successful
    - [ ] a "Cancel" button that will discard any changes made to the credentials and keep the previous ones

### Requirements in API

We include the documentation of LabcastARR API with the available endpoints and the expected request and response formats. Use it to define the api calls we need to put up in place and send episodes from 2WatchARR to LabcastARR.

This documentation is included in the file `LabcastARR-API-REFERENCE.md` and `LabcastARR-INTEGRATION-API-GUIDE.md`.


---

## v2

Lets continue planning you pointed out something worth planning in more detail.

We will potentially allow more integrations between 2watcharr and other apps so we have to take this into consideration and plan how to store those settings. Definetely we need to store securely store the API TOKEN in the database.

Also important, the app is multi-tenant. Various users can have different videos and different tags. We should consider the new options 
1. to allow integrating with LabcastARR from different 2watcharr users, 
2. to allow integrating the same user with multiple channels in LabcastARR (utilizing different tags to send to one or another channel)

Lets consider this and factor it into the plan before we start implementing any code


---