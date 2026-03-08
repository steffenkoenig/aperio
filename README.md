<div align="center">
  <img src="https://github.com/user-attachments/assets/8e642a6a-c624-435a-9f09-d4874c4ef616" alt="Aperio — Your API Spec is your Admin Dashboard" width="100%" />
</div>

<h1 align="center">Aperio</h1>

<p align="center">
  <strong>OpenAPI → Admin UI, instantly.</strong><br />
  Aperio reads any OpenAPI 3.x specification and generates a fully functional, interactive admin UI — no code required.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-16-black?logo=next.js" alt="Next.js" />
  <img src="https://img.shields.io/badge/React-19-61DAFB?logo=react" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/status-beta-orange" alt="Beta" />
</p>

---

## What is Aperio?

Aperio is an **OpenAPI-to-admin-dashboard engine**. Point it at any OpenAPI 3.x spec (JSON or YAML) and it instantly produces a live, interactive admin interface — complete with resource tables, smart forms, hierarchical navigation, multi-environment support, and a built-in API proxy.

No boilerplate. No code generation. Just paste a URL and go.

---

## Screenshots

### Step 1 — Load your OpenAPI spec

Paste a spec URL, drag and drop a JSON/YAML file, or pick one of the built-in examples to get started in seconds.

![Home page with spec loader](https://github.com/user-attachments/assets/4a85377f-c740-40d9-9e20-503b26f338b9)

---

### Step 2 — Instant dashboard overview

After loading a spec, Aperio parses it and shows a structured overview: endpoint count, root resources, schemas, HTTP method distribution, server URLs, security schemes, and tags — all at a glance.

![Dashboard overview with Swagger Petstore loaded](https://github.com/user-attachments/assets/72e863d5-40f0-4f1a-af41-4a68ab64af64)

---

### Step 3 — Explore resources in the sidebar

Every resource in your API is automatically classified and organized into a collapsible sidebar tree. Root resources, sub-resources, and actions are clearly distinguished with color-coded HTTP method badges.

![Resource sidebar and root resource view](https://github.com/user-attachments/assets/21f2deb9-fe18-4dd6-8e8a-f3bb5bbf01d6)

---

### Step 4 — Dynamic forms for POST / PUT / PATCH

Each write operation is rendered as a fully typed, schema-driven form. Fields are generated from your OpenAPI schemas with inline validation — no configuration needed.

![Dynamic form for POST /pet endpoint](https://github.com/user-attachments/assets/aac39f63-1da3-4d7b-87db-863cc9699ef7)

---

### Step 5 — Query endpoints and sub-resources

Sub-resources and action endpoints are neatly nested under their parent. GET endpoints with query parameters render an interactive query panel so you can call the live API right from the dashboard.

![Find by status sub-resource query panel](https://github.com/user-attachments/assets/2cf16c72-a093-42fd-b271-9c718f26cd17)

---

### Step 6 — Multi-environment support

Switch between dev, staging, and production environments in one click. Each environment stores its own base URL and auth configuration (Bearer token, API key, or Basic auth), all persisted in your browser.

![Environment switcher dropdown](https://github.com/user-attachments/assets/23ce5e79-cf38-493b-a64b-5be311495db0)

---

## Features

| Feature | Description |
|---|---|
| **Auto-Generated Tables** | GET collection endpoints become sortable, filterable data tables automatically. |
| **Dynamic Forms** | POST / PUT / PATCH operations render as smart forms with inline validation driven by JSON Schema. |
| **Path Intelligence** | Automatically classifies resources, sub-resources, singleton records, and custom actions from your API paths. |
| **Multi-Environment** | Switch between dev, staging, and production with per-environment base URLs and auth configs. |
| **Sidebar Navigation** | Hierarchical resource tree in the sidebar, built directly from your OpenAPI spec's tags and paths. |
| **API Proxy** | Built-in CORS proxy handles auth token injection and request forwarding so you can call real APIs from the browser. |
| **OpenAPI 3.x Support** | Supports both JSON and YAML specs. Load from a URL or upload a local file. |
| **Zero Config** | No code generation, no configuration files — just paste a spec URL and explore. |

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org) 18 or later
- npm, yarn, pnpm, or bun

### Install & run

```bash
# Clone the repository
git clone https://github.com/steffenkoenig/Aperio.git
cd Aperio

# Install dependencies
npm install

# Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Quick demo

1. Open the app in your browser.
2. Click **Petstore (Swagger)** to load the example spec instantly.
3. Browse the sidebar, click a resource, and explore the generated tables and forms.
4. Click **Default** in the top-right corner to configure environments and auth.

---

## Usage

### Loading a spec

| Method | How |
|---|---|
| **URL** | Paste any publicly accessible OpenAPI JSON or YAML URL into the input field and click **Load**. |
| **File upload** | Drag and drop a `.json`, `.yaml`, or `.yml` file onto the upload area, or click it to open a file picker. |
| **Quick examples** | Use the built-in **Petstore (Swagger)** or **GitHub API** buttons to load a demo spec immediately. |

### Configuring environments

Click the **Default** pill in the dashboard header to open the environment switcher. You can:

- Edit the active environment's base URL and auth settings.
- Add new environments (e.g., `Development`, `Staging`, `Production`).
- Switch between environments — the dashboard will use the selected environment's base URL and credentials for all API calls.

**Supported auth types:** None · Bearer Token · API Key · Basic Auth

### Navigating resources

The left sidebar lists all resources discovered from the spec. Click any item to open its resource view:

- **Root resources** show all available HTTP methods as tabs (Create, Update, Sub-resources).
- **Sub-resources** display the endpoint's parameters and operations.
- **Action endpoints** show a simple form or button to trigger the action.

---

## Tech Stack

- **[Next.js 16](https://nextjs.org)** — App Router, API routes, server-side rendering
- **[React 19](https://react.dev)** — UI framework
- **[TypeScript 5](https://www.typescriptlang.org)** — Type safety throughout
- **[Tailwind CSS 4](https://tailwindcss.com)** — Utility-first styling
- **[Radix UI](https://www.radix-ui.com)** — Accessible component primitives
- **[Zustand](https://zustand-demo.pmnd.rs)** — Lightweight client state management
- **[@scalar/openapi-parser](https://github.com/scalar/scalar)** — OpenAPI 3.x spec parsing and validation
- **[@rjsf/core](https://rjsf-team.github.io/react-jsonschema-form/)** — JSON Schema-driven form rendering
- **[@tanstack/react-table](https://tanstack.com/table)** — Headless data table
- **[Lucide React](https://lucide.dev)** — Icon library
- **[Sonner](https://sonner.emilkowal.ski)** — Toast notifications

---

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── parse-spec/     # Parses and validates OpenAPI specs
│   │   └── proxy/          # CORS proxy with auth injection
│   ├── dashboard/
│   │   ├── layout.tsx      # Dashboard shell with sidebar + topbar
│   │   ├── page.tsx        # API overview page
│   │   └── resource/[slug] # Dynamic resource page
│   ├── layout.tsx
│   └── page.tsx            # Landing page with spec loader
├── components/
│   ├── environment-switcher.tsx
│   ├── resource-form.tsx   # Schema-driven form renderer
│   ├── resource-table.tsx  # Auto-generated data table
│   ├── sidebar-nav.tsx     # Hierarchical resource tree
│   ├── spec-loader.tsx     # URL / file / drag-drop loader
│   └── ui/                 # Shared UI primitives
├── lib/
│   ├── openapi-parser.ts   # Spec parsing logic
│   ├── path-intelligence.ts # Resource classification
│   ├── types.ts
│   └── utils.ts
└── store/
    └── spec-store.ts       # Zustand store (spec + environments)
```

---

## Deployment

The easiest way to deploy Aperio is via [Vercel](https://vercel.com):

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/steffenkoenig/Aperio)

Or build for any Node.js host:

```bash
npm run build
npm start
```

---

## License

MIT
