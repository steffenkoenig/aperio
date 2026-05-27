# Improvement Plan: Request/Response History & Debugging Panel

## Goal
Provide users with a built-in debugging panel that logs the history of all requests made from the Aperio UI through the internal proxy, allowing them to inspect payloads, headers, response times, and status codes.

## Problem
When a user interacts with the generated Admin UI and an API request fails or behaves unexpectedly, it is difficult to determine whether the issue lies in the generated form payload, the proxy configuration, or the target API itself. Users currently have to rely on the browser's native network tab, which can be cluttered and doesn't clearly separate Aperio's internal state from the actual outgoing proxy request.

## Proposed Changes
1. **History State Store:** Create a new Zustand slice or dedicated store (`src/store/history-store.ts`) to keep a transient log of recent requests and responses.
2. **Proxy Interception:** Update the internal Next.js API proxy (src/app/api/proxy/route.ts) to return detailed metadata about the outgoing request (exact URL, headers sent, payload) via custom response headers (e.g., X-Aperio-Metadata as a base64-encoded JSON string) to avoid corrupting non-JSON or raw JSON response payloads.
3. **Debugging Panel UI:** Create a collapsible drawer or a dedicated "History" tab in the UI.
4. **Log Details View:** Within the panel, clicking a log entry will open a detailed JSON tree view (using an existing library like `@uiw/react-json-view` or similar) showing Request Headers, Request Body, Response Headers, Response Body, and Timing.

## Definition of Done
- All API requests initiated via the Admin UI are logged in the History Panel.
- Each log entry displays method, endpoint, status code, and latency.
- Expanding a log entry shows full request and response details.
- The history store retains a configurable maximum number of logs (e.g., last 50 requests) to prevent memory bloat.
- Users can clear the history log manually.
- Code is covered by appropriate tests.

## Documentation Update
- Update `README.md` to highlight the new "Debugging & History Panel" feature.
- Explain how to view the exact payload that Aperio generated and sent to the target API.

## Testing
- **Unit Tests:** Verify the history store correctly queues new logs, truncates old ones, and clears the log list.
- **Component Tests:** Test the rendering of the History Panel and the JSON tree viewer.
- **E2E Tests:** Simulate a successful API call and a failed API call (e.g., 404) and assert that both appear correctly in the history panel with the appropriate status badges.

## Security
- **Sensitive Data Masking:** Implement a local sanitization utility that masks common sensitive fields (e.g., `Authorization` headers, passwords) in the UI display.
- **No Telemetry:** Ensure that this log data is strictly kept in the browser's memory/session and is never sent to any analytics or crash reporting service.

## Reliability
- **Memory Management:** Strictly enforce a cap on the number of stored logs (e.g., 50-100) and truncate large response payloads (e.g., > 1MB) to prevent the browser from crashing due to high memory usage.

## Accessibility
- Ensure the expandable log items are accessible via keyboard navigation.
- Status indicators (Success vs. Error) must not rely on color alone (e.g., adding an icon or text label like "Status: 200 OK").
- Ensure the drawer/panel traps focus correctly when opened as a modal, if applicable.

## GDPR Compliance
- **Local Ephemeral Storage:** Request logs might contain PII (Personal Identifiable Information) depending on the user's API. Ensure these logs are stored entirely ephemerally in memory (or `sessionStorage`) and are wiped when the tab is closed.
- **No Third-Party Transmission:** Reiterate that logging is purely a client-side debugging tool; no data is transmitted to Aperio servers or third parties.
- **Transparency:** The feature itself enhances transparency by showing the user exactly what data is being sent to their own endpoints.

## Future Press Release
What's up developers! Ever filled out an auto-generated form in Aperio, hit submit, and got a weird error back, leaving you guessing what went wrong? Say goodbye to digging through your browser's cluttered network tab. Today we're dropping the built-in Request History & Debugging Panel. It sits right inside your Aperio dashboard and logs every single request and response. You can instantly inspect exactly what headers were injected, what JSON payload was generated, and what your API spat back out. It's fast, completely local, and designed to save you massive headaches. Check it out and squash those bugs!