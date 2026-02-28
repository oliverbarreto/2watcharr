# BUGFIX: Navbar localhost link
- IDE: Antigravity
- Date: 20260217
- Model: Gemini Flash 3.0

## Overview

In navbar the link to switch user, which takes the user back to the user selection page, navigates to  localhost (http://localhost:3000/login), even in production builds. It should point to the propert url production URL.