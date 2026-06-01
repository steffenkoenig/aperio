## 2. Request History and Replay

### Goal
Provide users with an internal audit trail of API requests made through the dashboard, including the ability to inspect payloads and replay specific requests.

### Problem
When users execute operations (especially complex POST/PUT requests) through the auto-generated forms, there is currently no easy way to see exactly what payload was sent or what the precise response was, aside from checking the browser's developer tools. If an error occurs, debugging is difficult, and users cannot easily re-execute a previous request without manually filling out the form again.

### Proposed Changes
- Create a new "Request History" slide-out panel accessible from the main layout.
- Log all API requests (Method, URL, Headers, Body) and their corresponding responses (Status, Headers, Body) to local storage.
- Build a UI within the panel to browse historical requests, filter by status code or method, and view detailed JSON payloads.
- Add a "Replay" button next to each entry to instantly re-send the exact request.

### Definition of Done
- Request History panel is accessible via a dedicated button in the header.
- All requests made via the proxy or directly are captured and listed chronologically.
- Clicking an entry expands to show formatted request and response details.
- The Replay button successfully resends the request and adds a new entry to the history.
- History is capped at the last 100 requests (stored in IndexedDB, or local storage with a strict try-catch wrapper and size-based eviction) to avoid browser quota limits.

### Technical & Compliance Considerations
- **Documentation:** Document the Request History feature and its limitations (e.g., maximum stored requests) in the user guide.
- **Testing:** Write component tests for the history panel UI and unit tests for the persistence logic. Verify that sensitive headers (like Authorization) are handled securely.
- **Security:** Do not log or persist sensitive authentication tokens (e.g., Bearer tokens, Basic Auth passwords) in the request history view or local storage. Mask these fields to prevent unauthorized access if a user shares their screen.
- **Reliability:** Implement efficient logging that does not block the main UI thread during heavy API activity. Wrap localStorage writes in try-catch blocks to handle browser storage quota limits gracefully, and prefer IndexedDB for storing response bodies.
- **Accessibility:** Use screen-reader-friendly text for request statuses and ensure the slide-out panel manages focus correctly.
- **GDPR Compliance:** The request history is stored strictly on the user's device. No data is sent to external tracking servers.

### Future Press Release
**Never Lose Track of an API Call with Aperio's Request History**
We are excited to launch the new Request History and Replay feature for Aperio. Debugging complex API interactions directly from an admin dashboard can be frustrating when you can't see the exact data being exchanged. Our new Request History panel seamlessly logs every operation you perform, providing a clear, chronological view of requests and responses right inside the Aperio interface. Not only can you inspect the exact payloads that were sent, but you can also replay any request with a single click—saving you the hassle of re-entering form data. Designed with security in mind, authentication tokens are automatically masked, ensuring your credentials remain private. Debugging your API workflows has never been easier.

---
