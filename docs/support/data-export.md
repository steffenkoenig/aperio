# Troubleshooting: Data Export

This guide assists in troubleshooting issues related to the Data Export feature in Aperio.

## Common Issues

### 1. The Export button is disabled
*   **Cause:** The Export button is dynamically disabled when the table is actively loading data (`isLoading === true`) or when the table has zero rows (either due to no data being returned from the API, or global filters hiding all records).
*   **Resolution:** Wait for the API request to finish loading. If the table is empty, ensure the target API contains data, or clear the `Global Filter` search box to reveal records.

### 2. Exported CSV contains `[object Object]`
*   **Cause:** The underlying API data contains deeply nested circular structures that the JSON stringifier cannot safely serialize.
*   **Resolution:** The `export-utils` logic attempts to stringify complex nested properties. If a circular reference exists, it safely falls back to `String()`, which yields `[object Object]`. Review the API schema to determine if circular references are intended. Consider exporting as JSON to retain the raw structured output if the CSV formatter fails.

### 3. Not all data is exported
*   **Cause:** The export function only captures the data currently loaded into the browser memory by the table. If the API utilizes pagination (returning 50 records out of a total 1000), only the 50 visible records will be exported.
*   **Resolution:** Check if the API supports modifying the page limit via query parameters (e.g., `?limit=1000`) and adjust the URL parameters if necessary to fetch a larger batch before exporting. Note that fetching massive datasets directly into the browser may cause performance degradation.

### 4. Browser blocks the download
*   **Cause:** Aggressive popup blockers or corporate security policies may prevent the automatic download triggered by the programmatic anchor click.
*   **Resolution:** Advise the user to check their browser's URL bar for a "Pop-up blocked" icon and allow downloads from the Aperio domain.
