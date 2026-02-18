# Implementation Plan - Add Notes to Episodes

Allow users to add and edit personal notes for each episode to track themes, reflections, or specific details.

## Proposed Changes

### Database

#### [MODIFY] [schema.sql](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/lib/db/schema.sql)
- Add `notes TEXT` to the `episodes` table.

#### [MODIFY] [migrations.ts](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/lib/db/migrations.ts)
- Add a new migration `add_episode_notes` to add the `notes` column to the `episodes` table for existing users.

### Domain Models

#### [MODIFY] [models.ts](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/lib/domain/models.ts)
- Update [MediaEpisode](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/lib/domain/models.ts#31-63) interface to include `notes: string | null`.
- Update [UpdateEpisodeDto](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/lib/domain/models.ts#108-121) to include `notes?: string`.

### Backend Implementation

#### [MODIFY] [media.service.ts](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/lib/services/media.service.ts)
- Update SQL queries in `getEpisode`, `updateEpisode`, and `getEpisodes` to include the `notes` column.

#### [MODIFY] [route.ts](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/app/api/episodes/%5Bid%5D/route.ts)
- Update `updateEpisodeSchema` to allow `notes: z.string().max(1000).optional()`.

### Frontend Implementation

#### [MODIFY] [episode-card.tsx](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/components/features/episodes/episode-card.tsx)
- Add a new "Note" icon (StickyNote from lucide-react) to the card if `episode.notes` is present.
- Add an "Add/Edit Note" item to the `DropdownMenu`.
- Implement a `Dialog` (modal) for adding/editing notes.
    - Centered modal.
    - Textarea for the note.
    - Real-time character count (max 1000).
    - Save and Cancel buttons.
    - Close on Esc and clicking outside.

## Verification Plan

### Automated Tests
- Run existing tests to ensure no regressions:
  ```bash
  npm test src/lib/services/media.service.test.ts
  ```

### Manual Verification
1. **Add Note**:
   - Open the options menu on an episode card.
   - Click "Add Note".
   - Enter text and verify character count.
   - Click "Save".
   - Verify the note icon appears on the card.
2. **Edit Note**:
   - Open options menu -> "Edit Note".
   - Modify text and save.
   - Re-open to verify changes.
3. **Character Limit**:
   - Try to enter more than 1000 characters.
   - Verify saving is prevented or truncated as per implemented validation.
4. **Modal Behavior**:
   - Verify closing with "Cancel" button.
   - Verify closing with "Esc" key.
   - Verify closing by clicking outside.
5. **Retro-compatibility**:
   - Run the app on an existing database and verify the migration applies successfully and existing episodes have no notes (NULL).
