# Form Auto-Save Troubleshooting

## Issue: Drafts are not saving or restoring

**Symptoms:** Entering data into a form and reloading the page results in an empty form. The "Draft restored" notification does not appear.

**Potential Causes:**
1. **Incognito/Private Browsing Mode:** Many browsers heavily restrict or completely clear `localStorage` in private browsing windows. If the user closes the window, the draft is lost.
2. **Browser Storage Quota:** If `localStorage` is completely full (typically around 5MB limit per origin), the application will fail to save the draft. The application silently catches `QuotaExceededError` to prevent crashing, but the data will not be saved.
3. **Cookie/Storage Blockers:** Strict privacy extensions or browser settings that block third-party or local storage will prevent the auto-save mechanism from functioning.

**Resolution:**
- Ask the user to verify they are not using a restrictive incognito mode.
- Ask the user to clear their browser cache/storage for the Aperio dashboard origin if they suspect they have hit the storage quota.
