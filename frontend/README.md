# StayFit Frontend

## Overview

This is the React + TypeScript frontend for StayFit, built with Vite. It provides the user-facing interface for authentication, dashboard, health/progress tracking, workout logging, and membership management, talking to the [StayFit backend](../backend/README.md) over its REST API.

## Features

- Authentication (login/register) with token-based session handling
- Protected routes that redirect unauthenticated users
- Dashboard overview
- Health profile management
- Progress timeline (historical health snapshots)
- Workout tracking (create, view, edit, delete)
- Membership management (browse plans, subscribe, cancel, view history)
- User profile page
- Responsive navigation (desktop sidebar, mobile nav)
- Loading, error, and empty states across data-driven pages

## Tech Stack

- React 19 + TypeScript
- Vite (build tool and dev server)
- React Router (client-side routing)
- Tailwind CSS v4 (via `@tailwindcss/vite`) + Radix UI primitives (`react-avatar`, `react-dialog`, `react-label`, `react-select`, `react-slot`)
- Axios (single shared HTTP client)
- `class-variance-authority`, `clsx`, `tailwind-merge` (styling utilities)
- `lucide-react` (icons)
- oxlint (linting)

## Prerequisites

- Node.js 20+
- npm

## Installation

```bash
cd frontend
npm install
cp .env.example .env   # adjust if your backend runs somewhere other than localhost:8080
```

## Running the App

```bash
npm run dev
```

The dev server runs at `http://localhost:5173`. It proxies `/api/*` requests to the backend (see [Environment Variables](#environment-variables) below), so no backend CORS configuration is needed in development. A running instance of the [StayFit backend](../backend/README.md) is required.

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the Vite dev server with the `/api` proxy |
| `npm run build` | Type-check (`tsc -b`) and produce a production build in `dist/` |
| `npm run preview` | Serve the production build locally |
| `npm run lint` | Run oxlint |

## Environment Variables

Copy `.env.example` to `.env` and adjust as needed.

| Variable | Used by | Purpose |
|---|---|---|
| `VITE_API_BASE_URL` | The app itself (bundled into the build) | Base URL the Axios client sends requests to |
| `VITE_API_PROXY_TARGET` | `vite.config.ts`, dev server only | Where the dev server's `/api` proxy forwards to |

Never commit `.env` — it's gitignored. `.env.example` contains safe placeholders only. See the [root README's Production Deployment section](../README.md#production-deployment) for how these variables factor into deployment.

## Project Structure

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

## License

[License](../LICENSE)

[Backend Documentation](../backend/README.md)
