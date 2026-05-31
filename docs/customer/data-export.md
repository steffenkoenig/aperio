# Data Export

The Data Export feature enables you to download the data displayed in your Aperio Resource Tables directly to your computer.

## Supported Formats

Currently, you can export your data in two widely used formats:

*   **CSV (Comma-Separated Values):** Best for viewing in spreadsheet applications like Microsoft Excel, Google Sheets, or Apple Numbers.
*   **JSON (JavaScript Object Notation):** Best for programmatic use, automation scripts, or further processing in other software tools.

## How to Export Data

1.  Navigate to any resource in the sidebar that returns a collection of items (a `GET` endpoint displaying a `ResourceTable`).
2.  (Optional) Apply any desired **Global Filters** or **Sorting**. The export function respects the data currently visible and fetched on your screen.
3.  In the top-right corner of the table, locate the **Export** button with the download icon.
4.  Click the **Export** button to open the dropdown menu.
5.  Select either **Export as CSV** or **Export as JSON**.
6.  The browser will automatically generate the file and prompt you to save it. The file will be named dynamically based on the current timestamp (e.g., `export-1701234567890.csv`).

## Limitations

*   **Pagination:** The export only contains the data currently fetched by the table. If your API paginates results and you are only viewing the first page, only the first page will be exported.
*   **Nested Objects in CSV:** When exporting to CSV, complex nested objects or arrays within a single field are converted to JSON strings to maintain structural integrity within the flat CSV format.
