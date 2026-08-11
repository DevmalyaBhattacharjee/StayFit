# StayFit Backend

MVP backend for StayFit — user authentication, workout tracking, membership plans, and progress logging.

> **Status:** Phase 1 (project foundation) only. No business features are implemented yet.

## Tech Stack

- Java 25
- Spring Boot 4.1.0 (Spring Web MVC, Spring Data JPA, Spring Security, Bean Validation)
- Maven
- PostgreSQL 18
- Lombok

## Prerequisites

- JDK 25
- Maven 3.9+
- A running PostgreSQL 18 instance

## Configuration

The application is configured entirely through environment variables — no credentials are hard-coded.

| Variable | Description | Default |
|---|---|---|
| `DB_HOST` | PostgreSQL host | `localhost` |
| `DB_PORT` | PostgreSQL port | `5432` |
| `DB_NAME` | Database name | `stayfit_dev` |
| `DB_USERNAME` | Database user | `stayfit` |
| `DB_PASSWORD` | Database password | *(required, no default)* |
| `SERVER_PORT` | HTTP port the app listens on | `8080` |
| `SPRING_PROFILES_ACTIVE` | Active Spring profile | `dev` |

Before running the app, create the database and role yourself, e.g.:

```sql
CREATE ROLE stayfit WITH LOGIN PASSWORD 'your-password';
CREATE DATABASE stayfit_dev OWNER stayfit;
```

Then set the environment variables (PowerShell example):

```powershell
$env:DB_HOST = "localhost"
$env:DB_PORT = "5432"
$env:DB_NAME = "stayfit_dev"
$env:DB_USERNAME = "stayfit"
$env:DB_PASSWORD = "your-password"
```

## Running the app

```bash
mvn spring-boot:run
```

Or build a jar and run it:

```bash
mvn clean package
java -jar target/stayfit-backend-0.0.1-SNAPSHOT.jar
```

## Verifying it's up

```
GET http://localhost:8080/api/v1/health
```

Returns:

```json
{ "status": "UP", "service": "stayfit-backend" }
```

## Project structure

```
src/main/java/com/stayfit/backend/
  config/       application-level configuration beans (empty for now)
  controller/   REST controllers
  dto/          request/response DTOs
  entity/       JPA entities (empty for now)
  exception/    global exception handling (empty for now)
  repository/   Spring Data JPA repositories (empty for now)
  security/     security configuration (JWT auth added in a later phase)
  service/      business logic (empty for now)
  StayFitApplication.java
src/main/resources/
  application.yml       base configuration (env-var driven)
  application-dev.yml   local development overrides (active by default)
src/test/java/...       tests
```

## Notes

- Security is currently wide open (`permitAll`) as a placeholder — JWT authentication and authorization rules are added in a later phase.
- `spring.jpa.hibernate.ddl-auto` is `none` by default and `update` under the `dev` profile, for local convenience only.
