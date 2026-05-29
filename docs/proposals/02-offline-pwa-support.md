# Offline PWA Support

## Goal
Transform Aperio into a Progressive Web App (PWA) that can function entirely offline or on unstable networks, allowing users to view API documentation and schemas without an active internet connection.

## Problem
Currently, Aperio requires an active internet connection to load the application, fetch external OpenAPI specifications, and display the dashboard. If the network goes down or is unstable, the user loses access to their API documentation and the tool becomes unusable, disrupting their workflow.

## Proposed Changes
- Implement a Service Worker using Workbox (or custom Service Worker scripts) to cache core application assets (HTML, CSS, JS, fonts).
- Configure the application manifest (`manifest.json`) to allow users to "Install" Aperio as a standalone application on their desktop or mobile device.
- Implement an intelligent caching strategy for loaded OpenAPI specifications. When a spec is successfully loaded, cache the parsed JSON/YAML payload locally.
- Add an "Offline Mode" indicator in the application header. If the network connection drops, display the indicator and serve the dashboard from the cached spec and assets.
- Disable actual API request execution (tables, forms) while offline, displaying a clear "Network Offline" warning instead, but keep all documentation, schemas, and structural views fully accessible.

## Definitions of Done
- A valid `manifest.json` is generated and linked.
- A Service Worker is registered successfully and caches core static assets.
- Users can install the application to their home screen/desktop via browser prompts.
- Previously loaded OpenAPI specifications are accessible even when the browser is entirely offline.
- A visual indicator clearly informs the user when they are offline.
- Interactive features that require a live connection (proxy requests, live table data) degrade gracefully with informative messages.

## Technical & Compliance Considerations
- **Documentation:** Document the offline capabilities in the user documentation (`docs/customer`), explaining what features work offline. Add details to the technical documentation (`docs/technical`) about the Service Worker caching strategy.
- **Testing:** Write end-to-end tests to verify that the application loads and renders cached specifications when offline mode is simulated in the browser. Test that live-request features correctly display the offline warning.
- **Security:** Ensure that the Service Worker is only registered over HTTPS. Validate that cached spec files do not inadvertently store sensitive data beyond what is publicly defined in the spec itself.
- **Reliability:** Implement cache versioning and clean-up strategies to ensure the user does not get stuck with an outdated version of the Aperio application or a stale spec cache when they come back online.
- **Accessibility:** Ensure the "Offline Mode" visual indicator and warning messages use high-contrast colors and are announced by screen readers when the network state changes.
- **GDPR Compliance:** The PWA caches files strictly on the local device to facilitate offline use. No additional tracking or personal data collection is introduced by the Service Worker.

## Future Press Release
**Take Your API Docs Anywhere with Aperio's Offline PWA Support**
Today, we are thrilled to announce that Aperio is now a fully-fledged Progressive Web App (PWA). We know that developers and administrators need reliable access to their API documentation, even when traveling, commuting, or experiencing network outages. With our new Offline Support, Aperio caches your application assets and loaded OpenAPI specifications securely on your device. You can now install Aperio directly to your desktop, and instantly access your API structures, schemas, and documentation without an active internet connection. When offline, Aperio intelligently disables live API requests while keeping your documentation fully explorable. Stay productive anywhere, anytime, with the robust resilience of Aperio.
