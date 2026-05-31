# Saved Bookmarks Architecture

The Saved Bookmarks feature allows users to persist their complex form inputs and table filters for quick retrieval without relying on a backend database. This is achieved by securely persisting the UI state exclusively in the browser using Zustand.

## Core Store (`spec-store.ts`)

The `useSpecStore` is the central state management solution using `zustand` and `zustand/middleware`'s `persist` layer.

We introduced two new states to track bookmark behavior:
- `bookmarks: Bookmark[]`: The list of all saved user configurations.
- `activeBookmark: Bookmark | null`: A temporary slot. When a user clicks to "Apply" a bookmark, it is loaded into this active slot and the router navigates to the target slug.

We also expanded the `partialize` configuration to automatically persist the `bookmarks` array into `localStorage` across page reloads. The `activeBookmark` is not persisted, as it is a transient state meant to trigger hydration immediately after navigation.

## Bookmark Type Structure (`types.ts`)

```typescript
export interface Bookmark {
  id: string; // crypto.randomUUID
  name: string;
  type: 'table' | 'form';
  path: string;
  slug: string;
  method?: string; // Optional because GET endpoints don't need distinct method grouping
  pathParams: Record<string, string>;
  formData?: Record<string, unknown>; // Preserves full JSON form payloads
  globalFilter?: string; // Preserves table search criteria
}
```

## Component Hydration Flow

1. **Selection:** The user opens the `BookmarksPanel` (a shadcn `Sheet`) and selects a bookmark.
2. **Activation:** The `setActiveBookmark` method loads the state into the store, and `router.push` navigates to the respective slug.
3. **Mounting:** Either `ResourceTable` or `ResourceForm` mounts.
4. **Hydration (useEffect):** Both components contain a `useEffect` hook that listens for changes to `activeBookmark`.
5. **Consumption:** If the active bookmark matches the current component's slug, type, and (for forms) method, the component will:
   - Call `setGlobalFilter` or `setFormData` using the bookmark's state.
   - Map and call `setPathParam` for any inherited URL path arguments.
   - Fire `clearActiveBookmark` to consume the transient state, preventing infinite re-render loops or phantom state pollution.