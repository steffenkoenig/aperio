# Release Notes

## Version 0.1.1 (Current)
- **Bug Fix**: Fixed an issue where the frontend resource form would crash when trying to display nested array objects containing reference tags (`$ref`), such as the `tags` array on the `Pet` endpoint.
- **Dependency Update**: Successfully migrated custom internal form implementation to robust robust third-party standard (`@rjsf/core`), unlocking standard OpenAPI structural validation.
