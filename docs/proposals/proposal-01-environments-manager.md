# Improvement Plan: Local Environments & Workspace Manager

## Goal
Enable users to seamlessly switch between different OpenAPI specifications and API environments (e.g., Development, Staging, Production) within the Aperio interface, persisting their configurations entirely on their local machine.

## Problem
Currently, Aperio requires users to repeatedly upload OpenAPI specs or configure base URLs and custom headers every time they want to test a different environment or a different API. This is tedious, breaks workflow momentum, and increases the likelihood of typos in headers or URLs. There is no concept of a "workspace" to save ongoing testing setups.

## Proposed Changes
1. **Workspace State Management:** Extend the Zustand store (`src/store/spec-store.ts`) to manage multiple "Workspaces." A Workspace will contain:
   - An uploaded/linked OpenAPI spec.
   - Environment variables (Base URL, specific custom headers like `Authorization`).
2. **Environment Switcher UI:** Add a dropdown component to the application header allowing users to quickly swap between their saved Workspaces.
3. **Workspace Configuration Panel:** Create a settings modal to create, edit, duplicate, and delete Workspaces.
4. **Local Persistence Strategy:** Ensure all workspace data is exclusively saved to the browser's local storage (using IndexedDB or localforage for large OpenAPI specs to avoid localStorage quota limits and prevent UI-blocking serialization). No data will be sent to any external or backend servers.

## Definition of Done
- Users can create, update, and delete multiple Workspaces.
- Users can switch between Workspaces via a UI dropdown.
- Zustand store persists workspace configurations using IndexedDB or localforage for large spec payloads, and localStorage for lightweight metadata.
- Changing a Workspace instantly updates the active API specification, Base URL, and headers used by the proxy.
- Comprehensive unit and integration tests are written and passing.
- User documentation is updated to explain how to use Workspaces.

## Documentation Update
- Add a new section in `README.md` under "Features" explaining the Local Environments & Workspace Manager.
- Provide a brief guide on how to export and import workspace configurations (if applicable in the future) and how data is stored.

## Testing
- **Unit Tests:** Test the new Zustand actions (addWorkspace, removeWorkspace, setActiveWorkspace) to ensure state mutates correctly.
- **Component Tests:** Verify the Environment Switcher UI renders correctly and triggers the right state changes.
- **E2E Tests:** Use Playwright/Cypress to simulate a user creating two different workspaces with distinct base URLs and verifying that requests made via the UI route to the correct respective URLs.

## Security
- **No Remote Storage:** All configurations, including sensitive custom headers (like Bearer tokens), remain completely within the user's browser `localStorage`.
- **XSS Prevention:** Ensure all user inputs for workspace names and headers are properly sanitized before rendering in the DOM or passing to the proxy.

## Reliability
- **Storage Limits:** Implement checks for `localStorage` quota limits. If a user uploads massive OpenAPI specs that exceed typical limits, gracefully alert the user rather than crashing the app.
- **Schema Migrations:** If the structure of the Workspace object changes in future updates, implement a versioning and migration strategy for the Zustand persisted state to prevent app breakage for returning users.

## Accessibility
- Ensure the Environment Switcher dropdown is fully navigable via keyboard (Tab, Arrow keys, Enter/Space).
- Use proper ARIA attributes (e.g., `aria-expanded`, `aria-controls`) for the workspace configuration modals and dropdowns.
- Maintain high color contrast for active vs. inactive workspace states.

## GDPR Compliance
- **Data Minimization & Storage:** No personal data or configuration data is sent to or stored on our servers. Everything lives locally on the user's device.
- **Right to Erasure / Data Clearing:** Include a prominent "Clear All Local Data" button in the settings panel, allowing users to wipe all their saved workspaces, specs, and configurations from `localStorage` in one click.
- **Consent:** Since data is strictly necessary for the local functioning of the app and is not transmitted, explicit cookie-style consent is not strictly required, but a brief tooltip explaining that data is saved locally will enhance transparency.

## Future Press Release
Hey everyone, we're stoked to announce a massive level-up for Aperio: the Local Environments & Workspace Manager! We know how annoying it is to keep swapping out base URLs and pasting in new bearer tokens every time you switch from testing your dev API to your staging setup. Now, you can save all those setups as dedicated Workspaces right in your browser. Switch between your different OpenAPI specs and environments with a single click, without ever losing your flow. Plus, because we care about your privacy, everything is saved strictly to your local storage—no data leaves your machine. Happy hacking, and let us know what you think!