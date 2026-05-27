# Aperio Improvements Plan

This document outlines the planned improvements for the Aperio application along with detailed implementation steps.

## 1. Integrate `@rjsf/core` in `ResourceForm`

**Description:**
Currently, `ResourceForm` uses a custom, naive schema renderer. We will integrate `@rjsf/core` (React JSON Schema Form), which is already included in `package.json`, to handle complex schemas, validations, and UI better.

**Implementation Plan:**
1. **Import RJSF Components:** In `src/components/resource-form.tsx`, import `Form` from `@rjsf/core` and `validator` from `@rjsf/validator-ajv8`.
2. **Transform Schema:** Ensure `rawSchema` (retrieved from `getSchema`) is valid JSON Schema compatible with RJSF. If it's an OpenAPI 3.x schema, apply necessary transformations if needed (though RJSF usually handles standard JSON schema well).
3. **Replace Custom Renderer:** Remove the existing `renderField` function and the manual mapping of `properties`.
4. **Implement RJSF Form:** Render the `<Form schema={schema} validator={validator} onSubmit={handleSubmit} formData={formData} onChange={...} />`.
5. **Styling & UI:** Customize RJSF's UI schema (`uiSchema`) or use a theme (like a custom set of Tailwind/Radix widgets) so that the form matches the existing application's look and feel.
6. **Handle Missing Params:** Integrate the existing missing path parameter checks with the new form logic. Disable the submit button if required parameters are missing.
7. **Test:** Verify form generation for various endpoints (POST, PUT, PATCH) in the example Petstore spec.

## 2. Schema-Driven Table Columns in `ResourceTable`

**Description:**
`ResourceTable` currently infers columns from the first row of runtime data. This is brittle. Instead, we should use the OpenAPI response schema to accurately define column headers, types, and descriptions.

**Implementation Plan:**
1. **Extract Response Schema:** In `src/components/resource-table.tsx`, extract the schema for a successful (2xx) response from the `operation.responses` object.
2. **Resolve Array Item Schema:** Since table endpoints typically return arrays, resolve the items' schema (e.g., `schema.items.properties`) to determine the expected fields for a single record.
3. **Generate Columns from Schema:** Map the properties of the item schema to TanStack Table column definitions. Use property names for headers and schemas to determine how to format the data (e.g., dates, booleans).
4. **Fallback to Data Inference:** Keep the current data-based inference (`inferColumns`) as a fallback if the schema cannot be determined or is an opaque object without defined properties.
5. **Enhance Headers:** Use `schema.title` or `schema.description` to show richer headers (e.g., tooltips for column descriptions).
6. **Test:** Verify that tables for GET collection endpoints show all schema-defined columns, even if the first data row has missing fields.

## 3. Implement Tests (Jest & React Testing Library)

**Description:**
Memory mentions that tests are implemented using Jest and React Testing Library, but the current codebase lacks this setup. We need to bootstrap testing.

**Implementation Plan:**
1. **Install Dependencies:** Run `npm install -D jest jest-environment-jsdom @testing-library/react @testing-library/dom @testing-library/jest-dom ts-jest`.
2. **Configure Jest:** Create `jest.config.mjs` (or `jest.config.ts`) configured for Next.js (using `next/jest`).
3. **Setup File:** Create `jest.setup.ts` and import `@testing-library/jest-dom`.
4. **Add Scripts:** Add `"test": "jest"` and `"test:watch": "jest --watch"` to `package.json`.
5. **Write Initial Tests:**
   - Unit test `src/lib/openapi-parser.ts` to ensure it parses specs correctly.
   - Component test for `SpecLoader` to verify the UI.
   - Component test for `ResourceTable` to verify schema-driven column generation.
6. **Run Tests:** Execute `npm run test` and verify that the tests pass.

## 4. Support for Table Pagination

**Description:**
For endpoints returning large datasets, fetching all items at once is inefficient. We should support pagination based on OpenAPI query parameters (e.g., `page`, `limit`, `offset`, `cursor`).

**Implementation Plan:**
1. **Identify Pagination Parameters:** Inspect `operation.parameters` in `ResourceTable` to find common pagination query parameters (e.g., `limit`, `offset`, `page`, `per_page`).
2. **Add Pagination State:** Introduce state variables in `ResourceTable` for the current page/offset and the page size.
3. **Update Data Fetching:** Modify `fetchData` to append these query parameters to the URL when making the proxy request.
4. **UI Controls:** Add pagination controls (Next/Previous, Page Numbers, Rows per page) below the table using `@tanstack/react-table` pagination APIs and standard UI components (`Button`, `Select`).
5. **Handle Server vs. Client Pagination:** If the API supports server-side pagination, use the state to fetch data. If not, fallback to TanStack Table's built-in client-side pagination.
6. **Test:** Use an endpoint that supports pagination (like GitHub API examples) to ensure the table correctly handles multiple pages of data.
