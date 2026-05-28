# Global Command Palette

## Goal
Provide users with a rapid, keyboard-driven search interface to navigate across large OpenAPI specifications, allowing them to instantly find resources, specific endpoints, or paths without manually browsing the hierarchical sidebar.

## Problem
When users load massive OpenAPI specifications (e.g., enterprise APIs with hundreds of endpoints and tags), finding a specific resource or endpoint by visually scanning and expanding sidebar folders becomes tedious and time-consuming. There is currently no quick search mechanism to filter and jump directly to a desired path.

## Proposed Changes
- Implement a global "Command Palette" component (e.g., using `cmdk` or a Radix UI dialog combined with an input field).
- Bind the palette to a global keyboard shortcut (e.g., `Ctrl+K` or `Cmd+K`).
- Aggregate all available resources, paths, and HTTP methods from the loaded OpenAPI spec in the Zustand store (`spec-store.ts`) into a searchable index.
- Display a categorized search result list within the palette, allowing users to filter by typing.
- Upon selection, automatically navigate the user to the corresponding resource view (`/dashboard/resource/[slug]`).

## Definition of Done
- The Command Palette can be opened via `Ctrl+K`/`Cmd+K` from any page within the dashboard.
- It can also be opened via a dedicated search button/icon in the top navigation bar.
- The palette instantly searches across all loaded tags, paths, and endpoints, displaying real-time results categorized by type.
- Selecting a search result successfully navigates the UI to the correct resource page and focuses the correct tab/operation.
- The UI handles empty search results gracefully.

## Technical & Compliance Considerations
- **Documentation:** Updates will be made across all three documentation architectures:
  - `/docs/customer`: Add a new guide explaining the keyboard shortcuts and how to use the command palette to find endpoints quickly.
  - `/docs/technical`: Document the search indexing strategy, the event listeners used for global shortcuts, and how the component interacts with the `spec-store`.
  - `/docs/support`: Add troubleshooting steps for cases where the shortcut might conflict with browser extensions.
- **Testing:** Write component tests for the Command Palette UI, ensuring it opens and closes correctly. Write unit tests for the search filtering logic to verify accurate result matching.
- **Security:** The search index is generated entirely client-side based on the currently loaded spec. No search queries are sent to external servers, mitigating risk of exposing API structures.
- **Reliability:** The search algorithm should be optimized to handle very large specs without blocking the main UI thread. Debouncing input may be necessary.
- **Accessibility:** Ensure the command palette dialog manages focus trapping correctly, is fully navigable via keyboard (up/down arrows to select, Enter to confirm, Esc to close), and has appropriate ARIA attributes for screen readers.
- **GDPR Compliance:** As all searching and indexing happen locally in the browser memory, no user data or search history is transmitted externally, ensuring full compliance.

## Future Press Release
**Navigate Your APIs at the Speed of Thought with Aperio's Command Palette**
Today, we are introducing the Global Command Palette to Aperio, drastically reducing the time it takes to explore complex API specifications. We know that enterprise APIs can contain hundreds of endpoints, making manual navigation a chore. With the new Command Palette, a simple `Ctrl+K` instantly brings up a powerful search interface, allowing you to jump straight to the exact resource or endpoint you need just by typing. Whether you are looking for a specific GET request or a deeply nested sub-resource, Aperio gets you there in milliseconds. Designed with keyboard power users in mind, the entire experience is fast, accessible, and completely local to your browser. Experience frictionless API exploration with Aperio today.
