## Refactor Target: src/lib/ssrf.ts, src/lib/path-intelligence.ts, src/lib/schema-resolver.ts

****Identified Structural Flaw:****
- `src/lib/ssrf.ts`: `isSafeUrl` is heavily bloated, containing a massive nested helper function (`isPrivateIp`) which internally manages deep conditionals for both IPv4 parsing and IPv6 string manipulation. This mixes hostname DNS resolution logic with low-level packet header validation.
- `src/lib/path-intelligence.ts`: `buildResourceTree` attempts to do three distinct structural passes in a single monolithic block: parsing OpenAPI paths into nodes, resolving parent/child hierarchies, and executing custom sorting logic via an internal nested closure.
- `src/lib/schema-resolver.ts`: `resolveSchema` traverses `$ref`, `allOf`, `anyOf`, `oneOf`, `properties`, and `items` in a single large execution flow, combining structural merging with recursive tree traversal, causing function bloat and cognitive friction.

****Impact on Maintainability:****
These structural flaws create significant cognitive overhead. Developers must trace through massive functions containing mixed responsibilities. Nested closures block individual subroutines from being isolated or explicitly mocked in unit tests. It violates the core architectural limit of 50-line maximums per function and prevents clean, testable subroutines.

****The Clean Architecture Blueprint:****
- `src/lib/ssrf.ts`: Decompose `isPrivateIp` into explicit top-level functions `isPrivateIPv4` and `isPrivateIPv6`. Retain `isPrivateIp` as a simple routing layer, leaving `isSafeUrl` strictly focused on the core SSRF DNS checks.
- `src/lib/path-intelligence.ts`: Decompose `buildResourceTree` into three strict, testable pipelines: `createResourceNodes`, `buildTreeStructure`, and `sortResourceNodes`.
- `src/lib/schema-resolver.ts`: Extract distinct schema handlers (`resolveAllOf`, `resolveAnyOfOneOf`, `resolveProperties`, `resolveItems`) to isolate recursive logic from the primary `resolveSchema` orchestrator.

****Verification & Refactor Logic:****
- Extract monolithic logic blocks into explicit, descriptive, single-purpose functions.
- Run `npx eslint <file> --rule 'max-lines-per-function: ["error", 50]'` on all three targets to ensure strict limit compliance.
- Run `npm run test` to verify complete functional parity and test suite success.
