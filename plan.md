1. **Analyze the Problem**:
   The directory `src/components/resource-form/hooks` contains several duplicated and monolithic hook files:
   - `useResourceForm.ts`
   - `use-draft.ts`
   - `use-form-draft.ts`
   - `use-form-submit.ts`
   - `use-resource-draft.ts`
   - `use-resource-submit.ts`

   These files violate the 50-line limit for functions and create cognitive overhead by mixing local storage, fetch execution, headers, and React state.

2. **Refactor Plan**:
   - Standardize on `use-draft.ts`, `use-form-submit.ts`, and `useResourceForm.ts`.
   - Delete `use-form-draft.ts`, `use-resource-draft.ts`, and `use-resource-submit.ts`.
   - Decompose `useResourceForm` into an orchestrator that calls `useDraft` and `useFormSubmit`.
   - Update `useDraft` to handle only local storage synchronization.
   - Update `useFormSubmit` to handle fetch proxy requests and "copy as fetch" logic by creating simple `getHeaders` and `createFetchCode` functions.
   - Run eslint and tests to ensure no regressions.

3. **Pre-commit Instructions**:
   - Complete pre-commit steps to ensure proper testing, verification, review, and reflection are done.

4. **Submit**:
   - Create PR with description conforming to Architect guidelines.
