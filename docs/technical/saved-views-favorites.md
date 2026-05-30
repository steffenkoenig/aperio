# Technical Architecture: Saved Views and Favorites

This document details the state management and persistence strategy for the Saved Views and Favorites feature.

## State Management

The feature relies entirely on client-side state managed via `zustand` in the `src/store/spec-store.ts` file.

### Data Structure

The `useSpecStore` was extended with two primary objects:

1.  **`favorites`**: `Record<string, string[]>`
    *   Maps the `specSource` (a unique string identifying the loaded OpenAPI spec) to an array of resource `slug` strings.
    *   Example: `{ "https://api.example.com/openapi.json": ["users", "orders-v1"] }`

2.  **`savedViews`**: `Record<string, Record<string, Record<string, unknown>>>`
    *   Maps the `specSource` to a secondary dictionary of endpoint paths (e.g., `/users`), which in turn maps to a dictionary of view names (e.g., "Active Users") containing the raw TanStack Table state object.
    *   The saved state object captures:
        *   `sorting`: Array of `{ id: string, desc: boolean }`
        *   `globalFilter`: string
        *   `columnVisibility`: Object mapping column IDs to boolean visibility.
        *   `columnFilters`: Array of column-specific filters.
    *   Example: `{ "https://api.example.com/openapi.json": { "/users": { "Active Users": { sorting: [...], globalFilter: "active" } } } }`

### Persistence Strategy

We leverage the `zustand/middleware` `persist` utility to automatically synchronize these objects to the browser's `localStorage` under the key `aperio-store`.

*   **Partitioning by Spec:** To ensure that favorites and views from one API spec do not bleed into another, all data is strictly keyed by `specSource`.
*   **Partializing:** The `partialize` configuration in the `zustand` store is explicitly configured to whitelist `favorites` and `savedViews` for local storage serialization.

### Component Integration

*   **`ResourcePage`**: Injects a `Star` icon into the page header, bound to `toggleFavorite(slug)`.
*   **`SidebarNav`**: Intercepts the rendering cycle, flattening the hierarchical `ResourceNode` tree to match the saved `slug` array. Pinned nodes are rendered in a separate `ScrollArea` block at the top of the sidebar.
*   **`ResourceTable`**: Manages local TanStack table state (`columnVisibility`, `columnFilters`, `sorting`, `globalFilter`). A `select` dropdown allows the user to overwrite this local state with the state fetched from `savedViews[specSource][path][viewName]`. The save dialog directly invokes `saveTableView`.