# Support Diagnosis - Resource Form

When troubleshooting unexpected rendering failures related to nested schemas, array items, or sub-objects:
- Verify that `src/components/resource-form/fields/form-field.tsx` accurately maps standard JSON properties.
- Ensure the OpenAPI spec structure correctly resolves via `getSchema` inside `src/components/resource-form/hooks/use-schema.ts`.
