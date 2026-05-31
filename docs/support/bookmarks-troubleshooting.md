# Troubleshooting: Bookmarks Not Restoring

If users report that clicking a bookmark successfully navigates them to the resource page, but fails to populate the form fields or table filters, consult this debugging sequence.

## 1. Verify `localStorage` Quota
Bookmarks can contain significantly large JSON payloads if the user saved a very deep or nested form.
- Ask the user to open their browser DevTools -> Application -> Local Storage.
- Inspect the `aperio-store` key.
- If the store is empty or the browser reports quota exceeded warnings, ask them to clear older bookmarks.

## 2. Verify Schema Integrity
If an OpenAPI spec has been updated (e.g. they uploaded a new version of the JSON file), the form parameters or path variables may have changed.
- If a bookmark relies on `{userId}` but the path has been renamed to `{id}`, the store's `pathParams` map will attempt to hydrate the old key, leaving the form in an incomplete state.
- Ensure the user tests against the same OpenAPI specification version.

## 3. Debugging the Hydration `useEffect`
Both `ResourceTable` and `ResourceForm` consume the `activeBookmark` via a `useEffect`.
- Ensure the transient `clearActiveBookmark()` call is executing *only after* the state has been successfully mapped.
- If a user triggers a bookmark while already on the exact same page, ensure the effect dependency array `[activeBookmark, slug, ...]` correctly forces a re-render.

## 4. Phantom State
If users report forms are filling out with random data upon fresh navigation, check the transient state store.
- If `clearActiveBookmark()` fails to fire, the Zustand store will retain the payload globally. Next time the user navigates manually to that form, it will falsely assume it needs to rehydrate. Verify that no errors in the `useEffect` block the `clearActiveBookmark` execution.