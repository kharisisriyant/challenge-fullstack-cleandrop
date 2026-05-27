# Cleandrop Fullstack Challenge

Build a small **Services catalog** app with authentication and role-based access. The UI should match the reference below.

![Services page reference](./challenge-preview.png)

---

## Goal

Implement a login flow and a **Services** page at `/services`. After a successful login, redirect the user to `/services`.

Access is controlled by a **JWT** that includes a `role` claim:

| Role | Access |
|------|--------|
| `admin` | Full CRUD on services (create, read, update, delete) |
| `user` | Read-only (list and view services; no create, edit, or delete) |

Enforce authorization on both the **API** and the **UI** (e.g. hide or disable actions the user cannot perform).

---

## UI requirements

Reproduce the Services screen from the preview as closely as is reasonable:

- **Sidebar** with navigation; **Services** is the active item
- **Header**: title, subtitle, and a "Platform-wide" badge
- **Summary cards**: Total Services, Active, Drafts, Avg. Base Price
- **Catalog** section: search, status/category filters, sortable table, pagination
- **"+ Add"** button visible and functional for `admin` only
- Table columns: Name (with description), Category, Company, Status, Duration

You may seed sample data so the page looks like the reference (9 services, mixed statuses, etc.).

---

## Tech stack

| Layer | Stack |
|-------|--------|
| Runtime / package manager | **Bun** |
| Backend | **NestJS** (TypeScript) |
| ORM | **Drizzle ORM** |
| Database | **PostgreSQL 16** |
| Frontend UI | **shadcn/ui** (Radix primitives + TailwindCSS) |
| Tests (backend) | **Jest** |
| Dev environment | **Docker** (`docker compose` starts everything) |
| Monorepo | Bun workspaces |
| API style | **GraphQL** (code-first, `@nestjs/graphql` + Apollo Server) |
| GQL client | Apollo Client v3 |
| State | Zustand (auth store) |

---