# StayFit Backend

## Overview

The StayFit backend is a Spring Boot REST API providing authentication, workout tracking, membership management, and health/progress logging for the StayFit application. It exposes a versioned JSON API under `/api/v1`, backed by PostgreSQL, with stateless JWT authentication and per-user data ownership enforced at the repository layer.

## Features

- **Authentication** — registration and login with BCrypt password hashing.
- **JWT authorization** — stateless, signed (HS256) bearer tokens validated on every protected request.
- **Health profile** — current weight/height, updatable without losing history.
- **Progress history** — paginated, append-only historical health snapshots.
- **Workout tracking** — full CRUD over a user's own workout sessions, paginated.
- **Membership plans** — seeded plans, subscription, cancellation, and membership history.
- **Membership lifecycle** — at most one active membership per user, with expiration reconciliation.
- **Ownership enforcement** — every protected endpoint operates only on the authenticated caller; no endpoint accepts another user's ID from the client.

## Tech Stack

- Java 25
- Spring Boot 4.1.0 (Spring Web MVC, Spring Data JPA, Spring Security, Bean Validation)
- Maven
- PostgreSQL 18
- JWT (`io.jsonwebtoken` / jjwt 0.12.6)
- Lombok

## Prerequisites

- JDK 25
- Maven 3.9+
- A running PostgreSQL 18 instance

## PostgreSQL Setup

Create the database and role yourself before running the app:

```sql
CREATE ROLE stayfit WITH LOGIN PASSWORD '<your-password>';
CREATE DATABASE stayfit_dev OWNER stayfit;
```

The application manages its own schema via Hibernate (`ddl-auto: update` under the `dev` profile) — no manual migrations are required. Do not point this app at any other database, and never commit real credentials.

## Environment Variables

The application is configured entirely through environment variables — no credentials are hard-coded anywhere in the codebase.

| Variable | Required | Default | Description |
|---|---|---|---|
| `DB_HOST` | Optional | `localhost` | PostgreSQL host |
| `DB_PORT` | Optional | `5432` | PostgreSQL port |
| `DB_NAME` | Optional | `stayfit_dev` | Database name |
| `DB_USERNAME` | Optional | `stayfit` | Database user |
| `DB_PASSWORD` | **Required** | *(none)* | Database password |
| `JWT_SECRET` | **Required** | *(none)* | Secret key used to sign JWTs (HS256) — use a long, random value |
| `JWT_EXPIRATION` | Optional | `86400000` (24h) | JWT validity in milliseconds |
| `SERVER_PORT` | Optional | `8080` | HTTP port the app listens on |
| `SPRING_PROFILES_ACTIVE` | Optional | `dev` | Active Spring profile |

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

## Running Backend

```bash
cd backend
mvn spring-boot:run
```

Verify it's up:

```
GET http://localhost:8080/api/v1/health
```

```json
{ "status": "UP", "service": "stayfit-backend" }
```

On first startup (`dev` profile), three membership plans (Basic, Standard, Premium) are seeded automatically if they don't already exist.

## Build

```bash
cd backend
mvn clean package
java -jar target/stayfit-backend-0.0.1-SNAPSHOT.jar
```

## Tests

```bash
cd backend
mvn clean test
```

Tests run as full integration tests against the same local `stayfit_dev` PostgreSQL database (same environment variables as above must be set) — there is no in-memory/mocked database. Each test class creates and cleans up its own users/records.

Currently verified result:

```
76 tests
76 passed
0 failed
0 skipped
```

## API Documentation

All endpoints are under `/api/v1`.

### Public

| Method | Path | Description |
|---|---|---|
| GET | `/health` | Service liveness check |
| POST | `/auth/register` | Create a new user account |
| POST | `/auth/login` | Authenticate and receive a JWT |
| GET | `/membership-plans` | List currently active membership plans |
| GET | `/membership-plans/{id}` | Get a single membership plan |

### Authentication

| Method | Path | Description |
|---|---|---|
| GET | `/auth/me` | Current authenticated user's profile |

### Health & Progress

| Method | Path | Description |
|---|---|---|
| GET | `/profile/health` | Your current weight/height |
| PUT | `/profile/health` | Update your weight/height (preserves history) |
| GET | `/progress` | Your historical health snapshots (paginated, newest first) |

