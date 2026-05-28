# Saved Views & Favorites

## Goal
Enable users to personalize their Aperio dashboard by "pinning" frequently used resources to the top of the sidebar and saving custom table configurations (e.g., active filters, column visibility, and sorting) for immediate access.

## Problem
In APIs with dozens of resources, users often only interact with a small subset daily (e.g., `Users`, `Orders`, or `Settings`). Currently, users must manually scroll through the entire hierarchical sidebar to find these resources every time they open the dashboard. Furthermore, if they frequently filter a data table (e.g., showing only "Active" orders and hiding irrelevant columns), they must recreate this configuration during every session.

## Proposed Changes
- **Favorites (Sidebar):** Add a "star" icon next to resource names in the sidebar and header. Clicking it adds the resource to a new "Favorites" section permanently pinned at the top of the sidebar navigation.
- **Saved Views (Tables):** Extend the `ResourceTable` component to allow saving the current TanStack Table state (sorting, column visibility, and column filters) under a custom name (e.g., "Active US Customers").
- **State Persistence:** Store both pinned resources and saved table views in the Zustand `spec-store`, persisting them to `localStorage` keyed by the specific OpenAPI specification URL/ID. Implement a size-capped storage strategy and validation to prevent browser storage quota exhaustion.
- **View Selector:** Add a dropdown menu above resource tables to quickly switch between "Default View" and any user-created Saved Views.

## Definition of Done
- Users can star/unstar resources, immediately updating a "Favorites" section at the top of the sidebar.
- Users can save the current state of any resource table with a custom name.
- Users can load a saved view from a dropdown, instantly applying the saved sorting, filters, and column visibility.
- Favorites and Saved Views persist across browser reloads for the specific API spec.
- The UI cleanly handles deleting or renaming saved views.

## Technical & Compliance Considerations
- **Documentation:** Updates will be made across all three documentation architectures:
  - `/docs/customer`: Add a guide on how to pin resources to the sidebar and how to create, load, and manage custom table views.
  - `/docs/technical`: Document how the TanStack Table state object is serialized, stored alongside the spec metadata in Zustand, and retrieved.
  - `/docs/support`: Detail how to clear local storage if the saved views become corrupted or out of sync with an updated API spec.
- **Testing:** Write component tests to verify that starring a resource adds it to the favorites list. Write unit tests for the serialization and deserialization of the table state, ensuring filters and sorting are applied correctly upon load.
- **Security:** Ensure that saved view configurations strictly contain layout and filter metadata, not actual table data, preventing unintentional data exposure.
- **Reliability:** Implement versioning for saved views or robust fallback logic to handle situations where the underlying OpenAPI spec changes (e.g., a column saved in a view is removed from the spec). If a column no longer exists, the view should load gracefully without crashing. Additionally, wrap all storage writes in `try-catch` blocks and cap the total number/size of saved views per spec to prevent browser storage quota exhaustion.
- **Accessibility:** Ensure the "star" toggle and view selector dropdown are keyboard accessible and convey their state changes (e.g., "Resource added to favorites") via ARIA live regions.
- **GDPR Compliance:** As the preferences are stored exclusively on the client's local storage and only contain UI configuration (not user data), this feature is entirely GDPR compliant. No profiling or external tracking is involved.

## Future Press Release
**Make Aperio Your Own with Saved Views and Favorites**
Your API is massive, but your daily workflow doesn't have to be. Today, Aperio introduces Saved Views and Favorites, putting the power of personalization directly in your hands. Tired of scrolling past dozens of irrelevant endpoints to find the `Users` resource? Simply click the star icon to pin it permanently to the top of your sidebar. Frustrated by having to re-apply the same filters and hide the same columns every time you view the `Orders` table? Now you can save your exact table configuration as a custom view and load it instantly with a single click. Aperio now adapts to how you work, drastically speeding up your daily administration tasks. Make your dashboard truly yours, right from your browser.
