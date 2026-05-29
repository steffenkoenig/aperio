# Saved Bookmarks

## Goal
Provide users with the ability to bookmark and quickly access frequently used API queries, applied filters, or complex form configurations directly from the Aperio dashboard.

## Problem
In many APIs, users frequently test or interact with the same specific endpoints using a consistent set of query parameters, table filters, or payload structures. Currently, users must manually re-enter these configurations each time they visit a resource or refresh the page, which is time-consuming and prone to errors. There is no built-in mechanism to "save" a specific dashboard state for rapid retrieval.

## Proposed Changes
- Implement a "Bookmark" button within the `ResourceTable` (for GET requests with filters/pagination) and `ResourceForm` (for POST/PUT/PATCH requests).
- Create a new "Bookmarks" tab in the sidebar navigation or a dedicated slide-out panel to list all saved states.
- When saving a bookmark, capture the current URL path, active query parameters, applied table filters, and form payload state, storing this data in `localStorage` using Zustand.
- Allow users to name their bookmarks and group them by tags or categories for easier organization.
- Clicking a saved bookmark should navigate the user to the respective resource and automatically populate the state (filters, form data) to match the saved configuration.

## Definitions of Done
- Bookmark button is visible and functional on table and form views.
- Users can name and save their current view state (filters, query params, form data).
- A centralized list of bookmarks is accessible via the UI (sidebar or panel).
- Selecting a bookmark accurately restores the previous state and navigates to the correct resource.
- Bookmarks can be edited or deleted.
- The feature is fully client-side and functional across page reloads.

## Technical & Compliance Considerations
- **Documentation:** Update user documentation (`docs/customer`) to explain how to create, use, and manage bookmarks. Update technical documentation (`docs/technical`) to describe the Zustand store structure for bookmarks.
- **Testing:** Write unit tests for the bookmark state management logic. Add component tests to ensure the Bookmark button renders correctly and that restoring a bookmark populates forms and tables as expected.
- **Security:** Ensure that sensitive information (e.g., passwords or auth tokens temporarily entered into forms) are either explicitly excluded from the bookmark payload or masked. Rely entirely on secure `localStorage` mechanisms.
- **Reliability:** Gracefully handle scenarios where a saved bookmark refers to an endpoint or schema that no longer exists in the loaded OpenAPI spec (e.g., show a clear error message instead of crashing).
- **Accessibility:** Ensure the bookmarking UI elements (buttons, modals for naming) are fully keyboard navigable and include appropriate ARIA labels for screen readers.
- **GDPR Compliance:** As bookmarks are saved locally in the browser's `localStorage` and never transmitted to external servers, this feature is fully compliant with data minimization principles.

## Future Press Release
**Save Time with Aperio Bookmarks: Your Favorite Workflows, Instantly Accessible**
Today, we are excited to introduce Saved Bookmarks for Aperio. We know that interacting with complex APIs often involves repetitive tasks—entering the same query filters or filling out intricate request payloads day after day. With our new Bookmarks feature, you can now save your exact dashboard state with a single click. Whether it's a heavily filtered resource table or a multi-step configuration form, simply bookmark it, give it a name, and access it instantly from your sidebar anytime you return. No more repetitive data entry or lost queries. Because Bookmarks are stored securely within your browser, your workflow data remains entirely private and compliant. Streamline your API testing and management experience with Aperio Bookmarks today.
