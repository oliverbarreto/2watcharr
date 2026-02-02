# Channel Card UI Improvements

Improve the channel cards on the channels page with better UX for drag-and-drop, expanded overlay, and per-channel metadata syncing.

## User Review Required

> [!IMPORTANT]
> The sync metadata button will be added to every card and will be available to all users (not just admins). This is a change from the current behavior where only admins can sync metadata via a global button at the top of the page.

> [!NOTE]
> The drag handle (red bar) will only appear on hover to reduce visual clutter, but cards will remain draggable at all times.

## Proposed Changes

### [MODIFY] [page.tsx](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/app/channels/page.tsx)

**Changes to [SortableChannelCard](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/app/channels/page.tsx#71-189) component:**

1. **Drag Handle Visibility**: Make the red drag handle bar (lines 180-185) only visible on hover by adding `opacity-0 group-hover:opacity-100 transition-opacity` classes

2. **Expanded Overlay**: Change the overlay (lines 127-178) from covering only the bottom third (`h-1/3`) to covering the entire card (`inset-0`). This provides more space for channel information and tags

3. **Add Sync Metadata Button**: Add a new sync button in the top-left corner of each card that:
   - Is visible on hover (similar to the delete button)
   - Calls a new per-channel sync function
   - Shows loading state while syncing
   - Available to all users (not just admins)

4. **Remove Global Sync Button**: Remove the admin-only "Sync Metadata" button from the top of the page (lines 351-361)

**New state and handlers:**

1. Add state to track which channel is currently syncing: `const [syncingChannelId, setSyncingChannelId] = useState<string | null>(null)`

2. Add handler for per-channel sync:
   ```typescript
   const handleSyncChannel = async (channelId: string, channelUrl: string) => {
     setSyncingChannelId(channelId);
     try {
       const response = await fetch(`/api/channels/${channelId}/sync`, { 
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({ url: channelUrl })
       });
       
       if (!response.ok) {
         const errorData = await response.json().catch(() => ({}));
         throw new Error(errorData.error || 'Sync failed');
       }

       const data = await response.json();
       toast.success('Channel metadata synced successfully');
       fetchChannels();
     } catch (error) {
       console.error('Error syncing channel:', error);
       toast.error(error instanceof Error ? error.message : 'Failed to sync channel metadata');
     } finally {
       setSyncingChannelId(null);
     }
   };
   ```

---

### [NEW] [route.ts](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/app/api/channels/[id]/sync/route.ts)

Create a new API endpoint for syncing individual channel metadata:

```typescript
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { getDatabase } from '@/lib/db/database';
import { MediaService } from '@/lib/services';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { url } = await request.json();
    const db = await getDatabase();
    const mediaService = new MediaService(db);

    // Sync single channel metadata
    const metadata = await mediaService.metadataService.extractChannelMetadata(url);
    
    if (metadata.name) {
      await mediaService.channelRepo.update(params.id, {
        name: metadata.name,
        description: metadata.description,
        thumbnailUrl: metadata.thumbnailUrl,
        url: metadata.url,
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Channel metadata synced successfully',
    });
  } catch (error) {
    console.error('Error syncing channel:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to sync channel' },
      { status: 500 }
    );
  }
}
```

## Verification Plan

### Automated Tests
- Run existing tests to ensure no regressions: `npm test`

### Manual Verification
1. **Drag Handle Visibility**: 
   - Verify the red drag handle bar is hidden by default
   - Verify it appears when hovering over a card
   - Verify cards can still be dragged even when the handle is not visible

2. **Expanded Overlay**:
   - Verify the overlay now covers the entire card
   - Verify all channel information is readable
   - Verify tags are displayed properly with more space

3. **Sync Metadata Button**:
   - Verify the sync button appears in the top-left corner on hover
   - Click the sync button and verify it shows loading state
   - Verify successful sync updates the channel information
   - Verify error handling with an invalid channel URL
   - Verify the button is available to non-admin users

4. **Image Hover Effect**:
   - Verify the image still grows on hover (scale effect should remain)

5. **Global Sync Button Removal**:
   - Verify the global "Sync Metadata" button is no longer visible at the top of the page
