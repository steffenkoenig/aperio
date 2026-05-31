# Proposal: API Request History & Replay

## Goal
Implement a local history feature that logs recent API requests made through Aperio, allowing users to view, inspect, and replay previous requests directly from the dashboard.

## Problem Description
Currently, when a user makes an API request using Aperio's generated forms or query panels, the request is executed, and the result is displayed transiently. If the user navigates away or wants to repeat a complex request with slight modifications, they must manually reconstruct the request from scratch. This leads to friction during API testing and exploration.

## Proposed Changes
- **State Management:** Extend the Zustand store (`src/store/spec-store.ts`) or create a new store to maintain a bounded list of recent API requests (e.g., the last 50 requests), saving them to local storage.
- **UI Component:** Add a "Request History" panel (accessible via a sidebar tab or a slide-out drawer) displaying a chronological list of past requests, including method, endpoint, status code, timestamp, and duration.
- **Replay Functionality:** Add a "Replay" action to each history item that populates the corresponding resource form or query panel with the historical parameters and body, allowing the user to modify and re-send the request.
- **Data Sanitization:** Ensure sensitive information (such as authorization headers or specific fields marked as sensitive) are properly masked or omitted from the persistent history log to avoid leaking credentials.

## Definition of Done
- A local storage-backed history state is implemented and correctly records outgoing API requests.
- The UI features a dedicated panel showing the list of historical requests.
- Users can click a past request to repopulate the form and execute the request again.
- Sensitive environment credentials (like Bearer tokens) are never persisted in the raw request history.
- The feature is fully tested (unit and component tests).
- All three documentation architectures (`/docs/customer`, `/docs/technical`, and `/docs/support`) are updated to reflect the new feature.

## Considerations
- **Documentation Updates:** The customer docs will be updated with a guide on how to use the history feature. Technical docs will detail the state changes and storage mechanics. Support docs will cover troubleshooting local storage limits or clearing history.
- **Testing:** Unit tests for the store logic and data sanitization. Component tests utilizing `jest` and React Testing Library for the history panel and replay interactions.
- **Security:** Critical to ensure that API keys, Basic Auth credentials, and Bearer tokens are not saved in plaintext within the request history. Only the request parameters, body, headers (minus auth), and response metadata should be saved.
- **Reliability:** Implement a strict limit on the number of saved requests (e.g., 50-100) to prevent `localStorage` quota exhaustion, ensuring the application remains reliable over long sessions.
- **Accessibility:** The new history panel and replay buttons must be fully navigable via keyboard, with appropriate ARIA labels for screen readers.
- **GDPR Compliance:** As the application runs locally and stores data in the user's browser, no data is sent to external servers. However, a "Clear History" button will be provided to allow users to easily delete all local request logs, ensuring they retain full control over their data.

## Future Press Release
**Aperio Introduces API Request History: Never Lose Your Work Again**
Today, Aperio is excited to announce the release of the API Request History & Replay feature, fundamentally enhancing how developers interact with their APIs. Building, testing, and debugging complex API requests often involves trial and error, and losing a meticulously crafted payload can be frustrating. With our new update, Aperio automatically logs your recent API calls locally in your browser. Users can now seamlessly browse their past requests, inspect the details, and replay them with a single click. This feature not only saves valuable time but also encourages deeper exploration of APIs by removing the fear of losing configuration. Best of all, your data remains completely private, stored securely on your own machine with strict safeguards against logging sensitive authentication credentials. Experience a more intuitive, powerful, and forgiving API dashboard with Aperio today.
