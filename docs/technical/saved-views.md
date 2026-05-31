# Saved Views and Favorites - Technical Architecture

This document outlines the technical implementation of the Saved Views and Favorites features.

## State Management (`useSpecStore`)

Both Favorites and Saved Views rely on the global Zustand store (`src/store/spec-store.ts`). We utilize the `persist` middleware to ensure these preferences survive page reloads by serializing the state to `localStorage`.

### Data Structures

#### Favorites
```typescript
favorites: Record<string, string[]>
```
- **Key**: A unique spec identifier combining the spec title and version (e.g., `MyAPI-1.0.0`). This ensures that favorites do not bleed across different OpenAPI files loaded by the user.
- **Value**: An array of resource `slug` strings.

#### Saved Views
```typescript
savedViews: Record<string, Record<string, SavedView[]>>
```
- **Outer Key**: The unique spec identifier (`specKey`).
- **Inner Key**: The full resource path (e.g., `/users/{id}`).
- **Value**: An array of `SavedView` objects.

```typescript
export interface SavedView {
  id: string;
  name: string;
  sorting: SortingState;
  columnVisibility: Record<string, boolean>;
  globalFilter: string;
}
```

## Component Integration

### Favorites (Sidebar)
The `SidebarNav` component (`src/components/sidebar-nav.tsx`) queries the store for the current spec's favorites. It iterates through the loaded `ResourceNode` tree to find matches by slug and renders them at the top of the sidebar under a dedicated "Favorites" heading.

### Resource Table
The `ResourceTable` component (`src/components/resource-table.tsx`) integrates deeply with `@tanstack/react-table`:
1. It maintains local React state for `sorting`, `globalFilter`, and `columnVisibility`.
2. A `DropdownMenuCheckboxItem` maps over the table's leaf columns to toggle visibility.
3. When a view is saved, the current state of `sorting`, `globalFilter`, and `columnVisibility` is serialized into a `SavedView` object and dispatched to the store.
4. Loading a view simply unpacks those properties back into the component's local state hooks, forcing a re-render of the React Table.

## Storage Constraints
Since `localStorage` is synchronously parsed and strictly size-limited (typically ~5MB), storing full table data is avoided. The `SavedView` object strictly contains lightweight configuration metadata (`SortingState` arrays and boolean visibility flags), ensuring a minimal footprint.
