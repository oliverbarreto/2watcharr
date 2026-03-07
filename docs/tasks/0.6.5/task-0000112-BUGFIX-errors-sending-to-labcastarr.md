# TASK: BUGFIX: Fix errors on use cases sending videos to LabcastARR API (Notifications and Toast Messages)

I have found some things to improve when sending episodes to LabcastARR and the notifications events and toast messages.

## General Improvements

When we send an individual episode to LabcastARR using the option menu in the dropdown menu in episodes cards in the watchlist, the episode is correctly sent to LabcastARR. Also, the correct notifications events are registered and shown in the /activity page. 

However, we need to make the UX more consistent by showing a Toast message to the user indicating that the episode was sent successfully, which is not done now. Also, the notification bell icon in the navbar is not updated to show the new notification. We need to show the user that there is a new notification, in this case, when we finalize correctly, or with error, of the send api call to send to LabcastARR.

## Errors

We have these two errors to fix.

### ERROR 1

We have a weird error i'm gonna try to explain since i have not found the full pattern to reproduce when it occurs. I added two episodes, we got the toas messages that they were added and then we do not open the toast message with the "View" button (eg: "Episode Creation Finalized: 'Necocios v China v Rusia mueven. Trump en plena escalada de EEUU'" and a "View" button in the toast message which should take us to the /activity page).

If i open the /activity page by using the bell icon, the badge resets to no pending notifications and everything is correct. If I now go to the home page, the same two notification Toast message appear again. If i do not click on the "View" button and navigate again to /activity page, and come back to the home again, again, the same two notification Toast message appear again. This repeats forever. The toast messages should only be shown once, and when i visit the /activity page, after a toast message has been triggered, it should not be shown again.

### ERROR2 

Also, we have this error in the browser console we need to anlayze and fix.

```
## Error Type
Console Error

## Error Message
`DialogContent` requires a `DialogTitle` for the component to be accessible for screen reader users.

If you want to hide the `DialogTitle`, you can wrap it with our VisuallyHidden component.

For more information, see https://radix-ui.com/primitives/docs/components/dialog


    at DialogContent (src/components/ui/dialog.tsx:61:7)
    at DialogPortal (src/components/ui/dialog.tsx:25:10)
    at DialogContent (src/components/ui/dialog.tsx:59:5)
    at EpisodeListRow (src/components/features/episodes/episode-list-row.tsx:1045:17)
    at GroupedEpisodeList/<.children</<.children<.children< (src/components/features/episodes/grouped-episode-list.tsx:66:17)
    at GroupedEpisodeList/<.children< (src/components/features/episodes/grouped-episode-list.tsx:55:29)
    at GroupedEpisodeList (src/components/features/episodes/grouped-episode-list.tsx:32:15)
    at renderEpisodes (src/components/features/episodes/episode-list.tsx:276:21)
    at EpisodeList (src/components/features/episodes/episode-list.tsx:339:14)
    at HomePageContent (src/app/page.tsx:230:9)
    at HomePage (src/app/page.tsx:254:7)

## Code Frame
  59 |     <DialogPortal data-slot="dialog-portal">
  60 |       <DialogOverlay />
> 61 |       <DialogPrimitive.Content
     |       ^
  62 |         data-slot="dialog-content"
  63 |         className={cn(
  64 |           "bg-background data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 fixed top-[50%] left-[50%] z-50 grid w-full max-w-[calc(100%-2rem)] translate-x-[-50%] translate-y-[-50%] gap-4 rounded-lg border p-6 shadow-lg duration-200 outline-none sm:max-w-lg",

Next.js version: 16.1.4 (Turbopack)
```
