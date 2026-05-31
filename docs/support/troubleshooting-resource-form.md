# Troubleshooting Form Rendering

If a customer reports an issue where their dynamic form fails to render correctly or an input cannot be changed, here is how to triage based on the decomposed form architecture:

## 1. Determine the schema type
Ask the customer to check the specific field inside their OpenAPI JSON payload.
- If the issue is with a string, boolean, enum, or integer, route the bug to the `SimpleField` component (`src/components/resource-form/simple-field.tsx`).
- If a group of properties won't collapse, route the bug to the `ObjectField` component.
- If items cannot be added or deleted, route the bug to the `ArrayField` component.

## 2. Check draft persistence
Drafts are saved locally per endpoint via `resource-form.tsx`. If a customer complains that previous form data is unexpectedly showing up (or failing to show up), guide them to clear their `localStorage` or click the "Discard Draft" button.

## 3. Verify component bindings
Ensure that the OpenAPI schema accurately defines the `type`. Missing type definitions default to `string` in `form-field.tsx`.
