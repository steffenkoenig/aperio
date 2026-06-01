# Data Export Architecture

The Data Export functionality allows client-side extraction of tabular data into CSV or JSON formats. This is implemented directly within the `ResourceTable` component.

## Core Modules

*   `src/components/resource-table/index.tsx`: Contains the UI integration for the `Export` dropdown button. It leverages the TanStack Table instance's `getFilteredRowModel().rows` to ensure only the currently filtered/visible dataset is passed to the export utility.
*   `src/lib/export-utils.ts`: Contains pure functions for data transformation and client-side download invocation.

## Data Transformation Logic

### JSON Export
The `exportTableToJSON` function simply stringifies the array of object records using `JSON.stringify(data, null, 2)` and creates a Blob of type `application/json`.

### CSV Export
The `convertToCSV` function handles the conversion of JSON records to a flat CSV structure:
1.  **Header Extraction:** It iterates through all provided records to build a union set of all object keys. This handles arrays where objects might have varying schemas.
2.  **Complex Data Serialization:** It uses `serializeComplexData` to handle non-primitive values.
    *   Arrays and generic objects are converted to strings via `JSON.stringify`.
    *   If `JSON.stringify` throws an error (e.g., circular references, though unlikely from API responses), it falls back to `String(val)`.
3.  **Escaping:** Every value is converted to a string. Double quotes (`"`) within strings are escaped by doubling them (`""`), and the entire field is wrapped in double quotes to prevent conflicts with delimiter commas or internal line breaks.

## Download Invocation
The `downloadFile` function utilizes the browser's native `Blob` and `URL.createObjectURL` APIs. It creates an invisible anchor (`<a>`) element, sets the `href` to the Blob URL, triggers a programmatic `click()`, and cleans up the element and URL object. This ensures data never leaves the client browser for processing.

## Security & Compliance
Since the transformation and download happen entirely on the client side, no data is transmitted to an external service for conversion. This ensures that potentially sensitive API data accessed by the user remains secure and adheres to GDPR data minimization principles.
