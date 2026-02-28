# TASK: UI: Update the navigation bar

## Overview

In mobile devices, as you can see in the image provided we have the logo as a button as hamburger to show the navigation menu. It currently works perfectly but we should show the current page in the navigation menu, right next to the logo, to its right.

We have to make sure that there is enough space in the navigation bar and that the menu is still working as expected.

Also we should remove the unarchived icon button from the navigation menu as it is implemented right now between the search bar and the settings icon in the top right of the screen, and add it as a menu option both in the navigation menu "Archive" and in the mobile hamburger menu "Archive". Place it between the "Watch Next" and "Stats" menu options.


---

## v2

I ran npm run dev and testing  http://localhost:3000 i get an error on the browser since we have no database "SQLITE_CANTOPEN: unable to open database file". Aren't we creating the database if it does not exist ? we should handle this "start fresh" case
