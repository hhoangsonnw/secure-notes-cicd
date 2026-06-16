# Secure Notes API CI/CD Lab

[![Secure Notes API CI](https://github.com/hhoangsonnw/secure-notes-cicd/actions/workflows/ci.yml/badge.svg)](https://github.com/hhoangsonnw/secure-notes-cicd/actions/workflows/ci.yml)
[![Security Scanning](https://github.com/hhoangsonnw/secure-notes-cicd/actions/workflows/security.yml/badge.svg)](https://github.com/hhoangsonnw/secure-notes-cicd/actions/workflows/security.yml)
[![Publish Docker Image](https://github.com/hhoangsonnw/secure-notes-cicd/actions/workflows/publish-image.yml/badge.svg)](https://github.com/hhoangsonnw/secure-notes-cicd/actions/workflows/publish-image.yml)

Secure Notes API is a compact DevSecOps lab built with Node.js, Express, SQLite, Docker, and GitHub Actions.

It provides a JWT-protected notes API and demonstrates a complete CI/CD flow with linting, automated tests, dependency auditing, secret scanning, vulnerability scanning, Docker image publishing, and staging deployment simulation.

## Features

- User registration and login
- Password hashing with bcrypt
- JWT authentication for private routes
- Notes CRUD scoped to the authenticated user
- Input validation for users and notes
- Security headers with Helmet
- API rate limiting
- SQLite persistence with `better-sqlite3`
- Docker and Docker Compose support
- GitHub Actions workflows for CI, security scanning, image publishing, and staging smoke tests

## Tech Stack

| Area | Tools |
| --- | --- |
| API | Node.js, Express |
| Database | SQLite, better-sqlite3 |
| Auth | bcryptjs, jsonwebtoken |
| Security | Helmet, express-rate-limit, Gitleaks, Trivy |
| Testing | Jest, Supertest |
| Delivery | Docker, Docker Compose, GitHub Actions, GitHub Container Registry |

## API Endpoints

| Method | Endpoint | Auth | Description |
| --- | --- | --- | --- |
| `GET` | `/` | No | API status |
| `GET` | `/health` | No | Health check |
| `POST` | `/api/auth/register` | No | Create a user |
| `POST` | `/api/auth/login` | No | Log in and receive a JWT |
| `GET` | `/api/auth/me` | Yes | Get the current user |
| `POST` | `/api/notes` | Yes | Create a note |
| `GET` | `/api/notes` | Yes | List current user's notes |
| `GET` | `/api/notes/:id` | Yes | Get one note |
| `PUT` | `/api/notes/:id` | Yes | Update one note |
| `DELETE` | `/api/notes/:id` | Yes | Delete one note |

Authenticated requests must include:

```http
Authorization: Bearer <token>
```

## Getting Started

### Prerequisites

- Node.js 20+
- npm
- Docker and Docker Compose, optional for container runs

### Run Locally

```bash
npm install
cp .env.example .env
npm run dev
```

The API runs on `http://localhost:3000` by default.

Check the health endpoint:

```bash
curl http://localhost:3000/health
```

### Environment Variables

| Variable | Default | Description |
| --- | --- | --- |
| `PORT` | `3000` | API port |
| `NODE_ENV` | `development` | Runtime environment |
| `JWT_SECRET` | Required | Secret used to sign JWTs |
| `JWT_EXPIRES_IN` | `1h` | JWT expiration time |
| `DB_FILE` | `./data/secure_notes.sqlite` | SQLite database path |

## Development Commands

```bash
npm test          # Run Jest tests
npm run lint      # Run ESLint
npm run audit     # Run npm audit for high severity issues
npm run check     # Run lint and tests
```

## Docker

Build and run with Docker Compose:

```bash
docker compose up -d --build
curl http://localhost:3000/health
docker compose down
```

Build the image manually:

```bash
docker build -t secure-notes-api:local .
```

Run the image manually:

```bash
docker run --rm -p 3000:3000 \
  -e JWT_SECRET=local-docker-dev-secret-change-me \
  secure-notes-api:local
```

## Published Image

The project publishes Docker images to GitHub Container Registry:

```text
ghcr.io/hhoangsonnw/secure-notes-api:latest
ghcr.io/hhoangsonnw/secure-notes-api:sha-<short-sha>
```

Pull and run the latest image:

```bash
docker pull ghcr.io/hhoangsonnw/secure-notes-api:latest

docker run --rm -p 3000:3000 \
  -e JWT_SECRET=local-ghcr-test-secret \
  -e JWT_EXPIRES_IN=1h \
  -e DB_FILE=/app/data/local_ghcr_test.sqlite \
  ghcr.io/hhoangsonnw/secure-notes-api:latest
```

## CI/CD

GitHub Actions workflows included in this repository:

| Workflow | Purpose |
| --- | --- |
| `ci.yml` | Runs linting, tests, dependency audit, Docker build, and Docker smoke test |
| `security.yml` | Runs Gitleaks secret scanning and Trivy filesystem/image vulnerability scans |
| `publish-image.yml` | Builds and publishes Docker images to GHCR |
| `deploy-staging.yml` | Pulls the published image and runs a staging health/API smoke test |

Pipeline flow:

```text
Push or pull request
  -> lint, tests, audit
  -> Docker build and smoke test
  -> secret and vulnerability scans
  -> publish image on main
  -> staging deployment simulation
```

## Security Controls

- Passwords are stored as bcrypt hashes.
- Private routes require JWT authentication.
- Notes are always queried by `user_id` to prevent cross-user access.
- Request input is validated and normalized.
- Helmet adds common HTTP security headers.
- Rate limiting reduces repeated-request abuse.
- Runtime configuration is loaded through environment variables.
- The Docker container runs as the non-root `node` user.
- CI includes Gitleaks and Trivy scans.

## Project Structure

```text
src/
  app.js                     # Express app setup
  server.js                  # Runtime entry point
  db/database.js             # SQLite initialization
  middleware/auth.middleware.js
  routes/auth.routes.js
  routes/notes.routes.js
  utils/validation.js
tests/                       # Jest and Supertest coverage
.github/workflows/           # CI/CD and security workflows
Dockerfile
docker-compose.yml
```

## Roadmap

- Add OpenAPI/Swagger documentation
- Add refresh tokens
- Add database migrations
- Enforce stricter vulnerability scan gates
- Add branch protection rules
- Deploy to a real cloud environment

## License

MIT
