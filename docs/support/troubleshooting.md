# Troubleshooting Guide

## Next.js Runtime: "Could not find a definition for #/components/schemas/X"
**Symptom:** Opening a specific OpenAPI resource in the Dashboard results in a complete React suspense failure, rendering a raw error stack trace indicating RJSF could not resolve a `$ref`.

**Root Cause:** The `schema-resolver.ts` may not be traversing a specific nesting pattern correctly before passing the schema down to `@rjsf/core`. Before version 0.1.1, this occurred specifically when `$ref` tags were embedded inside array `items` nodes.

**Resolution / Triage Playbook:**
1. Check the source OpenAPI JSON/YAML definition for the failing endpoint.
2. Trace exactly which nested attribute is failing to resolve (e.g. `items`? `additionalProperties`?).
3. Add a Jest assertion in `src/lib/schema-resolver.test.ts` for that specific JSON schema structure.
4. Update `resolveSchema` to defensively parse and traverse that property, recursively applying the root `components` record.

## Linting Issue Triage
**Symptom:** Warnings regarding unused `e` bindings inside catch blocks or `any` typing assignments.
**Resolution:** Ensure that when exceptions are ignored (e.g. inside a localStorage try-catch), the catch clause should use the `catch {}` syntax. Or replace `any` types with `Record<string, unknown>` or specific explicit types.
