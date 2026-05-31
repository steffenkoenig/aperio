# Technical Architecture

## Schema Resolution
Our local state tree maintains a real-time parsed replica of the source OpenAPI spec.

For `ResourceForm` validation rules, `schema-resolver.ts` is responsible for traversing the nested object constraints and hydrating `#/$ref` pointers into concrete schema objects.

### Arrays and Tuples
As of Version 0.1.1, the `resolveSchema` method explicitly traverses down into array `items` definitions. This allows the `@rjsf/core` view engine to construct inline sub-forms for complex arrays.

**Tuple handling**: If a schema defines `items` as an Array (representing a tuple with heterogeneous positional schemas), the resolver maps over each item individually to resolve its $refs, preserving the exact multi-type definition for downstream RJSF rendering.

## Clean Architecture for Complex Components

To enforce code legibility, testability, and modularity, complex UI components that handle deeply nested states or integrate multiple distinct concerns (such as UI rendering, global state integration, and API submission) are decomposed.

For example, large monolithic files have been restructured into modular directories:
- `src/components/resource-form/`
  - `hooks/`: Contains custom hooks (e.g., `useResourceForm.ts`) that isolate state management, data persistence (auto-save drafts), and direct side effects like API submission.
  - `fields/`: Contains presentation components for recursive UI elements (e.g., `form-field.tsx` and nested array/object schema logic).
  - `index.tsx`: The main entry orchestrator that bridges the hooks with the fields.
- `src/components/resource-table/`
  - `hooks/`: Isolates fetching logic, sorting, filtering, and data hydration (e.g., `useResourceTable.ts`).
  - `components/`: Contains pure UI presentation elements (e.g., `complex-cell-viewer.tsx`).
  - `index.tsx`: Coordinates `@tanstack/react-table` models using the isolated data hook.

This decomposition pattern ensures single-responsibility boundaries, reduces file bloat (eliminating files exceeding typical length thresholds), and facilitates granular unit testing.
