# Command Palette Troubleshooting

## Issue: Keyboard shortcut (Ctrl+K / Cmd+K) is not working

**Symptoms:** Pressing the shortcut does not open the Command Palette.
**Potential Causes:**
1. **Browser Conflicts:** Certain browser extensions (like password managers or productivity tools) may override the `Ctrl+K` or `Cmd+K` shortcuts globally.
2. **Focus:** If focus is trapped inside a specific deeply nested iframe or native browser element (like the address bar), the global listener on `document` may not receive the event.

**Resolution:**
- Users can still manually open the palette by clicking the **Search...** button in the top navigation bar.
- Advise the user to check their browser extensions for conflicting shortcuts.

## Issue: Search results are empty

**Symptoms:** The palette opens, but no resources or endpoints are displayed when typing.
**Potential Causes:**
1. **Empty Spec:** The currently loaded OpenAPI specification may not contain valid paths or operations.
2. **Search Term:** The search algorithm uses basic fuzzy matching against the resource title and path string. If the string completely diverges from any available endpoint, it will return "No results found."

**Resolution:**
- Verify that the sidebar contains endpoints. If the sidebar is populated but the search is empty, ensure the user's search query closely matches the expected path (e.g. `/users`).
