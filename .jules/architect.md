## Refactor Target: src/components/resource-form/hooks

****Identified Structural Flaw:****
The hooks directory (`src/components/resource-form/hooks`) contained several redundant or bloated hook files that violated the max-lines-per-function limit. `useResourceForm.ts` specifically was a massive 170-line function containing form state initialization, local storage parsing, fetch request building, network call handling, toast notifications, and clipboard fetch copy logic. The `use-draft`, `use-form-draft`, `use-form-submit`, `use-resource-draft`, and `use-resource-submit` files were partially duplicating this functionality.

****Impact on Maintainability:****
The massive monolithic nature of `useResourceForm` meant any form bug fix (e.g. proxy network headers vs localStorage quotas) required developers to trace through a massive block of React effect closures. Additionally, tests couldn't isolate the "submit builder" logic from the "draft loading" logic. The multiple overlapping draft/submit files caused confusion about which one was the authoritative source of truth.

****The Clean Architecture Blueprint:****
- Standardize on three files: `use-draft.ts`, `use-form-submit.ts`, and the orchestrator `useResourceForm.ts`. Delete the unused redundant files (`use-form-draft.ts`, `use-resource-draft.ts`, `use-resource-submit.ts`).
- `use-draft.ts`: Focus entirely on local storage synchronization.
- `use-form-submit.ts`: Focus purely on the network layer proxy request generation and copy-as-fetch logic. Decompose headers and fetch code builders into pure functions `getHeaders` and `createFetchCode`. Extract error response handling into `handleResponse`.
- `useResourceForm.ts`: Acts simply as an orchestrator tying the two specialized hooks together.

****Verification & Refactor Logic:****
- Ran `npx eslint src/components/resource-form/hooks --rule 'max-lines-per-function: ["error", 50]'`. Verified all files passed.
- Run `npm run test` to verify complete functional parity and test suite success.
