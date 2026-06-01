## Refactor Target: src/components/resource-table/index.tsx

****Identified Structural Flaw:****
The `ResourceTable` function within `src/components/resource-table/index.tsx` spans over 225 lines, grossly violating the 50-line maximum limit. It is highly monolithic, combining raw table structural definitions, nested UI view rendering, complex dialog management (saved views/favorites), and toolbar filtering logic all within one execution block.

****Impact on Maintainability:****
This level of bloat produces massive cognitive friction and creates a "god function" anti-pattern. Developers cannot test filtering, exporting, or view-saving mechanisms independently of the TanStack table render loop. The file layout violates clean-code single responsibility patterns and becomes excessively difficult to navigate during UI debugging.

****The Clean Architecture Blueprint:****
We will decompose `ResourceTable` by extracting independent, self-documenting sub-components:
- `ResourceTableToolbar`: Manages the global filter input, refresh commands, and CSV/JSON export dropdowns.
- `ResourceTableViewManager`: Encapsulates all saved-views logic, dropdown state, and view-saving dialogs.
By delegating UI responsibility, `ResourceTable` will purely act as a compositional layer managing the TanStack state and structural table rendering.

****Verification & Refactor Logic:****
- Extract filtering and refresh logic to `src/components/resource-table/components/toolbar.tsx`.
- Extract view-management logic to `src/components/resource-table/components/view-manager.tsx`.
- Update `src/components/resource-table/index.tsx` to compose these new modules.
- Run `npx eslint <file> --rule 'max-lines-per-function: ["error", 50]'` on the target to ensure strict compliance.
- Run `npm run test` to verify complete functional parity across UI components.
