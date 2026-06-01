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
