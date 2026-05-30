## Refactor Target: src/components/resource-form.tsx
****Identified Structural Flaw:**** The `resource-form.tsx` file is a monolithic 545-line component. The `FormField` function handles the complex recursive rendering of object fields, array fields, and simple fields all within one massive block. This violates the single-responsibility principle and makes it extremely difficult to read, maintain, and unit test individual input types.
****Impact on Maintainability:**** This structural overhead causes cognitive friction for developers navigating the massive file, blocks modular testing of individual field behaviors (e.g., array item removal vs. object key deletion), and makes any future feature addition (like integrating RJSF) highly risky and conflict-prone.
****The Clean Architecture Blueprint:**** We will decompose this monolith by moving it into a dedicated `src/components/resource-form/` directory. The layout will include `index.tsx`, `resource-form.tsx`, `form-field.tsx`, `object-field.tsx`, `array-field.tsx`, `simple-field.tsx`, and `utils.ts`. This highly cohesive, loosely coupled layout enables targeted unit testing.
****Verification & Refactor Logic:****
1. Create `src/components/resource-form/` directory.
2. Extract common types and schema utilities to `utils.ts`.
3. Extract simple input logic to `simple-field.tsx`.
4. Extract array rendering logic to `array-field.tsx`.
5. Extract object rendering logic to `object-field.tsx`.
6. Refactor `form-field.tsx` to delegate to these sub-components based on `schema.type`.
7. Move `resource-form.tsx` logic and use the decomposed `FormField`.
8. Write comprehensive unit tests for each field module using Jest.
9. Update `src/app/dashboard/resource/[slug]/page.tsx` imports.
10. Synchronize documentation in `/docs/customer`, `/docs/technical`, and `/docs/support` reflecting the new structural paths.
