# Walkthrough: BUGFIX: Navbar localhost link

I have fixed the issue where the "Switch Profile" link in the navbar would redirect to `localhost:3000` even in production.

## Changes Made

### Layout

#### [navbar.tsx](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/components/layout/navbar.tsx)

Modified the [handleSignOut](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/components/layout/navbar.tsx#61-65) function to use a manual redirect instead of relying on `next-auth`'s internal `callbackUrl` logic, which was likely prepending the `NEXTAUTH_URL` environment variable.

```diff
-    const handleSignOut = () => {
-        signOut({ callbackUrl: '/login' });
-    };
+    const handleSignOut = async () => {
+        await signOut({ redirect: false });
+        window.location.href = '/login';
+    };
```

Using `window.location.href` ensures that the browser redirects to the relative `/login` path on the *current* origin, making it robust across different deployment environments and URLs without needing to rely on environment variables for this specific client-side redirect.

## Verification Results

### Manual Verification
- Verified that `signOut` is only used in the navbar.
- The change uses standard browser APIs (`window.location`) for redirection, which relative paths correctly resolve to the current domain.
- Verified that the code is syntactically correct and using `async/await` appropriately for the `signOut` promise.
