# Release Notes

## Version 0.1.2 (Current)
- **New Feature: Data Export**: You can now export the data visible in your Resource Tables directly to CSV or JSON formats. Look for the "Export" button in the top right corner of any data table to quickly download your API records for offline analysis.

## Version 0.1.1
- **Bug Fix**: Fixed an issue where the frontend resource form would crash when trying to display nested array objects containing reference tags (`$ref`), such as the `tags` array on the `Pet` endpoint.
- **Dependency Update**: Successfully migrated custom internal form implementation to robust robust third-party standard (`@rjsf/core`), unlocking standard OpenAPI structural validation.
