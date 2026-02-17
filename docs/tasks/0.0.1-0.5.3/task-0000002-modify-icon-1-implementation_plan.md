# New App Icon for 2watcharr

Create a custom app icon for 2watcharr and replace the default Next.js favicon.

## Proposed Changes

### Icon Generation
- Use `generate_image` with a prompt inspired by "2watcharr" (media/movies/TV) and "nanobanana" style.
- Save the generated image.

### Implementation
#### [MODIFY] [favicon.ico](file:///Users/oliver/local/dev/2watcharr/src/app/favicon.ico) [DELETE]
#### [NEW] [icon.png](file:///Users/oliver/local/dev/2watcharr/src/app/icon.png)
- Next.js supports `icon.png` in the `app` directory as a dynamic icon. I will replace the existing [favicon.ico](file:///Users/oliver/local/dev/2watcharr/src/app/favicon.ico) or add `icon.png`.

## Verification Plan

### Automated Tests
- None applicable for static assets.

### Manual Verification
- Verify the icon appears in the browser tab.
- Check the layout setup to ensure it's correctly linked if necessary.
