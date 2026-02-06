# Implementation Plan - Fix Tags Management Autofill Error

The error `TypeError: node.tagName.toLowerCase is not a function` in `bootstrap-autofill-overlay.js` is caused by "DOM Clobbering". Inside a `<form>`, an element with `id="tagName"` overrides the standard `tagName` property of the form element itself. When the Bitwarden script tries to access `form.tagName.toLowerCase()`, it gets the input element object instead of the "FORM" string, leading to the crash.

## Proposed Changes

### Settings Page

#### [MODIFY] [page.tsx](file:///Users/oliver/_HD_LOCAL/dev/2watcharr/src/app/settings/page.tsx)

- Rename `id="tagName"` to `id="new-tag-name"`.
- Update the corresponding `Label`'s `htmlFor` attribute.
- Add `autoComplete="off"`, `data-1p-ignore`, `data-bwignore`, and `data-lpignore="true"` to all tag-related inputs to prevent future interference from autofill services.

## Verification Plan

### Manual Verification
- Since the error is reported by a browser extension (Bitwarden) in a production/deployed environment, manual verification involves:
    1.  Confirming that the `id="tagName"` is gone from the rendered HTML.
    2.  Verifying that the "Add Tag" functionality still works as expected (label clicking focuses the input, form submits correctly).
    3.  Checking that the browser console is clear of the reported error when using Bitwarden on the settings page (if possible, or asking the user to verify).
