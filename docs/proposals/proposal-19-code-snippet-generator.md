# Proposal 19: Code Snippet Generator

## Goal
Enable users to automatically generate and copy code snippets (such as cURL, JavaScript/Fetch, Python/Requests) for any configured API request directly from the Aperio dashboard, accelerating their own development and integration efforts.

## Problem Description
Aperio provides a great interface for configuring complex API requests, setting parameters, and constructing large JSON payloads. However, when a user wants to replicate this exact request in their own codebase or terminal, they must manually translate the configured form data, headers, and query parameters into code. This manual process is time-consuming and highly prone to syntax errors or missing headers.

## Proposed Changes
- **Snippet Button:** Add a "Generate Code" button next to the "Submit" action in both the `ResourceForm` (for POST/PUT/PATCH requests) and the `ResourceTable` view (for GET requests with active filters).
- **Snippet Modal/Drawer:** Clicking the button opens a modal or drawer displaying the generated code.
- **Multi-Language Support:** Include a dropdown to select the target language/library (e.g., cURL, Node.js Fetch, Python Requests, Go HTTP).
- **Generation Logic:** Utilize a client-side library (like `httpsnippet` or a custom lightweight equivalent) to parse the current state (URL, query parameters, method, headers from the workspace, and form payload) and convert it into the requested language syntax.
- **Copy to Clipboard:** Provide a one-click "Copy" button to easily copy the generated snippet.

## Definition of Done
- A "Generate Code" button is accessible for all configured API requests.
- A modal successfully displays code snippets for at least three major formats (e.g., cURL, Fetch, Python).
- Snippets accurately reflect the current form state, including dynamically added query parameters, body payloads, and active workspace headers.
- Users can copy the snippet to their clipboard with a single click.
- The feature is fully tested with unit and component tests.
- All three documentation architectures are updated.

## Considerations
- **Documentation Updates:**
  - `/docs/customer`: Add a guide explaining how to generate and use code snippets to accelerate integration.
  - `/docs/technical`: Detail the snippet generation logic, the mapping of Zustand state to the code generator, and any new dependencies introduced.
  - `/docs/support`: Include troubleshooting tips if snippets do not execute correctly in specific environments.
- **Testing:** Unit tests must verify that the snippet generation logic accurately translates various combinations of HTTP methods, headers, and nested JSON payloads into correct syntax. Component tests will simulate the UI interactions for opening the modal and copying to the clipboard.
- **Security:** Ensure that generated snippets correctly handle and escape special characters to prevent injection attacks if executed blindly by the user. Clearly warn users if the snippet contains sensitive headers (like Bearer tokens).
- **Reliability:** Handle edge cases gracefully, such as extremely large payloads that might slow down the syntax highlighting component. Implement debouncing or lazy loading for the code highlighting if necessary.
- **Accessibility:** Ensure the modal is fully keyboard navigable, focus is trapped correctly, and the "Copy" action is announced by screen readers via ARIA live regions.
- **GDPR Compliance:** Snippet generation runs entirely client-side. No data, form payloads, or generated code is ever sent to or processed by external servers. The feature is completely private and compliant.

## Future Press Release
**Accelerate Your Integrations with Aperio's Code Snippet Generator**
We know that testing an API in a dashboard is only half the battle; the real work begins when you need to write the code. Today, we are bridging that gap with the introduction of the Code Snippet Generator in Aperio. After configuring the perfect request with complex JSON payloads and specific query parameters in our UI, you no longer need to translate it manually. With a single click, Aperio instantly generates production-ready code in cURL, JavaScript, Python, and more. Copy the exact request directly into your terminal or IDE and keep your momentum going. Building and integrating with complex APIs has never been faster or more accurate.
