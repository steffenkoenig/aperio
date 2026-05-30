## Refactor Target: src/components/resource-form.tsx
****Identified Structural Flaw:**** The `ResourceForm` component is a 545-line monolithic file. It tightly couples complex recursive UI rendering logic (for nested objects and arrays) with form state management, local storage draft persistence, and API request handling (fetch/proxy payload construction).
****Impact on Maintainability:**** The tight coupling and excessive length cause high cognitive friction. Modifying a simple primitive input or adding a new field type requires navigating through hundreds of lines of complex recursive logic. It also blocks modular testing, as you cannot unit test the array field renderer or the draft persistence hook independently without mounting the entire form and its context.
****The Clean Architecture Blueprint:**** We will decompose the monolith into a clean, modular structure inside `src/components/resource-form/`. The logic will be split into:
1. `hooks/use-form-draft.ts` - Custom hook for managing local storage drafts.
2. `hooks/use-resource-submit.ts` - Custom hook for constructing API payloads and handling form submission.
3. `fields/form-field-object.tsx` - Handles rendering nested object schemas.
4. `fields/form-field-array.tsx` - Handles rendering array schemas.
5. `fields/form-field-simple.tsx` - Handles rendering primitive fields.
6. `form-field.tsx` - A router that delegates to the specific field component based on schema type.
7. `resource-form.tsx` - The main container component that composes the hooks and field renderer.
****Verification & Refactor Logic:****
1. Extract `use-form-draft.ts` and `use-resource-submit.ts` hooks into a `hooks` subdirectory.
2. Extract the field rendering components into a `fields` subdirectory, passing necessary props.
3. Re-assemble `ResourceForm` to use these isolated modules.
4. Run `npm run test` and `npx eslint` to verify the refactoring preserves all existing functionality and passes formatting.
