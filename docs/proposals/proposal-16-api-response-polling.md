# Proposal 13: API Response Polling for Live Updates

## Goal
Enable users to automatically refresh GET endpoints at specified intervals, transforming static tables into real-time or near real-time dashboards monitoring live data changes.

## Problem
In many scenarios, admin dashboards are used to monitor active systems, such as active jobs, incoming orders, or server statuses. Currently, Aperio's resource tables only fetch data once on load. If a user wants to check for new records or status updates, they must manually refresh the page or re-trigger the query, which is tedious and inefficient for continuous monitoring.

## Proposed Changes
- Add a "Live Updates" toggle and a polling interval selector (e.g., 5s, 15s, 30s, 60s) above the auto-generated resource tables for GET collection endpoints.
- When enabled, the application will automatically re-fetch the endpoint data at the chosen interval using a robust polling hook (e.g., integrating `react-query` or custom `setInterval` logic within React's `useEffect`).
- Include visual indicators showing when the next refresh will occur and display a subtle loading state during background re-fetches to keep the UI responsive without blocking user interaction.
- Add an automatic pause feature that stops polling when the browser tab is inactive to save network and compute resources.

## Definition of Done
- A Live Updates control group (toggle + interval dropdown) is integrated into `resource-table.tsx`.
- The table correctly updates data automatically at the specified interval.
- Polling pauses when the page visibility state changes to hidden and resumes when visible.
- No memory leaks or overlapping requests occur when switching intervals or changing filters.
- A visual indicator smoothly counts down to the next refresh or simply indicates polling is active.

## Technical & Compliance Considerations
- **Documentation:** Document the new "Live Updates" feature in the main `README.md` and in the user guide, highlighting how to configure intervals and the automatic pause behavior.
- **Testing:** Write component tests for `resource-table.tsx` verifying that the polling interval correctly triggers `fetchData`. Include end-to-end tests validating the polling behavior and tab visibility logic using mock timers.
- **Security:** Ensure repeated polling does not accidentally bypass any established rate limits on the proxy layer. Expose settings to configure maximum polling rates.
- **Reliability:** Implement request debouncing and cancellation (using AbortController) so that slow API responses do not stack up and overwhelm the client or the target API.
- **Accessibility:** Ensure the polling controls are fully keyboard-navigable and that screen readers are appropriately notified (via ARIA live regions) only when significant data changes occur, avoiding repetitive announcements on every poll.
- **GDPR Compliance:** This feature operates strictly client-side and only makes requests explicitly configured by the user. No additional data collection occurs, maintaining full GDPR compliance.

## Future Press Release
**Transform Aperio into a Real-Time Monitoring Dashboard with Live Updates**
Today, we are thrilled to introduce Live Updates for Aperio, an essential feature for keeping your admin dashboards perfectly in sync with your live systems. We know that manually refreshing pages to track order statuses or active jobs is a pain. With our new polling feature, you can set your resource tables to automatically refresh at custom intervals, turning your Aperio interface into a near real-time monitoring center. Whether you're tracking active server loads or recent user sign-ups, your data will stay fresh automatically. Built with efficiency in mind, the system intelligently pauses when you switch tabs, saving your battery and network. Stop refreshing, and start monitoring with Aperio's Live Updates today!
