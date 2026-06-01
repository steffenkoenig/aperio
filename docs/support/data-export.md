# Troubleshooting: Data Export

This playbook assists support personnel in diagnosing issues related to the Data Export functionality in the `ResourceTable`.

## 1. Export Button is Disabled

**Symptom:** The user navigates to a table, but the Export button is greyed out and cannot be clicked.

**Triage Steps:**
- **Check Data Presence:** The export button is intentionally disabled if the table is empty (`table.getFilteredRowModel().rows.length === 0`). The user must ensure data is actually loaded and not filtered out by the search bar.
- **Check Loading State:** The button is disabled while data is actively being fetched from the API (`isLoading === true`). Instruct the user to wait for the loading spinner to disappear.

## 2. Exported CSV Contains `[object Object]`

**Symptom:** The user downloads a CSV, but some columns display `[object Object]` instead of actual data.

**Triage Steps:**
- **Identify Circular References:** This occurs when the `serializeComplexData` utility encounters a JavaScript object with a circular reference, preventing `JSON.stringify` from operating.
- **Resolution:** This usually indicates a deeply nested or improperly formatted response from the target API. Ask the user to provide the OpenAPI specification for that endpoint and a sample JSON response (if possible) to report to engineering.

## 3. Only Partial Data is Exported

**Symptom:** The user claims they have 500 records in their database, but the exported file only contains 20.

**Triage Steps:**
- **Explain Client-Side Scope:** The export function only captures the data currently visible/loaded in the table view.
- **Check API Pagination:** If the target API utilizes pagination (e.g., returning 20 items per page), the user will only export that single page. Aperio does not currently traverse multiple pages to compile a full database export automatically.

## 4. Nothing Happens When Clicking Export

**Symptom:** The user clicks "Export as CSV" but no file is downloaded.

**Triage Steps:**
- **Check Browser Settings:** Ensure the user's browser is not blocking automatic downloads. Some strict enterprise browser policies disable programmatic Blob downloads.
- **Check Console:** Ask the user to open Developer Tools (F12) and check the Console tab for any JavaScript errors (e.g., memory limits exceeded during the `convertToCSV` process for massive datasets).