# Command Palette Architecture

The Command Palette allows fast, keyboard-driven navigation across an API specification.

## Component Design

- **Trigger**: The palette is mounted globally in `src/app/dashboard/layout.tsx`. It uses a `useEffect` hook to attach a `keydown` listener to the `document` that listens for `Ctrl+K` or `Cmd+K` to toggle the dialog state.
- **Component**: The UI is built using the `cmdk` library, integrated through Radix UI (`@radix-ui/react-dialog`) and shadcn/ui styles (`src/components/ui/command.tsx`).
- **State**: The component relies on the globally available `parsedSpec.resourceTree` from the Zustand store (`src/store/spec-store.ts`).

## Indexing Strategy

When the Command Palette opens, it aggregates data by recursively traversing the loaded `resourceTree`.

```typescript
const traverse = (nodes: ResourceNode[], parentSlug: string = '') => {
  nodes.forEach((node) => {
    // ...
  });
};
```

This generates a flat list of `SearchResult` objects containing the `title`, `type`, `slug`, `path`, and `method`. The indexing is fully client-side and recalculates smoothly when the spec changes.

## Navigation

Selecting an endpoint in the command palette uses Next.js `useRouter` to push the user to `/dashboard/resource/[slug]?method=[METHOD]&path=[PATH]`. The slugification logic matches the sidebar navigation logic to ensure consistency.
