# Activity Audit Email Notifications

## Goal
Enhance administrative oversight and security by sending automated email notifications whenever a mutating operation (POST, PUT, PATCH, DELETE) is successfully executed via the Aperio dashboard.

## Problem
Currently, Aperio acts as a direct proxy to the underlying API. While this is highly efficient, it lacks a built-in audit trail. Administrators or team leads have no visibility into when records are created, modified, or deleted through the platform unless they manually inspect the underlying database or API logs. This lack of observability makes it difficult to track changes or identify unauthorized actions taken by users sharing the Aperio environment.

## Proposed Changes
- Introduce a new configuration section in the Settings/Environment panel allowing users to input a "Notification Email Address" and configure SMTP settings (or integrate with a lightweight email API like Resend/SendGrid).
- Modify the API proxy route (`src/app/api/proxy/route.ts`) to intercept successful (HTTP 2xx) responses for mutating methods (POST, PUT, PATCH, DELETE).
- When a successful mutation occurs, construct a summary payload containing the endpoint path, method, timestamp, and environment name.
- Asynchronously dispatch an email notification to the configured address containing the summary payload.
- Ensure the email dispatch does not block the primary API response returning to the client.

## Definitions of Done
- A configuration UI exists for users to set up an email provider and destination address.
- Mutating API calls (POST, PUT, PATCH, DELETE) trigger an email notification upon a successful 2xx response.
- Read-only API calls (GET, OPTIONS, HEAD) do not trigger emails.
- The email content clearly outlines what action was taken (e.g., `POST /users`), when it happened, and in which environment.
- The core API request/response lifecycle is unaffected by the email dispatch process (no introduced latency).

## Technical & Compliance Considerations
- **Documentation:** Create an administration guide in `docs/customer` detailing how to configure the SMTP/API settings for audit emails. Document the asynchronous queue or fire-and-forget architecture in `docs/technical`. Provide SMTP troubleshooting guides in `docs/support`.
- **Testing:** Write unit tests for the email construction logic. Mock the email provider in integration tests to verify the proxy route attempts to send emails only for correct methods and response codes.
- **Security:** Ensure SMTP credentials or API keys are stored securely (e.g., using secure HTTP-only cookies, local encrypted storage, or server-side environment variables if Aperio is self-hosted). Do not include the actual request/response body payloads in the email by default, preventing the leakage of sensitive data or credentials.
- **Reliability:** Implement a fire-and-forget or background job mechanism for sending emails so that API proxy performance is not degraded. Failures to send an email should be logged but should not cause the API proxy request to fail.
- **Accessibility:** Ensure the settings UI for configuring email notifications meets all standard accessibility guidelines.
- **GDPR Compliance:** The email notifications act as an audit log. To maintain compliance, ensure that no Personally Identifiable Information (PII) from the request payloads is included in the email text; only log the metadata (Method, Path, Timestamp).

## Future Press Release
**Stay Informed with Aperio Activity Audit Emails**
Visibility is key to managing a secure and stable API environment. Today, Aperio introduces Activity Audit Emails, providing administrators with real-time oversight of critical platform actions. By simply configuring an email destination, your team will receive instant notifications whenever a record is created, updated, or deleted through the Aperio dashboard. This simple yet powerful audit trail ensures you always know what changes are happening in your environments, fostering better accountability and peace of mind without the need for complex logging infrastructure.
