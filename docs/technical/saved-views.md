# Technical Architecture: Saved Views & Favorites

The Saved Views and Favorites features rely entirely on client-side state persistence to ensure speed and privacy.

## Zustand State Management

Both features are powered by the central `useSpecStore` (`src/store/spec-store.ts`).

### State Structure
- `favorites`: An array of `string` representing the unique `id`s of `ResourceNode`s that the user has starred.
- `savedViews`: A dictionary/record mapping a specific endpoint path (e.g., `/api/v1/users`) to an array of `SavedView` objects. Each `SavedView` stores:
  - `id`: A UUID for the view.
  - `name`: The user-defined display name.
  - `sorting`: The TanStack Table sorting state array.
  - `globalFilter`: The current string value of the global search filter.

### Persistence
The `useSpecStore` is wrapped in Zustand's `persist` middleware, configured to save data to the browser's `localStorage` under the key `aperio-store`.

To ensure we don't save ephemeral UI state (like `isLoading`), the `persist` configuration uses the `partialize` function. The `favorites` and `savedViews` keys have been explicitly added to the `partialize` return object, ensuring they survive browser reloads.

## Component Integration

### SidebarNav
The `SidebarNav` component (`src/components/sidebar-nav.tsx`) maps over the `favorites` array. It recursively searches the active `ResourceTree` to map the saved IDs back to full `ResourceNode` objects in order to render the pinned links correctly.

### ResourceTable
The `ResourceTable` component (`src/components/resource-table.tsx`) exposes UI controls that read from and dispatch actions to the `savedViews` dictionary. When a view is loaded, it immediately overwrites the local `useState` variables (`sorting`, `globalFilter`) which are fed directly into the `useReactTable` hook.
