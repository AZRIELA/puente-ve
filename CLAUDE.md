# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## What this is

**Puente VE** — a Spanish-language donation platform connecting donors with disaster-affected
families in Venezuela. Next.js 16 (App Router) + React 19, deployed on Vercel with a Turso
(libSQL) database and Vercel Blob for file uploads. UI copy is in Spanish; keep it that way.

Two domain entities drive everything:
- **Donation** — a donor's pledge (amount/currency/channel, optional proof image). Status flow:
  `pending → confirmed | rejected`.
- **Beneficiary** — a family requesting aid. Status flow: `pending → verified → helped`, or `rejected`.

Public pages let people donate (`/donar`), register as a beneficiary (`/beneficiario`), and view
the fund (`/fondo`). `/admin` is the review dashboard where staff approve/reject records.

## Commands

```bash
npm run dev          # dev server (localhost:3000)
npm run build        # production build (runs prebuild first — see gotcha below)
npm run start        # serve production build
npm run lint         # eslint
node scripts/setup-db.mjs   # create tables in the Turso/libSQL DB pointed to by DATABASE_URL
```

There is no test suite.

## Critical gotchas

**Prisma is NOT used at runtime.** Despite `prisma`, `@prisma/client`, and `prisma/schema.prisma`
being present, the app talks to the database exclusively through `@libsql/client` with **raw SQL**
in `src/lib/db.ts`. The Prisma schema is kept only as a data-model reference / migration artifact.
The `prebuild` script (`rm -rf src/lib/prisma.ts src/generated`) deletes any generated Prisma
client before building so it can never sneak into the bundle. **Do not import Prisma anywhere** —
add queries as raw SQL against `db.execute(...)`.

**Middleware lives in `src/proxy.ts`, not `middleware.ts`.** This Next.js version renamed the
middleware convention to `proxy.ts`, and the exported handler function must be named `proxy`
(or be a default export) — not `middleware`, or Turbopack fails the build. It still exports `config`. See AGENTS.md —
APIs differ from older Next.js; check `node_modules/next/dist/docs/` before writing Next-specific code.

**Auth is a demo placeholder, not real security.** Admin login (`src/app/login/page.tsx`) compares
against hardcoded credentials client-side and sets `sessionStorage['admin-auth']`; `/admin` only
checks that flag. The API routes under `/api/v1/*` are **completely unauthenticated**. There is a
separate site-wide gate in `proxy.ts` driven by `NEXT_PUBLIC_TEST_CODE` that redirects to
`/test-gate` unless a `test-access` cookie is set. Treat any auth work here as greenfield.

## Data layer conventions

`src/lib/db.ts` exports a single `db` client. `DATABASE_URL` selects the backend:
`libsql://...?authToken=...` for Turso (production) or a `file:` path for local SQLite (`dev.db`).

When writing SQL, follow the existing patterns:
- IDs are cuid2 strings generated in the route with `createId()` from `@paralleldrive/cuid2`.
- Booleans are stored as integers (`1`/`0`).
- Timestamps are ISO strings (`new Date().toISOString()`), set explicitly for `createdAt`/`updatedAt`.
- Table/column names are PascalCase/camelCase (e.g. `Donation`, `proofUrl`) — match `scripts/setup-db.mjs`,
  which is the source of truth for the actual schema (keep it in sync with `prisma/schema.prisma`).

## API structure

REST routes under `src/app/api/v1/`:
- `donations` / `beneficiaries` — `GET` (list, newest first) + `POST` (create, status `pending`).
- `donations/[id]` / `beneficiaries/[id]` — `PATCH` to change status (validated against the allowed set).
- `upload` — `POST` multipart; validates ≤5 MB and jpeg/png/webp/pdf, stores via `@vercel/blob`
  (`put(..., { access: 'public' })`), returns `{ url }`. Requires `BLOB_READ_WRITE_TOKEN`.

Route handlers are the async `params` style: `{ params }: { params: Promise<{ id: string }> }`,
then `await params`.

## UI / styling

- **Tailwind v4, CSS-first config** — there is no `tailwind.config.js`. All theme tokens live in
  `src/app/globals.css` under `@theme inline`. Custom semantic colors beyond stock shadcn:
  `success`, `warning`, `info` (used as `bg-success/15`, `text-warning`, etc.), plus Venezuela
  brand tokens. Dark navy is the default (and only) theme.
- **shadcn "base-nova" style built on `@base-ui/react`** (not Radix). Generated primitives live in
  `src/components/ui/`. Config in `components.json`; add components with the shadcn CLI.
- **Fonts** (loaded in `src/app/layout.tsx`, exposed as Tailwind families): `font-sans` (Geist),
  `font-display` (Barlow Condensed — headings), `font-score` (Bebas Neue — big numbers/KPIs),
  `font-mono` (Geist Mono).
- Path alias `@/*` → `src/*`. Shared non-ui components go in `src/components/shared/`.

## Environment variables

- `DATABASE_URL` — libSQL/Turso connection string (or `file:` path locally).
- `BLOB_READ_WRITE_TOKEN` — Vercel Blob (upload route).
- `NEXT_PUBLIC_TEST_CODE` — if set, enables the `/test-gate` access wall in `proxy.ts`.
