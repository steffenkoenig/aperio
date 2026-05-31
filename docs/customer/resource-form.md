# Dynamic Resource Forms

Aperio's dynamic `ResourceForm` converts your OpenAPI 3.x definitions directly into interactive interfaces without any configuration.

When you select a write operation (e.g., `POST`, `PUT`, `PATCH`), the system automatically builds a form representing the shape of the `requestBody`. Every string, number, select box, and checkbox corresponds exactly to your defined JSON Schema (`application/json`).
Nested objects and arrays allow you to construct deep, complex payloads intuitively within the browser.
