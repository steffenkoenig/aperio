# Form Auto-Save & Drafts

## Goal
Prevent accidental data loss by automatically saving in-progress form inputs for POST, PUT, and PATCH requests to local storage, allowing users to resume where they left off if they navigate away or refresh the page.

## Problem
Currently, if a user spends time filling out a complex auto-generated form (e.g., a massive JSON payload with multiple nested objects and arrays) and accidentally closes the tab, navigates to a different resource, or refreshes the page, all entered data is lost. This results in frustration and wasted time, especially when constructing complex API requests.

## Proposed Changes
- Enhance the `ResourceForm` component to hook into the `onChange` event provided by `@rjsf/core`.
- Debounce form updates and serialize the current `formData` state to `localStorage` or `IndexedDB`, keyed by the specific endpoint path and HTTP method (e.g., `draft_POST_/pets`).
- Upon loading the `ResourceForm` for a given endpoint, check local storage for an existing draft. If found, prompt the user with a subtle banner to "Restore Draft" or automatically populate the form if configured to do so.
- Clear the saved draft automatically upon a successful API submission.
- Provide a manual "Clear Form / Discard Draft" button next to the submit button.

## Definition of Done
- Typing into any auto-generated POST/PUT/PATCH form automatically saves the state locally without noticeable performance degradation.
- Navigating away and returning to the same endpoint form successfully restores the previously entered data.
- Submitting the form successfully removes the draft from local storage.
- A "Discard Draft" button is available to easily clear the form and delete the local draft.
- The feature works correctly for all supported schema types, including nested structures.

## Technical & Compliance Considerations
- **Documentation:** Updates will be made across all three documentation architectures:
  - `/docs/customer`: Add instructions on how the auto-save feature works, how to restore drafts, and how to discard them.
  - `/docs/technical`: Detail the debouncing implementation, storage keys taxonomy, and lifecycle hooks used to manage draft persistence in the `ResourceForm` component.
  - `/docs/support`: Include information on browser storage limitations and how to clear drafts manually via browser settings if needed.
- **Testing:** Write component tests simulating form input, unmounting the component, remounting, and verifying that the initial state loads from the mocked local storage. Add tests to ensure successful submission clears the storage.
- **Security:** Ensure that highly sensitive fields (e.g., fields marked with `format: password` in the OpenAPI schema) are explicitly excluded from the auto-save mechanism to prevent storing plaintext passwords in local storage.
- **Reliability:** Implement try-catch blocks around storage APIs to handle cases where users have strict privacy settings or incognito mode that blocks `localStorage`. Limit the size of stored drafts to avoid quota exhaustion.
- **Accessibility:** Ensure the "Restore Draft" banner or notification uses `aria-live` to announce itself to screen readers upon form load.
- **GDPR Compliance:** Draft data is stored purely locally on the user's device and is not transmitted anywhere. To maintain compliance, the implementation will strictly avoid persisting authentication tokens in these form drafts.

## Future Press Release
**Never Lose Your Work Again: Auto-Save Arrives in Aperio**
We have all been there: you spend five minutes crafting the perfect JSON payload in a form, only to accidentally hit backspace and lose it all. Today, Aperio eliminates that frustration with the introduction of Form Auto-Save and Drafts. As you interact with any auto-generated POST, PUT, or PATCH form, your progress is seamlessly saved to your browser behind the scenes. If you navigate away, switch environments, or close the tab, you can pick right back up where you left off when you return to the endpoint. Designed with security in mind, sensitive fields like passwords are automatically excluded. Building and testing complex API requests in Aperio is now safer and more forgiving than ever.