### Workouts

| Method | Path | Description |
|---|---|---|
| POST | `/workouts` | Log a completed workout |
| GET | `/workouts` | List your workouts (paginated, newest first) |
| GET | `/workouts/{id}` | Get one of your workouts |
| PUT | `/workouts/{id}` | Update one of your workouts |
| DELETE | `/workouts/{id}` | Delete one of your workouts |

### Memberships

| Method | Path | Description |
|---|---|---|
| POST | `/memberships` | Subscribe to a membership plan |
| GET | `/memberships/current` | Your current active membership |
| GET | `/memberships` | Your membership history |
| POST | `/memberships/{id}/cancel` | Cancel one of your memberships |

All routes above except **Public** require `Authorization: Bearer <token>`.

Pagination (`/workouts`, `/progress`): `?page=0&size=10` — default size `10`, maximum size `50`.

## Authentication

1. `POST /auth/register` — email is normalized and must be unique; password is hashed with BCrypt before storage (the hash is never returned by any API).
2. `POST /auth/login` — verifies credentials and returns a signed JWT (`Bearer` token) plus the caller's safe profile.
3. Subsequent requests send `Authorization: Bearer <token>`. A `JwtAuthenticationFilter` validates the token's signature and expiry on every request and loads the corresponding user from the database.
4. Invalid, expired, or missing tokens on a protected endpoint return a consistent `401 Unauthorized` JSON body; wrong login credentials return a generic `401` that doesn't reveal whether the email or password was incorrect.
5. Sessions are stateless — no server-side session state, CSRF is disabled (appropriate for a token-based JSON API).

## Authorization & Ownership

The authenticated user's identity is derived exclusively from the validated JWT (never from a client-supplied ID). Every repository query for workouts, progress, health profile, and memberships is scoped to that user's ID. Attempting to access another user's resource returns `404 Not Found` rather than revealing that it exists.

## Health & Progress

`profile/health` holds the user's *current* weight/height and is updated in place. Every update to it also appends a new row to the progress history, so `/progress` always reflects the full historical timeline — no health value is ever silently lost or overwritten.

## Workouts

Full CRUD scoped to the authenticated user, with paginated listing (`/workouts?page=0&size=10`, newest first).

## Memberships

- **Seeded plans** — Basic, Standard, and Premium are seeded automatically on first startup (`dev` profile) if they don't already exist.
- **Subscription** — `POST /memberships` creates a new membership for the authenticated user against a chosen plan.
- **Active membership restriction** — a user may have at most one active membership at a time.
- **Cancellation** — `POST /memberships/{id}/cancel` ends a membership early.
- **History** — `GET /memberships` returns the caller's full membership history.
- **Expiration reconciliation** — memberships past their end date are reconciled to an expired state rather than remaining incorrectly "active".

## Database Model

```
users
├── workouts
├── progress_records
└── user_memberships
       └── membership_plans
```

## Project Structure

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

## Production Configuration

In production, set all environment variables listed above through the deployment platform's secret/config management — never commit them to source control. `SPRING_PROFILES_ACTIVE` should be set to a non-`dev` profile so the membership-plan seeder and other dev-only conveniences do not run; use a real migration strategy instead of relying on `ddl-auto`.

By default the backend has no CORS configuration. It expects to sit behind a reverse proxy that serves the frontend and backend from a single origin (see the [root README's Production Deployment section](../README.md#production-deployment)). If the frontend is deployed to a different origin, CORS must be explicitly configured here before that will work.

## Security Notes

- Passwords are hashed with BCrypt; plaintext passwords and hashes are never returned by any API response.
- JWTs are signed with HS256 using `JWT_SECRET` and expire after `JWT_EXPIRATION` milliseconds.
- Authentication is fully stateless — no server-side session state, no CSRF tokens (appropriate for a bearer-token JSON API).
- Every protected endpoint enforces per-user ownership at the repository layer; cross-user access attempts return `404 Not Found` instead of `403 Forbidden`, so resource existence is never leaked.
- All secrets (`DB_PASSWORD`, `JWT_SECRET`) are supplied via environment variables. No credentials are committed to Git.

## License

[License](../LICENSE)

[Frontend Documentation](../frontend/README.md)
