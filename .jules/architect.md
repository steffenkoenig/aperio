## Refactor Target: src/components/resource-form.tsx
****Identified Structural Flaw:**** The `ResourceForm` component is a monolithic file (545 lines) containing complex draft management logic, HTTP request building, response handling, and nested recursive form field rendering (`FormField`).
****Impact on Maintainability:**** This structural overhead causes cognitive friction when tracing form state versus API interaction, blocks isolated testing of individual form field components, and violates single-responsibility principles, slowing down developer onboarding.
****The Clean Architecture Blueprint:**** Decompose into a module directory `src/components/resource-form/`. Extract the state and draft management into custom hooks (`hooks/use-draft.ts` or `hooks/use-resource-submit.ts`). Move `FormField` to `fields/form-field.tsx`. Create an `index.tsx` as the entry point that composes these smaller, self-documenting pieces.
****Verification & Refactor Logic:****
1. Create `src/components/resource-form/` directory and subdirectories.
2. Extract `FormField` into `src/components/resource-form/fields/form-field.tsx`.
3. Extract helper functions like `getSchema` to `src/components/resource-form/utils.ts`.
4. Replace `src/components/resource-form.tsx` with `src/components/resource-form/index.tsx` and refactor logic to be more modular.
5. Fix linting errors (`any` types and unused variables) and run `make test` or `npm run test` to verify no regressions.
