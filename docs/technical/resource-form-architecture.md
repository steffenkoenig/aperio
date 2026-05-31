# Resource Form Architecture

In accordance with our "Architect" coding standards, the `ResourceForm` has been heavily decomposed from a monolithic file into modular, testable components.

## Directory Structure: `src/components/resource-form/`

- **`types.ts`:** Holds the core shared interfaces such as `ResourceFormProps` and `FormFieldProps`.
- **`resource-form.tsx`:** Manages state (drafting, fetching, request wrapping) and orchestrates the form layout.
- **`form-field.tsx`:** A router component that reads the `schema.type` to delegate rendering.
- **`object-field.tsx`:** Specialized for `type === 'object'`, handles nested keys and collapse states.
- **`array-field.tsx`:** Specialized for `type === 'array'`, manages index-based addition and splicing of array elements.
- **`simple-field.tsx`:** Handles primitive rendering for booleans, enums, numbers, strings, and fallbacks.

This structure allows localized unit testing (e.g. `object-field.test.tsx`) without needing to mock external API requests or parent layout trees.
