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
