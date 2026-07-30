# hoaxify

A Twitter-like API (users post short "hoaxes") built with Express, TypeScript, Drizzle ORM and a hexagonal/clean architecture. This is a learning project, not intended for production deployment.

## Tech stack

- **Runtime**: Node.js, TypeScript (strict mode)
- **HTTP**: Express 5
- **Database**: PostgreSQL via [Drizzle ORM](https://orm.drizzle.team/)
- **Validation**: [Zod](https://zod.dev/)
- **Error handling**: [neverthrow](https://github.com/supermacro/neverthrow) (`Result`/`ResultAsync`, no thrown domain exceptions)
- **Dependency injection**: [tsyringe](https://github.com/microsoft/tsyringe)
- **Auth**: JWT access/refresh tokens, bcrypt password hashing
- **Tests**: Jest + Supertest (unit and integration)

## Architecture

The code is organized by module (`src/modules/*`), each following the same hexagonal layout:

```
modules/<name>/
  domain/          # types, repository interfaces, domain error types
  use-cases/       # application logic, orchestrates domain + infrastructure
  presentation/    # Express controllers, routes, request validators
  infrastructure/  # concrete repository implementations (Drizzle)
```

Use cases depend on repository *interfaces*, not concrete implementations — the concrete class is wired up in `src/composition-root.ts` via `tsyringe`. This keeps business logic free of framework/DB details and easy to unit test with mocks.

Cross-cutting concerns live under `src/core` (config, DI tokens, domain/HTTP error types) and `src/infrastructure` (DB connection, JWT/password services). Express middlewares live in `src/middlewares`.

Errors are modeled as typed values, not thrown exceptions: every use case returns a `ResultAsync<T, SomeError>`, and `mapErrorToHttp` (`src/core/errors/http/error-response.mapper.ts`) is the single place that turns a domain error into an HTTP status + body.

## Getting started

### Prerequisites

- Node.js
- Docker (for a local Postgres instance)

### Setup

```bash
npm install
cp .env.example .env
# edit .env: set ACCESS_SECRET / REFRESH_SECRET to two different random
# strings of at least 32 characters each (e.g. `openssl rand -hex 32`)

docker compose up -d
npm run db:push

npm run dev
```

The API is served under `/api/1.0`, e.g. `http://localhost:8000/api/1.0`.

### Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the server with hot reload |
| `npm run build` | Type-check and compile to `dist/` |
| `npm start` | Run the compiled build (`dist/index.js`) |
| `npm run test:unit` | Run unit tests (`*.unit.spec.ts`), watch mode |
| `npm run test:integration` | Run integration tests (`*.integration.spec.ts`) against the local Postgres, watch mode |
| `npm run db:push` | Push the current Drizzle schema to the database |
| `npm run db:studio` | Open Drizzle Studio |
| `npm run lint` / `lint:fix` | Lint (and optionally auto-fix) |
| `npm run format` | Format with Prettier |

Integration tests hit a real database (same `DATABASE_URL` as the app) and clean relevant tables between tests — don't point `DATABASE_URL` at anything you care about while running them.

## API

All routes are prefixed with `/api/1.0`.

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/auth/signup` | – | Create an account (`username`, `email`, `password`) |
| POST | `/auth/login` | – | Log in, returns an access token + sets a `refreshToken` httpOnly cookie |
| GET | `/auth/me` | Bearer | Return the current authenticated user |
| POST | `/auth/refresh` | Cookie | Rotate the refresh token, returns a new access token |
| POST | `/auth/logout` | Cookie | Revoke the current refresh token |
| POST | `/hoaxes` | Bearer | Create a hoax for the authenticated user |

**Authentication model**: short-lived JWT access token (15m) passed as `Authorization: Bearer <token>`, and a longer-lived refresh token (7d) stored in an `httpOnly`/`sameSite=strict` cookie. Refresh tokens are tracked in the database (rotated on every use, with reuse detection) so a session can actually be revoked — see `src/modules/auth/use-cases/refresh-token.use-case.ts` for the details.

## Project status

Auth (signup/login/me/refresh/logout) is implemented and has been through a dedicated security-hardening pass (rate limiting, timing-attack-safe login, sanitized error responses, `helmet`, hardened JWT/cookie handling). The `hoax` module is in progress — hoax creation is implemented; listing, pagination, deletion and attachments are still to come.

Not addressed yet, tracked for later: account activation via email, password reset, a unique constraint on `username`, versioned DB migrations (currently `drizzle-kit push` only), structured logging.