## Refactor Target: src/components/resource-form.tsx
****Identified Structural Flaw:**** `resource-form.tsx` is 545 lines long. It is a monolithic component containing both the `FormField` component (which has recursive logic for nested objects and arrays) and the `ResourceForm` component (which handles data, API calls, environment extraction, drafts, etc).
****Impact on Maintainability:**** This structural bloat causes high cognitive load when trying to understand form data bindings versus network boundaries. It prevents easy unit testing of field rendering primitives without mocking out `localStorage` and `fetch` calls. It breaks standard structural boundaries of React components.
****The Clean Architecture Blueprint:**** We will decompose the file by:
1. Extracting the `FormField` component into `src/components/resource-form/fields/form-field.tsx`.
2. Extracting type and schema retrieval utilities into `src/components/resource-form/hooks/use-schema.ts` (or simply `src/components/resource-form/utils.ts`).
3. Renaming `src/components/resource-form.tsx` to `src/components/resource-form/index.tsx` (the main wrapper).
****Verification & Refactor Logic:****
1. Create directory `src/components/resource-form/fields`.
2. Move `FormField` to `src/components/resource-form/fields/form-field.tsx`.
3. Create `src/components/resource-form/index.tsx` with `ResourceForm`.
4. Delete `src/components/resource-form.tsx`.
5. Update imports across the codebase (`src/app/dashboard/resource/[slug]/page.tsx`, etc) if needed, or re-export `ResourceForm` from `src/components/resource-form.tsx` to not break external paths. A better approach is to keep `src/components/resource-form/index.tsx` and just export from `src/components/resource-form/index.tsx`, deleting `src/components/resource-form.tsx`. Wait, let's keep the standard structure where complex components are inside a directory with `index.tsx`.
