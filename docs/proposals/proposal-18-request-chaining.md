# Proposal 15: Request Chaining for Complex Workflows

## Goal
Empower users to build sequential, multi-step API workflows by chaining multiple requests together, where the output of one request can be mapped directly to the input of the next.

## Problem
In many APIs, completing a logical business action requires multiple sequential calls. For example, to assign a user to a newly created project, an admin might need to: 1) POST to `/projects` to create the project, 2) extract the newly generated `projectId`, and 3) POST to `/projects/{projectId}/members` to add the user. Currently, users must manually perform these steps, copying and pasting IDs between generated forms, which is error-prone and time-consuming.

## Proposed Changes
- Introduce a new "Workflows" section in the application navigation.
- Implement a workflow builder UI allowing users to visually string together multiple API operations defined in the OpenAPI spec.
- Provide a simple mapping interface allowing users to extract variables from the JSON response of Step N (e.g., `$.id`) and use them as parameters or body variables in Step N+1 (e.g., `{{Step1.id}}`).
- Add a "Run Workflow" execution engine that executes the chained requests sequentially, displaying the live progress, inputs, and outputs of each step in a detailed log view.
- Allow users to save these configured workflows locally for reuse.

## Definition of Done
- A Workflows section is accessible from the main dashboard sidebar.
- Users can create a workflow, adding multiple sequential API steps selected from the available OpenAPI paths.
- Users can map JSON path outputs from previous steps into the URL parameters or body payloads of subsequent steps.
- The execution engine successfully processes the chain, aborting and showing detailed error logs if any step fails.
- Configured workflows are saved and persisted to local storage.

## Technical & Compliance Considerations
- **Documentation:** Create comprehensive documentation on how to build workflows, including a guide on the JSON path syntax used for mapping variables between steps.
- **Testing:** Write unit tests for the variable interpolation engine to ensure complex nested JSON paths resolve correctly. Write component tests for the workflow builder UI and execution runner.
- **Security:** Ensure variable interpolation does not introduce injection vulnerabilities. All interpolated strings should be safely inserted into request payloads or URLs without executing arbitrary code.
- **Reliability:** The execution engine must handle timeouts and network failures gracefully. If Step 2 fails, Step 3 should not execute, and the UI must clearly indicate the point of failure.
- **Accessibility:** The drag-and-drop or select-based workflow builder must be fully accessible via keyboard, and the execution status logs must be readable by screen readers.
- **GDPR Compliance:** Workflows are executed entirely within the browser context and definitions are saved to local storage. No workflow configurations or API data are sent to external Aperio servers, fully complying with data minimization principles.

## Future Press Release
**Automate Your Admin Tasks with Aperio Request Chaining**
We are proud to introduce Request Chaining to Aperio, bringing the power of complex workflow automation directly into your auto-generated admin dashboard. We know that business logic rarely requires just a single API call. Whether you're onboarding a new user and assigning them default permissions, or generating an invoice and sending a receipt, these processes require multiple steps. With Request Chaining, you can now visually link multiple API operations together, seamlessly passing IDs and data from one response to the next request. Build, save, and execute complex workflows with a single click, entirely within your browser. Say goodbye to manual copy-pasting and hello to flawless efficiency with Aperio today.
