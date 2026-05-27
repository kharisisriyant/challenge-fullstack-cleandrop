# Cleandrop E2E Tests

Playwright end-to-end tests for the Cleandrop web app. Covers the full services flow: user login, filters, logout, admin login, and service create / edit / delete.

## Prerequisites

- The `api`, `web`, and `db` services must be running locally.
- Seed data must be loaded (the tests rely on the seeded admin/user accounts and companies).

From the repo root:

```bash
docker compose up -d db
bun run --filter api migrate
bun run --filter api seed
bun dev   # starts api on :3000 and web on :5173
```

## Setup

Install dependencies and Chromium:

```bash
cd e2e
bun install
bun run install:browsers
```

## Running the tests

All commands run from `e2e/`.

| Command | What it does |
|---|---|
| `bun test` | Headless run, default reporter |
| `bun run test:headed` | Headed run, watch the browser (uses `SLOWMO`) |
| `bun run test:ui` | Playwright UI mode — timeline, time-travel, DOM snapshots per step |
| `bun run report` | Open the last HTML report |
| `bunx playwright test --debug` | Inspector with step-through and pause |

## Configuration

Set via environment variables — no `.env` file. Defaults live in [playwright.config.ts](./playwright.config.ts).

| Var | Default | Purpose |
|---|---|---|
| `BASE_URL` | `http://localhost:5173` | Web app URL |
| `SLOWMO` | `500` | Delay between browser actions in ms (headed only matters visibly) |
| `CI` | _unset_ | When set, enables `forbidOnly` and one retry |

Examples:

```bash
SLOWMO=1500 bun run test:headed       # slower demo pace
SLOWMO=0 bun test                     # fastest headless
BASE_URL=http://localhost:4173 bun test
```

## Test scenario

Single spec at [tests/services.spec.ts](./tests/services.spec.ts):

1. Log in as `user@cleandrop.io`
2. Verify services list renders, exercise search / status / category filters
3. Verify the `Add` button is hidden for non-admins
4. Log out
5. Log in as `admin@cleandrop.io`
6. Create a uniquely-named service via the modal
7. Edit that service (rename + change price)
8. Delete that service via the confirmation dialog

Each run uses `uniqueName()` so repeated runs do not collide.

## Credentials

Seeded by [apps/api/drizzle/seed.ts](../apps/api/drizzle/seed.ts):

- Admin — `admin@cleandrop.io` / `admin123`
- User — `user@cleandrop.io` / `user123`

> Note: the login page hint shows `.com` but the seed uses `.io`. The tests use `.io`.

## Troubleshooting

- **Browser not found** — run `bun run install:browsers`.
- **`Cannot find name 'process'`** — run `bun install` to pull `@types/node`.
- **Login fails / empty table** — re-seed: `bun run --filter api seed` from the repo root.
- **Port mismatch** — set `BASE_URL` if the web app runs somewhere other than `:5173`.
