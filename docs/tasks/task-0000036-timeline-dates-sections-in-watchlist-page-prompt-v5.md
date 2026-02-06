# Task: Difference between manual and date added filtering 

What is the difference between manual and date added filtering ?


Thought for 4s

Searched
onSortChange
6 results
Analyzed

page.tsx#L80-140
Analyzed

episode-list.tsx#L1-100

Thought for 1s


Searched
route.ts
4 results
Analyzed

route.ts#L1-124
Analyzed

media.service.ts#L1-320

Thought for <1s


Manual and Date Added are sorting options, and while they look similar because they both now use date sections (like "Today", "Yesterday"), they differ in how episodes are ordered within those sections:

1. Manual (Custom)
Purpose: Allows you to define your own order.
Behavior: This mode is used when you want to drag and drop episodes to rearrange them. If you move a video to the top of the "Today" section, it stays there.
Grouping: It still groups episodes by the date they were added, but the order of videos inside each group is your own custom preference.
2. Date Added
Purpose: Provides a strict chronological history.
Behavior: This mode is automatic. Episodes are always listed in the exact order they were added to the database. You cannot manually rearrange them in this mode because the "Date Added" timestamp dictates their position.
Grouping: It groups episodes by date and then sorts them by the exact second they were added (typically showing the newest at the top of each section).
Summary Table:

Feature	Manual	Date Added
Logic	User-defined (Drag & Drop)	Chronological (Automatic)
Grouping	By Date Added	By Date Added
Order within groups	Custom	Newest to Oldest
Use Case	Organizing your daily queue	Checking your recent add history
Note on Filtering: Following your recent request, Priority and Favorite are now filters (the Diamond 💎 and Star ⭐ buttons), not sorting options. This means they actually subtract items from the list rather than just rearranging them.

Good
Bad


