# StayFit Frontend

React + TypeScript + Vite frontend for the StayFit MVP — authentication, dashboard, health/progress tracking, workouts, and membership management against the [StayFit backend](../README.md).

## Tech stack

- React 19, TypeScript, Vite
- React Router (client-side routing)
- Tailwind CSS v4 + Radix UI primitives
- Axios (single shared client — see `src/lib/api-client.ts`)

## Prerequisites

- Node.js 20+
- A running instance of the [StayFit backend](../README.md) (see its README for setup)

## Setup

```bash
npm install
cp .env.example .env   # adjust if your backend runs somewhere other than localhost:8080
npm run dev
```

The dev server runs at `http://localhost:5173`. It proxies `/api/*` requests to the backend (see [Environment variables](#environment-variables) below), so no backend CORS configuration is needed in development.

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the Vite dev server with the `/api` proxy |
| `npm run build` | Type-check (`tsc -b`) and produce a production build in `dist/` |
| `npm run preview` | Serve the production build locally |
| `npm run lint` | Run oxlint |

## Environment variables

Copy `.env.example` to `.env` and adjust as needed. See the root [README's Frontend section](../README.md#frontend) for the full explanation of these variables and the production deployment architecture they imply.

| Variable | Used by | Purpose |
|---|---|---|
| `VITE_API_BASE_URL` | The app itself (bundled into the build) | Base URL the Axios client sends requests to |
| `VITE_API_PROXY_TARGET` | `vite.config.ts`, dev server only | Where the dev server's `/api` proxy forwards to |

Never commit `.env` — it's gitignored. `.env.example` contains safe placeholders only.

## Project structure

```
src/
  api/            one module per backend resource (auth, health, progress, workout, membership)
  components/
    ui/           base primitives (Button, Card, Dialog, Input, Select, …)
    common/       shared page-level building blocks (PageHeader, EmptyState, ErrorState, …)
    layout/       app shell, sidebar, mobile nav
    dashboard/, health/, progress/, workouts/, membership/
                  feature-specific components
  contexts/       AuthContext (the only auth mechanism — do not add another)
  hooks/          use-async-data (fetch-on-mount + refetch, used by every page)
  lib/            api-client (the one shared Axios instance), token-storage, formatting helpers
  pages/          one component per route
  routes/         route table + ProtectedRoute guard
  types/          TypeScript types mirrored from the actual backend DTOs
```
