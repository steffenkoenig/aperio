# Troubleshooting Saved Views and Favorites

If users experience issues with their Favorites or Saved Views in the Aperio dashboard, follow these support steps.

## Common Issues

### "My favorites and saved views disappeared!"

*   **Cause:** The dashboard relies entirely on the browser's `localStorage`. If the user clears their browser cache/cookies or uses an Incognito/Private browsing window, this local data is completely erased.
*   **Resolution:** Favorites and views cannot be recovered once local storage is cleared. The user must manually recreate them. Inform the user that Aperio is a client-side tool and data persistence is bound to their specific browser session.

### "I clicked a Saved View but the table looks broken or is missing columns."

*   **Cause:** The OpenAPI specification may have changed. If a user saves a view that filters or sorts on a specific property (e.g., `status`), and the API developer subsequently removes that property from the OpenAPI schema, the Saved View will attempt to apply sorting/filtering to a non-existent column.
*   **Resolution:**
    1. Instruct the user to switch back to the **Default View** using the dropdown.
    2. Ask the user to delete the broken Saved View (or overwrite it by saving a new view with the same name).
    3. Reconfigure the table based on the *current* available schema columns and save it again.

### "Favorites are showing up for the wrong API."

*   **Cause:** Favorites are keyed by the specific URL or filename of the OpenAPI spec (`specSource`). If two distinct APIs are loaded using the exact same URL (e.g., a generic localhost URL like `http://localhost:8080/openapi.json` that points to different APIs depending on the running server), the dashboard cannot distinguish between them and will mix their states.
*   **Resolution:** Advise the user to access different local APIs using distinct URLs or to temporarily clear their Aperio local storage when switching between completely different APIs on the exact same endpoint.

## Resetting State Manually

If the local storage state becomes hopelessly corrupted causing crashes, the user can reset it manually:
1. Open the Browser Developer Tools (F12).
2. Navigate to the **Application** tab (Chrome/Edge) or **Storage** tab (Firefox).
3. Select **Local Storage** and find the Aperio domain.
4. Delete the key named `aperio-store`.
5. Refresh the page. (Note: This will also reset configured environments).