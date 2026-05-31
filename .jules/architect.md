## Refactor Target: src/components/resource-form.tsx
****Identified Structural Flaw:**** The `resource-form.tsx` file is a monolithic, 545-line React component. It heavily couples API submission logic, local storage drafting, recursive schema parsing, and complex UI field rendering into a single multi-responsibility file.
****Impact on Maintainability:**** This structural bloat causes severe cognitive friction and makes unit testing difficult. Developers must parse through hundreds of lines of field recursion just to find the fetch execution or auto-save logic. It violates the single-responsibility principle and the standard architectural practice of decomposing complex React components.
****The Clean Architecture Blueprint:**** A modular directory structure matching standard practices (`src/components/resource-form/`). The entry point will be `index.tsx`. The API submission and local storage draft logic will be extracted into custom, testable hooks in a `hooks/` subdirectory. The recursive form field rendering will be extracted into a `fields/` subdirectory.
****Verification & Refactor Logic:****
1. Create `src/components/resource-form/hooks/use-form-draft.ts` to encapsulate localStorage debouncing and hydration.
2. Create `src/components/resource-form/hooks/use-form-submit.ts` to encapsulate the API proxy fetch and response state.
3. Create `src/components/resource-form/fields/form-field.tsx` to handle the recursive schema rendering.
4. Create `src/components/resource-form/index.tsx` to wire the custom hooks and fields together, replacing the old file.
5. Fix linting errors (e.g. unused `e` variables and `any` types).
6. Update imports in `src/app/dashboard/resource/[slug]/page.tsx` and `src/components/resource-form-autosave.test.tsx`.
7. Run `npm run lint` and `npm run test` to verify structural soundness and behavior preservation.
