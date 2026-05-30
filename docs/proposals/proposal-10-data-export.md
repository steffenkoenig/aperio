# Data Export from Resource Tables

## Goal
Enable users to export data displayed in the `ResourceTable` directly into standard formats like CSV or JSON for offline analysis, reporting, or record-keeping.

## Problem
Currently, Aperio allows users to view data natively retrieved from an API, but does not provide a built-in mechanism to extract that data. Users who need to generate reports, share data with stakeholders, or analyze it in external tools like Excel must manually copy-paste the data or write custom scripts. This creates friction and limits the administrative capabilities of the dashboard.

## Proposed Changes
- Add an "Export" dropdown button in the top right corner of the `ResourceTable` component.
- Provide options to "Export as CSV" and "Export as JSON".
- Implement client-side logic to convert the currently loaded table data (or the selected rows, if combined with Bulk Operations) into the chosen format.
- Automatically trigger a browser download with a dynamically generated filename based on the resource name and current timestamp.
- For datasets that span multiple pages, provide an option to "Export Current Page" versus "Fetch and Export All" (if the API supports retrieving the full collection without pagination).

## Definitions of Done
- An "Export" button is visible and functional on all resource tables.
- Users can successfully download the table data as a valid CSV file, with headers corresponding to the table columns.
- Users can successfully download the table data as a valid JSON file.
- The exported file is named intuitively (e.g., `users_export_2023-10-27.csv`).
- Data formatting matches the user interface (e.g., nested objects are properly stringified or flattened).

## Technical & Compliance Considerations
- **Documentation:** Update the `docs/customer` manual to include a guide on how to export data and what formats are supported. Update `docs/technical` to document the client-side conversion logic and any limitations regarding large datasets. Add troubleshooting steps for export failures in `docs/support`.
- **Testing:** Write unit tests for the JSON-to-CSV conversion utility. Add component tests verifying the export button is rendered and triggers the correct download function.
- **Security:** Ensure that the exported data accurately reflects the user's current permissions; the client-side export must not bypass any API access controls. Ensure no sensitive tokens or environment variables are inadvertently included in the export payloads.
- **Reliability:** Handle large datasets gracefully in the client browser to prevent out-of-memory errors. Implement web workers if the data transformation blocks the main UI thread.
- **Accessibility:** Ensure the export button and dropdown menu are fully navigable via keyboard and have appropriate ARIA roles and labels.
- **GDPR Compliance:** Aperio itself remains a pass-through entity. However, a disclaimer or warning could be optionally enabled for environments handling PII, reminding users of their obligations when downloading sensitive data to local devices.

## Future Press Release
**Unlock Your Data with Aperio's Seamless Export Feature**
We know your API data is invaluable, and sometimes you need it outside of the dashboard for deeper analysis or stakeholder reporting. Today, Aperio introduces one-click Data Exports, empowering you to instantly download any resource table into standard CSV or JSON formats. No more tedious copy-pasting or writing custom scripts to extract your information. Whether you need a quick snapshot of the current page or a full dataset download, Aperio handles the formatting and delivery effortlessly directly from your browser. Experience true data portability and supercharge your administrative workflows with Aperio.
