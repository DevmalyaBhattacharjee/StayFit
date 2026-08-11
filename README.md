# StayFit Backend

MVP backend for StayFit — user authentication, workout tracking, membership plans, and progress/health logging.

> **Status:** MVP feature-complete (Phases 1-6). Authentication, workout tracking, membership plans, and progress/health logging are all implemented and tested.

## Repository structure

This is a monorepo containing both the backend (documented here) and the frontend (documented in the [Frontend](#frontend) section below and in [`frontend/README.md`](frontend/README.md)):

```
StayFit/
├── backend/    Spring Boot API (this README)
├── frontend/   React + Vite app (frontend/README.md)
├── .gitignore
└── README.md
```

## Tech Stack

- Java 25
- Spring Boot 4.1.0 (Spring Web MVC, Spring Data JPA, Spring Security, Bean Validation)
- Maven
- PostgreSQL 18
- JWT (`io.jsonwebtoken` / jjwt 0.12.x)
- Lombok

## Prerequisites

- JDK 25
- Maven 3.9+
- A running PostgreSQL 18 instance

## Database setup

Create the database and role yourself before running the app:

```sql
CREATE ROLE stayfit WITH LOGIN PASSWORD 'your-password';
CREATE DATABASE stayfit_dev OWNER stayfit;
```

The application manages its own schema via Hibernate (`ddl-auto: update` under the `dev` profile) — no manual migrations are required. Do not point this app at any other database.

## Configuration

The application is configured entirely through environment variables — no credentials are hard-coded anywhere in the codebase.

| Variable | Description | Default |
|---|---|---|
| `DB_HOST` | PostgreSQL host | `localhost` |
| `DB_PORT` | PostgreSQL port | `5432` |
| `DB_NAME` | Database name | `stayfit_dev` |
| `DB_USERNAME` | Database user | `stayfit` |
| `DB_PASSWORD` | Database password | *(required, no default)* |
| `JWT_SECRET` | Secret key used to sign JWTs (HS256) — use a long, random value | *(required, no default)* |
| `JWT_EXPIRATION` | JWT validity in milliseconds | `86400000` (24h) |
| `SERVER_PORT` | HTTP port the app listens on | `8080` |
| `SPRING_PROFILES_ACTIVE` | Active Spring profile | `dev` |

Set the environment variables before running the app (PowerShell example — replace the placeholders with your own values, do not reuse these examples):

```powershell
$env:DB_HOST = "localhost"
$env:DB_PORT = "5432"
$env:DB_NAME = "stayfit_dev"
$env:DB_USERNAME = "stayfit"
$env:DB_PASSWORD = "<your-password>"
$env:JWT_SECRET = "<your-secret>"
$env:JWT_EXPIRATION = "86400000"
```

## Running the app

```bash
cd backend
mvn spring-boot:run
```

Or build a jar and run it:

```bash
cd backend
mvn clean package
java -jar target/stayfit-backend-0.0.1-SNAPSHOT.jar
```

Verify it's up:

```
GET http://localhost:8080/api/v1/health
```

```json
{ "status": "UP", "service": "stayfit-backend" }
```

On first startup (dev profile), three membership plans (Basic, Standard, Premium) are seeded automatically if they don't already exist.

## Running tests

```bash
cd backend
mvn clean test
```

Tests run as full integration tests against the same local `stayfit_dev` PostgreSQL database (same environment variables as above must be set) — there is no in-memory/mocked database. Each test class creates and cleans up its own users/records.

## API overview

All endpoints are under `/api/v1`.

**Public** (no authentication required):

| Method | Path | Description |
|---|---|---|
| GET | `/health` | Service liveness check |
| POST | `/auth/register` | Create a new user account |
| POST | `/auth/login` | Authenticate and receive a JWT |
| GET | `/membership-plans` | List currently active membership plans |
| GET | `/membership-plans/{id}` | Get a single membership plan |

**Protected** (require `Authorization: Bearer <token>`):

| Method | Path | Description |
|---|---|---|
| GET | `/auth/me` | Current authenticated user's profile |
| POST | `/workouts` | Log a completed workout |
| GET | `/workouts` | List your workouts (paginated, newest first) |
| GET | `/workouts/{id}` | Get one of your workouts |
| PUT | `/workouts/{id}` | Update one of your workouts |
| DELETE | `/workouts/{id}` | Delete one of your workouts |
| GET | `/profile/health` | Your current weight/height |
| PUT | `/profile/health` | Update your weight/height (preserves history) |
| GET | `/progress` | Your historical health snapshots (paginated, newest first) |
| POST | `/memberships` | Subscribe to a membership plan |
| GET | `/memberships/current` | Your current active membership |
| GET | `/memberships` | Your membership history |
| POST | `/memberships/{id}/cancel` | Cancel one of your memberships |

Every protected endpoint operates only on the authenticated caller — no endpoint accepts another user's ID from the client. Attempting to access another user's resource returns `404 Not Found` rather than revealing that it exists.

Pagination (`/workouts`, `/progress`): `?page=0&size=10` — default size `10`, maximum size `50`.

## Authentication flow

1. `POST /auth/register` — email is normalized and must be unique; password is hashed with BCrypt before storage (the hash is never returned by any API).
2. `POST /auth/login` — verifies credentials and returns a signed JWT (`Bearer` token) plus the caller's safe profile.
3. Subsequent requests send `Authorization: Bearer <token>`. A `JwtAuthenticationFilter` validates the token's signature and expiry on every request and loads the corresponding user from the database.
4. Invalid, expired, or missing tokens on a protected endpoint return a consistent `401 Unauthorized` JSON body; wrong login credentials return a generic `401` that doesn't reveal whether the email or password was incorrect.
5. Sessions are stateless — no server-side session state, CSRF is disabled (appropriate for a token-based JSON API).

## Main MVP features

- **User authentication** — registration, login, JWT-based stateless auth.
- **Workout tracking** — CRUD over a user's own completed workout sessions.
- **Membership plans** — browse plans, subscribe, view current/history, cancel; at most one active membership per user.
- **Progress & health logging** — update current weight/height while automatically preserving the full historical timeline (no health value is ever silently lost).

## Project structure

The backend lives under `backend/` (the frontend lives alongside it under `frontend/` — see the [Frontend](#frontend) section below):

```
backend/
  pom.xml
  src/main/java/com/stayfit/backend/
    config/       application-level beans (dev-only membership plan seeder)
    controller/   REST controllers
    dto/          request/response DTOs (entities are never exposed over the API)
    entity/       JPA entities
    exception/    global exception handling (consistent ApiError JSON shape)
    repository/   Spring Data JPA repositories
    security/     JWT auth, Spring Security configuration
    service/      business logic
    StayFitApplication.java
  src/main/resources/
    application.yml       base configuration (env-var driven)
    application-dev.yml   local development overrides (active by default)
  src/test/java/...       integration and unit tests
```

## Frontend

The `frontend/` directory contains the StayFit React + TypeScript + Vite frontend (see [`frontend/README.md`](frontend/README.md) for local setup, scripts, and project structure). This section covers the frontend's production API configuration and deployment architecture.

### Development

In development, the frontend never talks to the backend directly. `npm run dev` starts a Vite dev server that proxies any `/api/*` request to the backend (`VITE_API_PROXY_TARGET`, default `http://localhost:8080`), so the browser only ever sees same-origin requests. This is why the backend has no CORS configuration — none is needed for local development.

### Production API configuration

The frontend reads its API base URL from a single build-time environment variable:

| Variable | Example | Notes |
|---|---|---|
| `VITE_API_BASE_URL` | `/api/v1` (default) or `https://api.your-domain.com/api/v1` | Read at build time via Vite; baked into the static JS bundle. Never contains a secret. |

This is a Vite build-time variable, not a runtime one — it must be set correctly *before* running `npm run build` for the environment that build will be deployed to.

### Deployment architecture (choose one)

**Option A — Reverse proxy, single origin (recommended; requires no backend changes).**
Deploy the static frontend build (`frontend/dist/`) and the backend behind a reverse proxy (nginx, Caddy, a cloud load balancer, or your platform's rewrite rules) on one origin, routing `/api/*` to the backend and everything else to the static files — the same shape the Vite dev proxy already emulates locally. `VITE_API_BASE_URL` stays as the relative default (`/api/v1`); no backend code changes are required. Example nginx shape:

```nginx
location /api/ {
    proxy_pass http://backend:8080;
}
location / {
    root /path/to/frontend/dist;
    try_files $uri /index.html;
}
```

**Option B — Separate origins (requires a backend change).**
If the frontend and backend are deployed to different origins (e.g., frontend on a static host, backend on its own domain), set `VITE_API_BASE_URL` to the backend's full URL before building. This requires the backend to send CORS headers for the frontend's origin, which it currently does **not** do — Spring Security has no CORS configuration in this codebase. Enabling this option requires a backend code change and is outside the frontend's scope; it should be a deliberate decision made when the deployment target is known, not assumed.

Do not deploy with an absolute `VITE_API_BASE_URL` pointing at a different origin than the frontend without first implementing Option B — requests will fail in the browser with CORS errors even though the build succeeds.
