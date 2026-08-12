# StayFit

A full-stack personal health and fitness tracking application.

## Overview

StayFit is a full-stack personal health and fitness tracking application built with a React + TypeScript frontend and a Spring Boot REST backend, backed by PostgreSQL. It provides JWT-based authentication, health/progress tracking, workout tracking, and membership management for individual users.

## MVP Features

### Authentication
- Registration
- Login
- JWT authentication
- BCrypt password hashing

### Health & Progress
- Current health profile
- Historical health tracking

### Workouts
- Workout CRUD
- Workout history
- Pagination

### Membership
- Membership plans
- Subscription
- Cancellation
- Membership history

### Dashboard & Profile
- Dashboard
- Profile
- Responsive UI

## Architecture

```
Browser
  ↓
React Frontend
  ↓ REST API
Spring Boot Backend
  ↓
PostgreSQL
```

All requests to protected resources carry a JWT bearer token; the backend validates it on every request and scopes all data access to the authenticated user.

## Tech Stack

### Frontend
React, TypeScript, Vite, Tailwind CSS, Radix UI, Axios, React Router

### Backend
Java, Spring Boot, Spring Security, Spring Data JPA, PostgreSQL, Maven, JJWT, BCrypt, Lombok

## Repository Structure

```
StayFit/
├── backend/
│   ├── pom.xml
│   ├── src/
│   └── README.md
├── frontend/
│   ├── package.json
│   ├── src/
│   └── README.md
├── .github/
├── .claude/
├── .idea/
├── .gitignore
├── LICENSE
└── README.md
```

## Quick Start

**Backend:**

```bash
cd backend
mvn spring-boot:run
```

**Frontend:**

```bash
cd frontend
npm install
npm run dev
```

PostgreSQL must be running and configured (database, role, environment variables) before starting the backend.

For full setup details, see:

- [Backend Documentation](backend/README.md)
- [Frontend Documentation](frontend/README.md)

## Local Development Architecture

```
Browser
  ↓
Vite development server
  ↓ /api/*
Spring Boot
  ↓
PostgreSQL
```

The Vite dev server proxies `/api/*` requests to the backend, so the browser only ever sees same-origin requests during local development. This proxy is a development-only convenience.

## Production Deployment

The project documentation recommends a single-origin reverse-proxy architecture:

```
Reverse Proxy
├── frontend static files
└── /api/* → Spring Boot backend
                  ↓
              PostgreSQL
```

Serving the frontend and backend from a single origin behind a reverse proxy requires no backend changes. Deploying them to separate origins instead requires explicit backend CORS configuration, which is not enabled by default.

See [Backend Documentation](backend/README.md) and [Frontend Documentation](frontend/README.md) for detailed configuration.

## Security

- JWT-based stateless authentication
- BCrypt password hashing
- Repository-level ownership enforcement on every protected resource
- Configuration and secrets supplied via environment variables
- No credentials committed to Git

## Project Status

```
Backend MVP — Complete
Frontend MVP — Complete
Deployment readiness — Complete
```

Backend test suite: **76/76 tests passing**

## Documentation

- Backend → [backend/README.md](backend/README.md)
- Frontend → [frontend/README.md](frontend/README.md)

## License

[License](LICENSE)
