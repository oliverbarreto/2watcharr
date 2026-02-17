# Task: Modifications to task-0000036-timeline-dates-sections-in-watchlist-page-prompt-v4.md

The current behavior is a bit odd. Let's make the following changes and simplify the logic and features:

1. Let's remove from the filter dropdown menu the options: `priority`, `favorite`, `duration` and `title`.

2. Let's add an option in the watchlist page with a checkbox for `priority` and another checkbox for `favorite` to enable filtering the episodes that have `priority` and `favorite`  meaning that if the user checks the checkbox for `priority` and `favorite` then we will show only the episodes that have `priority` or `favorite` active in the database (true), if not they are not shown in the current filtered list, resulting in less episodes to be shown in the list. 

3. Now, we need to do some changes to the sorting. Right now the sorting button ascending/descending only works by ordering the episodes inside each section. 

Now in all filters, the sorting button ascending/descending should sort the entire list, sorting the dates of each section, not only the episodes inside each section.

For example for the case of `date added` the expected behavior will be:

```
EXPECTED BEHAVIOR (DATE ADDED DEFAULTS - UI shows ):
Today
- video 1 (newest added video in the database)
- video 2
- video 3
Yesterday
- video 4
- video 5
- video 6 (oldest added video in the database)
```

Then when the user clicks ⬆ results in:
```
EXPECTED BEHAVIOR (DATE ADDED - UI shows ⬇):
Yesterday
- video 6 (oldest added video in the database)
- video 5
- video 4
Today
- video 3
- video 2
- video 1 (newest added video in the database)
```

