# Data Export

Aperio allows you to easily extract data from any resource table into standard formats for offline analysis, reporting, or record-keeping.

## How to Export Data

1. Navigate to any resource in the sidebar that displays a data table (typically a `GET` collection endpoint).
2. Ensure the data you want to export is currently loaded and visible. (Note: Data export applies to the currently loaded dataset).
3. Click the **Export** button located in the top right corner above the data table.
4. Select your preferred format:
   - **Export as CSV**: Best for opening in spreadsheet applications like Microsoft Excel or Google Sheets.
   - **Export as JSON**: Best for programmatic use or importing into other tools.
5. Your browser will automatically download the file. The file will be named according to the resource and the current date (e.g., `users_export_2023-10-27.csv`).

## Handling Complex Data

Some fields in your API may contain complex data like nested objects or lists (arrays).

- **In JSON Export**: These structures are preserved exactly as they are in the API response.
- **In CSV Export**: Since CSV is a flat format, nested structures are converted into JSON text strings within their respective column. This ensures no data is lost during the export process.

## Privacy & Security

All data export formatting and file generation happens entirely **within your local web browser**. Your data is never sent to external servers or third-party conversion services by Aperio.

*Reminder*: If you are working with sensitive or Personally Identifiable Information (PII), please ensure you are adhering to your organization's compliance guidelines (such as GDPR or CCPA) when storing exported files on your local device.