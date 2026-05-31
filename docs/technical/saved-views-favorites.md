# Saved Views and Favorites - Architecture

The Saved Views and Favorites features are built entirely client-side using `zustand` with persistence to `localStorage`.

## State Management
Preferences are managed in `src/store/spec-store.ts` within a new `preferences` object.
The structure is: `preferences: Record<string, SpecPreferences>`.

This mapping ensures that user preferences are safely scoped to the specific OpenAPI `specSource` URL/ID.

### SpecPreferences Interface
```typescript
export interface SpecPreferences {
  favorites: string[]; // Array of resource paths
  savedViews: SavedView[];
}
```

## Favorites Implementation
The `SidebarNav` component reads the `preferences` state and extracts paths from the `favorites` array. It then performs a lookup to extract the matching `ResourceNode` objects from the main `nodes` tree, rendering them at the top of the sidebar in a new block.

## Saved Views Implementation
The `ResourceTable` component syncs TanStack Table state fields (`sorting`, `globalFilter`, and `columnVisibility`) with the `useReactTable` hook. When a custom view is selected, these local react states are explicitly overridden by the values persisted in the `SavedView` object, instantly changing the table layout.
