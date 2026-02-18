# FEATURE: Differentiate youtube videos vs youtube shorts
- IDE: Antigravity
- Date: 20260218
- Model: Gemini Flash 3.0


## Overview

We want to differentiate youtube videos vs youtube shorts in the UI. We want to show the message "shorts" in the actual pills that differentiate videos and podcasts (top right corner of the video cards).

I consider adding a new column to the database to store this information. We should run a script to update the existing data in the database to add this information for existing videos.
