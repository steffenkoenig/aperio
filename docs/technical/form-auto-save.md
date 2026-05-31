# Form Auto-Save Architecture

The Form Auto-Save feature ensures that complex JSON request payloads are not lost during navigation or accidental refreshes.

## Storage Strategy

Draft data is serialized and stored entirely locally in the browser using the `localStorage` API. To prevent cross-contamination between different OpenAPI specifications or different endpoints within the same specification, a strictly namespaced key strategy is used.

**Key Format:**
`draft_[SPEC_TITLE]_[HTTP_METHOD]_[ENDPOINT_PATH]`

Example:
`draft_Stripe API_POST_/v1/customers`

## Implementation Details (`src/components/resource-form/index.tsx`)

- **Debouncing:** The component uses a `useEffect` hook coupled with a `setTimeout` to debounce `localStorage` writes. It waits 500ms after the last `formData` update before committing to storage, ensuring smooth UI performance even when typing rapidly.
- **Hydration:** Upon mounting, the component synchronously checks `localStorage` for the corresponding key. If found, it hydrates the `formData` state and displays a `sonner` toast notification to inform the user that a draft was restored.
- **Cleanup Lifecycle:**
  1. The user can manually clear the draft via the "Discard Draft" button.
  2. The draft is automatically purged from `localStorage` upon receiving a successful response from the `fetch` API call.
