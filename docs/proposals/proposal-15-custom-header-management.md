# Proposal: Custom Header Management for Environments

## Goal
Extend Aperio's multi-environment configuration to support the definition and injection of arbitrary custom HTTP headers, allowing users to interact with APIs that require specific proprietary headers for routing, tracking, or legacy authentication.

## Problem Description
Currently, Aperio's environment configuration supports standard authentication methods (Bearer, Basic, API Key). However, many enterprise and custom APIs require additional headers that fall outside standard auth, such as `X-Tenant-ID`, `X-Client-Version`, `Accept-Language`, or custom correlation IDs. Without the ability to define these headers globally per environment, users are unable to test or interact with endpoints requiring them through the Aperio dashboard.

## Proposed Changes
- **State Update:** Update the `Environment` interface in the Zustand store to include an optional array of custom header objects, e.g., `customHeaders: { key: string; value: string; enabled: boolean }[]`.
- **UI Enhancement:** Extend the Environment Switcher configuration dialog to include a dynamic key-value table where users can add, edit, toggle (enable/disable), and delete custom headers for the selected environment.
- **Proxy Integration:** Modify the internal API proxy (`src/app/api/proxy/route.ts`) and the client-side fetch logic to read the active environment's enabled custom headers and inject them into the outgoing request to the target API.
- **Security Check:** Implement logic to prevent overriding critical, browser-controlled, or strictly forbidden headers (like `Host`, `Connection`, `Origin`, etc.) via the custom header UI to maintain proxy stability and security.

## Definition of Done
- The Zustand store is successfully updated to handle custom header state per environment.
- The UI allows users to easily add, edit, and toggle multiple custom headers.
- The internal API proxy seamlessly and securely passes configured custom headers to target endpoints.
- The proxy correctly filters out forbidden headers to prevent request smuggling or routing issues.
- The feature is fully tested with unit tests for the proxy validation logic and component tests for the new UI.
- All three documentation architectures (`/docs/customer`, `/docs/technical`, and `/docs/support`) are updated.

## Considerations
- **Documentation Updates:** Customer docs will explain how to set up custom headers like `X-Tenant-ID`. Technical docs will describe the state schema changes and the header injection logic in the proxy. Support docs will detail the list of restricted headers and how to troubleshoot header-related proxy errors.
- **Testing:** Unit tests must cover the proxy route specifically to ensure custom headers are injected correctly, and that blocked headers are stripped out. Component tests will verify the dynamic input fields in the environment settings UI.
- **Security:** The proxy route must carefully sanitize user-provided header keys and values to prevent HTTP Header Injection attacks. The SSRF protection logic must remain intact and unaffected by the custom headers.
- **Reliability:** By allowing users to toggle headers on and off, they can test different routing or tenant configurations without deleting data, increasing the reliability of their testing workflow.
- **Accessibility:** The dynamic list of key-value inputs must be fully accessible, allowing users to navigate between fields, add new rows, and delete rows using only the keyboard.
- **GDPR Compliance:** No user data is sent to Aperio servers. The custom headers are stored locally and only transmitted to the specific APIs the user interacts with through the proxy, ensuring compliance with privacy standards.

## Future Press Release
**Aperio Unlocks Enterprise APIs with Custom Header Support**
APIs come in all shapes and sizes, and often, standard authentication just isn't enough. Many teams work with complex systems that demand specific headers—like tenant IDs, client versions, or custom correlation tags—to route and process requests correctly. Today, Aperio bridges that gap by introducing Custom Header Management. Now, within your environment settings, you can define any number of custom HTTP headers that will be automatically injected into your API calls. You can easily toggle headers on and off to simulate different clients or access different tenants seamlessly. Our proxy handles the injection securely, ensuring your requests are compliant and safe. With this update, Aperio is ready to map even the most complex enterprise APIs straight to a usable admin dashboard.
