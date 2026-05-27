# Aperio Improvement Plans

This document outlines three key improvements to the Aperio platform to enhance user experience, productivity, and functionality. All proposed improvements are internal to the platform, requiring no external integrations or AI features.

---

## 1. Local Mock Mode

### Goal
Provide users with the ability to fully explore and test the generated admin UI using mocked data, without needing a live backend or real database.

### Problem
Currently, to see data in the tables or test forms, users must connect to a live backend environment that matches the OpenAPI spec. In many cases (e.g., during early development or evaluation), a live backend is not available, making the admin dashboard look empty and less interactive.

### Proposed Changes
- Integrate a local mock engine (e.g., MSW or an internal generator based on JSON schema) into the browser environment.
- Add a new "Mock Mode" toggle next to the Environment Switcher in the top navigation.
- Intercept outgoing API requests made by the dashboard and generate realistic, schema-compliant mock responses.
- Persist mocked changes (e.g., POST/PUT requests) temporarily in local storage during the active session to simulate a stateful backend.

### Definition of Done
- Mock Mode toggle is present and functional in the UI.
- GET requests automatically return mocked data structures matching the OpenAPI schema definitions.
- Write operations (POST/PUT/PATCH/DELETE) update local state, reflecting correctly in subsequent GET requests during the same session.
- Mocking state automatically resets upon page refresh or toggling the mode off.
- The feature works entirely client-side with no external dependencies.

### Technical & Compliance Considerations
- **Documentation:** Update the `README.md` to explain how to use Mock Mode for rapid prototyping.
- **Testing:** Add unit tests for the local mock generator ensuring complex schema types (nested objects, arrays, enums) are handled correctly. Add end-to-end tests to verify the UI displays the mocked data properly.
- **Security:** Ensure mock mode does not accidentally expose any sensitive data from other environments. The state should be isolated to the browser's local memory/storage.
- **Reliability:** Implement fallback mechanisms if schema definitions are incomplete, ensuring the app does not crash but instead displays default empty values.
- **Accessibility:** Ensure the "Mock Mode" toggle has proper ARIA labels and is keyboard navigable.
- **GDPR Compliance:** As all mocked data is generated locally in the browser and not transmitted anywhere, it inherently complies with GDPR. No personal data is collected or processed.

### Future Press Release
**Aperio Introduces Local Mock Mode for Instant Prototyping**
Today, we are thrilled to announce Local Mock Mode for Aperio, allowing you to instantly visualize and interact with your admin dashboard without writing a single line of backend code. We understand that waiting for backend APIs to be ready can slow down frontend evaluation. With Local Mock Mode, simply load your OpenAPI spec, toggle the feature on, and immediately see your dashboard populated with realistic, schema-driven data. You can even perform create, update, and delete actions that temporarily reflect in the UI, offering a complete end-to-end feel. This new feature runs entirely in your browser, ensuring absolute data privacy and security. Experience the future of instant admin interfaces with Aperio today.

---

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
- History is capped at the last 100 requests to prevent local storage bloat.

### Technical & Compliance Considerations
- **Documentation:** Document the Request History feature and its limitations (e.g., maximum stored requests) in the user guide.
- **Testing:** Write component tests for the history panel UI and unit tests for the local storage persistence logic. Verify that sensitive headers (like Authorization) are handled securely.
- **Security:** Do not log or persist sensitive authentication tokens (e.g., Bearer tokens, Basic Auth passwords) in the request history view or local storage. Mask these fields to prevent unauthorized access if a user shares their screen.
- **Reliability:** Implement efficient logging that does not block the main UI thread during heavy API activity.
- **Accessibility:** Use screen-reader-friendly text for request statuses and ensure the slide-out panel manages focus correctly.
- **GDPR Compliance:** The request history is stored strictly in local storage on the user's device. No data is sent to external tracking servers.

### Future Press Release
**Never Lose Track of an API Call with Aperio's Request History**
We are excited to launch the new Request History and Replay feature for Aperio. Debugging complex API interactions directly from an admin dashboard can be frustrating when you can't see the exact data being exchanged. Our new Request History panel seamlessly logs every operation you perform, providing a clear, chronological view of requests and responses right inside the Aperio interface. Not only can you inspect the exact payloads that were sent, but you can also replay any request with a single click—saving you the hassle of re-entering form data. Designed with security in mind, authentication tokens are automatically masked, ensuring your credentials remain private. Debugging your API workflows has never been easier.

---

## 3. Local Data Export

### Goal
Enable users to export data directly from the auto-generated resource tables into standard formats like CSV or JSON for local reporting and analysis.

### Problem
Aperio provides excellent data visualization through its dynamic tables, but users often need to extract this data to share with stakeholders or analyze in external tools like Excel. Currently, there is no built-in way to export table data, forcing users to manually copy and paste or write separate scripts.

### Proposed Changes
- Enhance the existing `resource-table.tsx` component with an "Export" dropdown menu.
- Implement client-side logic to convert the currently loaded table data (respecting active filters and sorting) into CSV and JSON formats.
- Trigger an automatic local file download when an export format is selected.

### Definition of Done
- An Export button appears above all auto-generated resource tables.
- Users can choose between "Export as CSV" and "Export as JSON".
- The downloaded file accurately reflects the data currently visible in the table, preserving column order and applied filters.
- Complex nested objects in cells are serialized correctly (e.g., as JSON strings within CSV columns).

### Technical & Compliance Considerations
- **Documentation:** Add a section to the documentation detailing how to export data and explaining how nested JSON objects are handled in CSV exports.
- **Testing:** Create tests for the data transformation functions ensuring special characters, commas, and nested arrays/objects do not break the CSV formatting.
- **Security:** Export functionality must rely entirely on browser APIs (like `Blob` and `URL.createObjectURL`) without sending data to an external conversion server.
- **Reliability:** Handle large datasets gracefully by ensuring the conversion runs efficiently and doesn't freeze the browser. Limit the export to the currently fetched pagination scope.
- **Accessibility:** Ensure the Export dropdown is accessible via keyboard navigation and clearly announces the download action to screen readers.
- **GDPR Compliance:** Since the conversion and download happen entirely on the client side, no data is transmitted to third parties, perfectly aligning with GDPR requirements for data minimization and privacy.

### Future Press Release
**Unlock Your Data with Aperio's New Export Feature**
Aperio just made your admin data more accessible than ever with our new Local Data Export functionality. We understand that while a beautiful dashboard is essential, sometimes you need your data in a spreadsheet for deeper analysis or offline sharing. With a single click, you can now export any resource table directly to CSV or JSON formats. The export respects your active filters and sorting, meaning you get exactly the data you see on screen. Best of all, the entire process happens securely within your browser, ensuring your sensitive business data never leaves your machine. Say goodbye to manual copy-pasting and hello to seamless data mobility with Aperio.
