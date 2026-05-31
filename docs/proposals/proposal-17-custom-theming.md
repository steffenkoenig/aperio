# Proposal 14: Custom Branding and Theming

## Goal
Allow users to customize the visual appearance of the Aperio dashboard, specifically by setting a custom logo, primary color, and brand name, to make the auto-generated admin UI feel like an integrated, white-labeled internal tool.

## Problem
Currently, Aperio generates a robust functional dashboard, but it strictly uses the default Aperio branding and color scheme. For many organizations, internal tools need to align with company branding to maintain a cohesive ecosystem and ensure internal users recognize it as an official company application.

## Proposed Changes
- Introduce a "Theme & Branding" configuration panel in the application settings (accessible from the user dropdown or header).
- Allow users to upload or provide a URL for a custom logo that replaces the default Aperio logo in the top navigation bar.
- Allow users to select a custom primary color (via a color picker) that overrides the default Tailwind primary utility color used for buttons, active links, and highlights.
- Allow users to override the "Aperio" application title with their own internal tool name (e.g., "ACME Admin").
- Store these branding settings in local storage (or optionally serialized into a sharable configuration link) so the branding persists across sessions.

## Definition of Done
- A Theme Settings modal is available in the UI.
- Users can input a custom logo URL, brand name, and primary color hex code.
- The UI immediately updates to reflect these changes (e.g., updating CSS variables for colors, swapping out the logo component).
- The branding configuration is persisted securely in local storage.
- If no custom branding is set, the application gracefully falls back to the default Aperio branding.

## Technical & Compliance Considerations
- **Documentation:** Add a dedicated section in `README.md` and user docs explaining how to configure custom branding, including optimal logo dimensions and formats.
- **Testing:** Write component tests to verify the Theme Settings modal correctly updates the Zustand store and that the main layout component successfully applies the dynamic CSS variables and renders the custom logo.
- **Security:** Ensure any provided logo URLs are sanitized to prevent potential Cross-Site Scripting (XSS) vectors. Only allow `http://`, `https://`, or relative paths, and restrict arbitrary JavaScript URIs.
- **Reliability:** Implement a resilient color contrast checker (or provide guidance) to ensure that text on top of the custom primary color remains legible, avoiding accessibility issues.
- **Accessibility:** Ensure the Theme Settings modal is accessible (keyboard navigable, ARIA labels). Ensure dynamically injected colors pass WCAG contrast guidelines against background colors.
- **GDPR Compliance:** All branding settings are stored entirely on the client side. No branding data is transmitted back to Aperio or any external server, ensuring complete data privacy.

## Future Press Release
**Make Aperio Your Own with Custom Branding and Theming**
We are excited to announce Custom Branding for Aperio, giving you the power to white-label your instant admin dashboards. While Aperio gets you an admin UI in seconds, we understand that internal tools need to feel like they belong to your company. With our new Theme Settings panel, you can effortlessly swap out the Aperio logo for your own, set your company's primary colors, and rename the dashboard to match your internal terminology. The customization is instant, persistent, and entirely client-side, ensuring a secure and cohesive experience for your team. Empower your organization with a perfectly tailored, instantly generated admin interface today!
