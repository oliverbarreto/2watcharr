# Improve Channel Details Page

Increase the horizontal space for the channel description and implement tag-based filtering for videos within the channel details page.

## Proposed Changes

### Channel Details Page

#### [MODIFY] [page.tsx](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/app/channels/[id]/page.tsx)

- Remove `max-w-3xl` restriction from the channel description container.
- Add `selectedTagIds` state using `useState<string[]>([])`.
- Update the tag rendering logic:
    - Make tag `Badge` components clickable.
    - Implement a [toggleTag](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/components/features/episodes/filter-bar.tsx#98-106) function to add/remove tag IDs from `selectedTagIds`.
    - Apply selection styles to the `Badge` components following the pattern in [FilterBar](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/components/features/episodes/filter-bar.tsx#46-351).
- Update the [EpisodeList](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/components/features/episodes/episode-list.tsx#49-293) component:
    - Pass `tagIds` from `selectedTagIds` to the `filters` prop.

## Verification Plan

### Manual Verification

1.  **Horizontal Space**:
    - Navigate to a channel details page with a long description.
    - Verify that the description text now takes the full horizontal space available on large screens.
2.  **Tag Filtering**:
    - Click on a tag pill in the channel details header.
    - Verify that the tag becomes visually selected (changed color/background).
    - Verify that the episode list below refreshes to show only videos matching the selected tag.
    - Click the same tag again to deselect it and verify the list shows all videos again.
    - Click multiple tags and verify that the filter correctly shows videos matching ANY of the selected tags (or ALL, depending on current backend implementation, but usually tags are additive OR).
    - *Note*: If I click a tag that has no videos, the list should show "No episodes found".
