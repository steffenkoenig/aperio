# Troubleshooting: Saved Views & Favorites

## "My Favorites disappeared after a browser update or clearing history"

Aperio stores your Favorites and Saved Views entirely within your browser's local storage to maximize speed and ensure your data remains private. If you clear your browser's site data, cookies, or local storage, this configuration will be lost and cannot be recovered. You will need to recreate your saved views and favorite resources.

## "I saved a view, but loading it doesn't seem to apply my filters"

Ensure that the data returned by the API still supports the columns you filtered on. If the underlying OpenAPI specification has changed and a column was removed, the table will safely ignore sorting instructions for that missing column to prevent application crashes.

## How to perform a hard reset on saved state

If the application gets into an unrecoverable state due to corrupted local storage data, you can clear it via the browser's Developer Tools:
1. Open Developer Tools (F12 or Ctrl+Shift+I).
2. Go to the **Application** tab (Chrome/Edge) or **Storage** tab (Firefox).
3. Expand **Local Storage** and select the URL of the Aperio dashboard.
4. Delete the key named `aperio-store`.
5. Refresh the page. Note: This will also log you out of any configured App Environments.
