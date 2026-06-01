# Proposal 20: Form Data Diff Viewer

## Goal
Provide users with a clear visual comparison (a "diff") between the current state of a resource (fetched via GET) and the proposed changes they have made in a form (for a PUT or PATCH request), before they actually submit the update.

## Problem Description
When editing an existing, complex resource (like a large configuration object with dozens of nested fields) via an auto-generated PUT or PATCH form, it is very easy for a user to lose track of exactly what fields they have changed. Submitting the form blindly can lead to unintended overwrites or accidental deletions, especially if multiple team members might be managing the same resource. There is currently no "Review Changes" step.

## Proposed Changes
- **Diff Button:** Introduce a "Review Changes" button adjacent to the submit button in the `ResourceForm` when editing an existing resource.
- **State Comparison:** When clicked, intercept the form state. Fetch the fresh, latest state of the resource directly from the API (to prevent stale-state comparison or race conditions if other users updated the resource concurrently) rather than relying solely on cached GET data or initial mounting state.
- **Diff Calculation:** Implement a client-side JSON diffing utility to compare the `originalData` against the `formData`.
- **Diff Modal/UI:** Display a modal showing a side-by-side or inline visual diff (similar to a Git diff) highlighting exactly which fields were added, modified, or removed.
- **Confirmation Step:** Require the user to confirm the changes from within the diff modal to finalize the submission.

## Definition of Done
- A "Review Changes" button is available when updating existing resources.
- The system accurately calculates the differences between the initial resource state and the current form input.
- A visual diff modal clearly highlights additions, deletions, and modifications in a user-friendly format.
- Users can submit the form directly from the diff review modal.
- The diff logic correctly handles deep nesting and arrays within JSON payloads.
- The feature is fully tested and documented.

## Considerations
- **Documentation Updates:**
  - `/docs/customer`: Add a section explaining how to use the Diff Viewer to review changes before saving to prevent accidental data loss.
  - `/docs/technical`: Document the JSON diffing algorithm used, how the original state is preserved, and the integration points with the `ResourceForm` component.
  - `/docs/support`: Explain how the diff viewer handles complex data types like arrays and potential limitations.
- **Testing:** Comprehensive unit tests for the JSON diffing logic are critical to ensure accurate reporting of changes, especially for deeply nested objects and array reorderings. Component tests will verify the rendering of the diff modal and the submission flow.
- **Security:** Ensure the diff viewer safely renders user input to prevent Cross-Site Scripting (XSS) if the data contains potentially malicious strings.
- **Reliability:** The diffing algorithm must be optimized to not block the main thread, even when comparing very large JSON payloads. Use Web Workers if necessary for massive objects. Ensure a fresh GET request is dispatched to fetch the latest server-side resource state immediately when the review action is triggered.
- **Accessibility:** Visual diffs relying solely on color (red for delete, green for add) must be supplemented with accessible text (e.g., `<del>` and `<ins>` tags, or visually hidden text like "Added:", "Removed:") to support screen reader users and users with color blindness.
- **GDPR Compliance:** The entire diff calculation and rendering process occurs locally in the user's browser. No data is transmitted to external servers for comparison, fully adhering to data privacy standards.

## Future Press Release
**Submit Updates with Confidence: Introducing the Form Data Diff Viewer**
Have you ever stared at a massive form, wondering exactly which of the 50 fields you just modified? Making updates to complex configurations can be nerve-wracking when you aren't 100% sure what's changed. Today, we're taking the guesswork out of API management with the new Form Data Diff Viewer in Aperio. Before you hit submit on any update, you can now click "Review Changes" to see a clear, Git-style visual comparison of your edits against the original data. Instantly spot unintended overwrites, verify your tweaks, and submit your changes with absolute confidence. Safe, accurate, and entirely client-side, the Diff Viewer is your new safety net for API administration.
