# Bulk Operations in Resource Tables

## Goal
Enhance user productivity by enabling users to select multiple records within a `ResourceTable` and perform bulk actions (such as batch delete or batch update) concurrently, directly from the Aperio dashboard.

## Problem
Currently, Aperio requires users to execute actions (like deleting a record or updating a status) on a strictly individual basis. If a user needs to clean up 50 test records or update a flag across multiple items, they must manually click, submit, and wait for each individual row. This process is tedious and inefficient for bulk administrative tasks.

## Proposed Changes
- Enhance the TanStack React Table implementation in `ResourceTable` to include row selection checkboxes.
- Add a "Bulk Actions" toolbar above the table that appears only when one or more rows are selected.
- Parse the OpenAPI spec for available bulk endpoints (e.g., endpoints accepting an array of IDs). If native bulk endpoints do not exist, fall back to executing individual requests concurrently (with sensible rate limiting) via the API proxy.
- Provide a summary confirmation modal showing the number of selected items and the intended action before execution.
- Implement a progress indicator showing success/failure status for each item during execution, ensuring the user is informed of partial failures.

## Definitions of Done
- A checkbox column is added to the left side of the `ResourceTable`.
- Users can select individual rows, or use a "select all on page" header checkbox.
- A context-aware "Bulk Actions" toolbar appears when items are selected.
- Users can execute delete or update operations on the selected items.
- A confirmation dialog is displayed prior to execution.
- A progress/results modal displays the outcome of the batch operation, distinguishing between successful and failed requests.

## Technical & Compliance Considerations
- **Documentation:** Add a new section to the user documentation (`docs/customer`) detailing how to select rows and perform bulk actions. Update technical documentation (`docs/technical`) to describe the concurrency and rate-limiting approach.
- **Testing:** Write component tests to verify row selection state is maintained across pagination. Add unit tests for the concurrency execution logic to ensure it handles mixed success/failure responses correctly.
- **Security:** Ensure that the API proxy properly handles concurrent requests without leaking authentication context between requests.
- **Reliability:** Implement concurrency limits (e.g., max 5 parallel requests) to prevent overwhelming the target API or triggering browser connection limits. Handle partial failures gracefully, providing the user with specific error messages for failed items while allowing successful ones to complete.
- **Accessibility:** Ensure the table checkboxes have appropriate ARIA labels linking them to their respective rows. The Bulk Actions toolbar must be focusable and operable via keyboard navigation.
- **GDPR Compliance:** Bulk actions (like deletions) are executed against the user's connected API. Aperio itself does not store or process the underlying data, maintaining strict pass-through compliance.

## Future Press Release
**Turbocharge Your Workflow with Aperio Bulk Operations**
Managing large datasets through an API shouldn't require writing custom scripts. Today, Aperio introduces Bulk Operations, allowing you to manage multiple records simultaneously directly from your auto-generated dashboard. Whether you need to purge dozens of outdated test records or update statuses across a batch of items, you can now select multiple rows in any resource table and execute actions concurrently. Aperio intelligently utilizes your API's capabilities to process these requests, providing real-time progress updates and detailed success summaries. Say goodbye to tedious, repetitive clicks and experience unparalleled administrative efficiency with Aperio Bulk Operations.
