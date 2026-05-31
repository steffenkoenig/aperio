# Saved Views and Favorites - Troubleshooting

This guide provides support steps for issues related to the Saved Views and Favorites functionalities.

## Missing or Disappeared Favorites / Views

**Symptom**: A user reports that their pinned favorites in the sidebar or their saved views in a table have vanished.

**Diagnosis / Resolution**:
1. **Spec Identification**: Favorites and Saved Views are tightly coupled to the OpenAPI specification's Title and Version. If the user loads a new version of the spec (e.g., v1.1.0 instead of v1.0.0), the storage key changes, and previous favorites are not loaded.
   - *Fix*: This is intended behavior to prevent views from attempting to load missing columns or paths. Users must recreate views for new spec major/minor versions if the title/version strings differ.
2. **Local Storage Cleared**: Because this data is stored in the browser's `localStorage` (key: `aperio-store`), clearing browser data, running in Incognito/Private mode, or strict privacy extensions will wipe or prevent saving this data.
   - *Fix*: Instruct the user to ensure `localStorage` is permitted and not to clear their browsing data if they wish to keep their dashboard preferences.

## Table Fails to Load After Applying a Saved View

**Symptom**: The user clicks a saved view, and the table crashes, hangs, or displays a React error.

**Diagnosis / Resolution**:
1. **Schema Mismatch**: This can occur if the user loads an updated OpenAPI spec where a column/field that was previously saved in the view's `sorting` or `columnVisibility` state no longer exists.
   - *Fix*: While `@tanstack/react-table` generally handles missing columns gracefully, extreme structural changes might cause issues.
   - *Action*: Instruct the user to clear their local storage manually. Open Developer Tools (F12) -> Application Tab -> Local Storage -> Right-click `aperio-store` and delete it. Then refresh the page.

## Storage Quota Errors

**Symptom**: The user cannot save a new view and sees a browser error regarding quota limits.

**Diagnosis / Resolution**:
1. **Data Bloat**: While we only store metadata, heavy usage across dozens of API specs could theoretically hit the 5MB browser limit.
   - *Fix*: Tell the user to delete old saved views or clear their `localStorage` for `aperio-store` entirely to start fresh.
