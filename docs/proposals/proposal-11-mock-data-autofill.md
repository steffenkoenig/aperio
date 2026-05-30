# Fill with Mock Data in Resource Forms

## Goal
Accelerate testing and data entry by adding a "Fill with Mock Data" feature to the `ResourceForm`, automatically populating fields with valid data generated from OpenAPI schema constraints.

## Problem
When testing API endpoints or quickly scaffolding data via Aperio, filling out large forms with many required fields is time-consuming and error-prone. Users often have to manually invent valid emails, dates, unique strings, and nested objects that comply with the underlying OpenAPI spec requirements. This slows down the development and testing cycle significantly.

## Proposed Changes
- Introduce a "Fill with Mock Data" button located next to the submit button on all generated `ResourceForm` instances.
- Implement a utility that reads the `rjsf` JSON schema derived from the OpenAPI spec.
- Utilize a library (e.g., `json-schema-faker` or a custom lightweight generator) to synthesize valid mock data based on field types, `format` attributes (e.g., email, uuid, date-time), `enum` values, and string length constraints.
- When clicked, update the form's `formData` state with the generated mock payload, allowing the user to review and modify it before submission.

## Definitions of Done
- A "Fill with Mock Data" button is visible and actionable within the `ResourceForm`.
- Clicking the button successfully populates all required fields with synthetic data.
- The generated data respects schema constraints (e.g., `maxLength`, `pattern`, `minimum`, `format`).
- The user can edit the populated data before clicking "Submit".
- The feature works correctly for deeply nested objects and arrays.

## Technical & Compliance Considerations
- **Documentation:** Create a section in `docs/customer` explaining the mock data feature and how it can speed up testing. Update `docs/technical` with details on the generation library used and any supported/unsupported OpenAPI schema features. Add FAQs in `docs/support` regarding what to do if the generated data fails server-side validation.
- **Testing:** Write unit tests for the data generation utility to ensure it produces valid outputs for various JSON schema constructs. Add component tests to verify the UI updates correctly when the mock data button is pressed.
- **Security:** Ensure the data generation logic runs entirely client-side and does not inadvertently leak or request information from external APIs.
- **Reliability:** Implement safeguards to prevent infinite loops when generating data for recursive schemas or exceptionally deep nested structures.
- **Accessibility:** The button must be keyboard-accessible, clearly labeled, and provide screen-reader announcements when the form fields are successfully populated.
- **GDPR Compliance:** The mock data generated must be entirely synthetic and random (e.g., using fake names, fake emails). It must not use real user data, ensuring no PII is accidentally submitted or stored during testing.

## Future Press Release
**Speed Up Testing with Aperio's Smart Mock Data Autofill**
Testing your API endpoints shouldn't require tedious manual data entry. Today, Aperio introduces the "Fill with Mock Data" feature, designed to instantly populate your resource forms with valid, schema-compliant data. With a single click, Aperio analyzes your OpenAPI specifications—including complex formats, minimums, and enumerations—and generates perfect synthetic payloads ready for submission. Spend less time inventing fake email addresses and UUIDs, and more time building and validating your systems. Effortless testing is now built directly into your Aperio dashboard.
