# Structural Code Refactoring - Resource Form

## Structural Code Relocations
- `src/components/resource-form.tsx` has been decomposed into `src/components/resource-form/`.
- Isolated form fields are now in `src/components/resource-form/fields/form-field.tsx`.
- Schema resolution hooks are contained in `src/components/resource-form/hooks/use-schema.ts`.
- The autosave testing logic is encapsulated within `src/components/resource-form/resource-form-autosave.test.tsx`.
