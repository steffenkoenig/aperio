# Troubleshooting Saved Views & Favorites

As user preferences are persisted to `localStorage`, users might occasionally run into state corruption issues if the underlying OpenAPI specification dramatically changes (e.g., resource paths are renamed, or columns are completely removed).

## Resetting Preferences Manually
If a saved view crashes the table or a favorite is linking to a dead path, the user can reset their preferences for that API.

**To clear local storage:**
1. Open the browser's Developer Tools (F12 or Ctrl+Shift+I / Cmd+Option+I).
2. Go to the **Application** tab (Chrome/Edge) or **Storage** tab (Firefox).
3. Expand **Local Storage** and select the Aperio URL.
4. Delete the key named `aperio-store`.
5. Refresh the page.

*Note: Deleting `aperio-store` will also clear environment configurations.*
