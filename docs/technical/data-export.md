# Data Export Architecture

The Data Export feature enables extracting tabular data directly from the browser environment, implementing Proposal 10 of the Aperio improvement roadmap.

## Implementation Details

The core logic resides in `src/lib/export-utils.ts` and `src/components/resource-table/index.tsx`.

### `ResourceTable` Component Updates
The `ResourceTable` component has been extended to include an "Export" dropdown menu.
- It relies on `@tanstack/react-table`'s `table.getFilteredRowModel().rows` to fetch the currently active and filtered dataset.
- Filename generation dynamically extracts the resource name from the component's `path` prop and appends the current ISO date. (e.g. `users_export_2023-10-27.csv`).

### `export-utils.ts`
Two primary utilities govern data transformation:
1. `convertToCSV(data)`: Accepts an array of object records.
   - It dynamically extracts all unique keys across the dataset to form the CSV headers.
   - It iterates through each row, escaping internal quotes and wrapping values in double quotes to conform to standard CSV encoding.
2. `serializeComplexData(val)`: Handles non-primitive data types (objects, arrays) by attempting `JSON.stringify`. If it encounters non-serializable objects (like circular references), it gracefully falls back to `String(val)`.

### Client-Side File Generation
The `downloadFile` function utilizes the browser's `Blob` and `URL.createObjectURL` APIs to trigger a programmatic download.

## Architectural Constraints & Considerations

- **Pagination Limitations:** The export strictly processes the data currently held in the client's memory. It does not natively traverse paginated API endpoints to fetch a full collection.
- **Performance:** For exceptionally large datasets (e.g., thousands of rows returned in a single request), the synchronous CSV conversion could briefly block the main UI thread.
- **Security & GDPR:** Because conversion utilizes native browser APIs (Blob), no network requests are dispatched during the export phase. This fulfills the strict security constraint that sensitive administrative data must not leave the client boundary for external processing.