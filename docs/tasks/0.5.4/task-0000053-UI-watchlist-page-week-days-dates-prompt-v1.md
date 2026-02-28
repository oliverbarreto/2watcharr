# Task UI: Improve the UI in Watchlist page to show weekdays of current week
- IDE: Antigravity
- Date: 20260217
- Model: Gemini Flash 3.0

## Overview

The watchlist page shows the date of the episode as section titles. Currently it shows today, yesterday, and then ti uses the date. We want to show the current week days (Monday to Sunday) as section titles, but only for the current week. For the the rest of dates, we use the same patern eg: February 13, 2026 (14 episodes).

Weeks start on monday, end on sunday.

Example:
- today (Tuesday February 17, 2026)
- yesterday (Monday February 16, 2026)
- February 15, 2026
...