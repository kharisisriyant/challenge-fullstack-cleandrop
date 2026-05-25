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

## Running the project

### With Docker (recommended)

```bash
docker compose up --build
```

- Frontend: http://localhost:5173
- GraphQL playground: http://localhost:3000/graphql

The `api` container runs migrations and seed automatically on startup.

### Local development

**Prerequisites:** Bun ≥ 1.1, PostgreSQL running on port 5432

```bash
# Install all deps
bun install

# API
cd apps/api
cp .env.example .env          # edit DATABASE_URL if needed
bun run migrate               # run DB migrations
bun run seed                  # seed 2 users + 9 services
bun dev                       # starts on :3000

# Web (new terminal)
cd apps/web
bun dev                       # starts on :5173
```

### Seeded accounts

| Email | Password | Role |
|-------|----------|------|
| admin@cleandrop.com | admin123 | admin |
| user@cleandrop.com | user123 | user |

### Run backend tests

```bash
cd apps/api && bun run test
```

---

## Project structure

```
/
├── apps/
│   ├── api/                 # NestJS + GraphQL + Drizzle
│   │   ├── drizzle/         # schema, migrations, seed
│   │   └── src/
│   │       ├── auth/        # JWT auth, guards, resolver
│   │       ├── drizzle/     # DrizzleModule (global)
│   │       └── services/    # CRUD resolvers + service layer
│   └── web/                 # React + Vite + Apollo + Zustand
│       └── src/
│           ├── apollo/      # ApolloClient with auth link
│           ├── components/  # UI primitives + layout + services
│           ├── graphql/     # GQL documents
│           ├── pages/       # LoginPage, ServicesPage
│           └── store/       # Zustand auth store
├── docker-compose.yml
├── package.json             # Bun workspace root
└── tsconfig.base.json
```

---

## Assumptions

- GraphQL replaces REST; schema auto-generated code-first via `@nestjs/graphql`.
- `role` enforcement at two points: `RolesGuard` on each resolver, and React UI hides admin controls when `role !== 'admin'`.
- Summary cards show counts from the **current query result** for simplicity.
- Prices stored as integers (EUR).
