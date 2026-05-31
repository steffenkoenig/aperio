# Saved Bookmarks

Aperio allows you to save your exact dashboard state with a single click, saving you time from repetitive data entry.

## What is a Bookmark?

A Bookmark captures the current context of a specific API endpoint, including:
- For GET endpoints: The exact query parameter values and table filters.
- For POST/PUT/PATCH endpoints: The form configuration, request body payload, and specific parameter values.

This means you can easily store frequent queries, common payloads for complex requests, and heavily filtered dataset views directly within the dashboard.

## How to Create a Bookmark

1. Navigate to the resource you want to test and perform any required actions (like adding a search filter to the table or filling out the request form).
2. Click the **Save View** button located next to the `Refresh` or `Copy as Fetch` actions on the table or form panel.
3. In the dialog, give your bookmark a clear name (e.g., "Active Users Query" or "Create Admin Payload").
4. Press **Save Bookmark**.

## Accessing Your Bookmarks

All saved states can be found under the **Bookmarks** panel in the top-right navigation bar of the application.

1. Click the **Bookmarks** button in the top bar. A side panel will open showing all of your saved states.
2. The list will clearly distinguish between table filters and form payloads.
3. Click **Apply** on a bookmark to instantly navigate to the resource and restore its previous configuration exactly as you saved it.
4. You can also click **Remove** to delete bookmarks you no longer need.

## Privacy

Bookmarks are stored completely locally on your machine using your browser's `localStorage`. No data about your saved payloads or view history is transmitted back to Aperio or any remote server.