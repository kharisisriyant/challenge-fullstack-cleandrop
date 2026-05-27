# Challenge Submission

## Assumptions

- The stats on the dashboard changes as the filter changes.
- Service duration is between 30-480 minutes.
- Prices stored as integers, not float.

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
| admin@cleandrop.io | admin123 | admin |
| user@cleandrop.io | user123 | user |

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
