# BUGFIX: Navbar localhost link

The navbar's "Switch Profile" link currently uses `signOut({ callbackUrl: '/login' })`, which defaults to the `NEXTAUTH_URL` environment variable for the base URL. In some environments, this points to `http://localhost:3000`, causing incorrect redirects in production.

This plan aims to make the redirect more robust by using the browser's current origin.

## Proposed Changes

### [Component] Layout

#### [MODIFY] [navbar.tsx](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/components/layout/navbar.tsx)

- Update [handleSignOut](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/components/layout/navbar.tsx#61-64) to use a dynamic `callbackUrl` that relies on `window.location.origin` if available, or use `signOut({ redirect: false })` followed by a manual router push to ensure the redirect is handled by the Next.js router.

```tsx
    const handleSignOut = async () => {
        await signOut({ redirect: false });
        window.location.href = '/login';
    };
```
> [!NOTE]
> Using `window.location.href` is safer for a full "sign out" experience as it ensures any client-side state is cleared and the user is taken to the picking screen.

## Verification Plan

### Automated Tests
- I will verify that the code compiles.
- Since I cannot easily test production redirects in this environment, I will rely on the logic that `window.location` always refers to the current browser's origin.

### Manual Verification
- Click on the user profile in the navbar.
- Click "Switch Profile".
- Verify that it redirects to `/login` on the current domain (not hardcoded to localhost).
- Since I'm in a local environment, it should still go to `localhost`, but the code will now be using a relative/dynamic approach that works in production.
