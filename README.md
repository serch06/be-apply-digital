# Apply Digital Backend Challenge

NestJS + PostgreSQL API built for the Apply Digital technical challenge. Includes product synchronization from Contentful, reporting endpoints, authentication, Docker setup, CI and a test suite with coverage.

🔗 **Demo video:** [Loom walkthrough](https://www.loom.com/share/0bc2b20248ec4e368b25fa300e57d51b?sid=e0db931c-85b9-42b2-94b3-a5da835a84ac)

---

## Project Overview

- **Stack:** NestJS, TypeORM, PostgreSQL, Swagger, Jest, Docker, GitHub Actions.
- **Features:**
  - JWT-secured auth module with seeded admin user.
  - Product module with pagination, filtering, soft delete, and Contentful sync (retry + timeout).
  - Reports module delivering deletion percentages, price stats, grouped metrics and filtered listings.
  - Scheduled task that retrieves the latest Product data from Contentful at regular one-hour intervals.
- **Infrastructure:** Docker Compose (API + Postgres), CI workflow running lint/test/coverage.

Repository layout:

```
be-apply-digital/
├── docker-compose.yml
├── .env.example
├── README.md
├── server/
│   ├── Dockerfile
│   ├── package.json
│   ├── jest.json
│   ├── src/
│   │   ├── auth/
│   │   ├── products/
│   │   ├── reports/
│   │   └── main.ts
│   └── test/
```

---

## Quick Start with Docker

1. **Clone & enter the repo**
   ```bash
   git clone https://github.com/<your-username>/be-apply-digital.git
   cd be-apply-digital
   ```

2. **Create environment file**
   ```bash
   cp server/.env.example server/.env
   # edit values: Contentful tokens, DB creds, JWT secret, etc.
   ```

3. **Launch services**
  ```bash
  docker compose up --build
  ```

   - API available at `http://localhost:${PORT}` (defaults to 3000)
   - PostgreSQL exposed on `localhost:${DATABASE_PORT}` (defaults to 5432)

4. **Open Swagger docs**
   - http://localhost:${PORT}/api/docs (defaults to `http://localhost:3000/api/docs`)

Stop containers with:
```bash
docker compose down
```

---

## Local Development (without Docker / BUT with PostgresSQL running)

1. **Install dependencies**
   ```bash
   npm install          # optional tooling at repo root
   cd server
   npm install          # Nest API dependencies
   ```

2. **Environment variables**
   ```bash
   cp ../.env.example .env
   # adjust DATABASE_* for your local Postgres instance
   ```

3. **Run the API**
   ```bash
   npm run start:dev
   ```

4. **Contentful sync**
   - Cron job runs hourly unless `DISABLE_CRON=true`.
   - Manual trigger: `POST /api/v1/products/sync` (requires JWT).

---

## Testing & Coverage

Inside `server/`:

```bash
npm run test       # unit tests
npm run test:cov   # coverage (>=30% statements enforced)
```

Report is generated under `server/coverage/`.

---

## Environment Variables

Reference `.env.example`. Key entries:

| Variable | Purpose |
| --- | --- |
| `PORT` | API port (default 3000) |
| `DATABASE_*` | Postgres connection settings |
| `CONTENTFUL_*` | Space, tokens, endpoints and retry/timeout tuning |
| `DISABLE_CRON` | Disable hourly Contentful sync when `true` |
| `JWT_SECRET`, `JWT_EXPIRES_IN` | Auth token configuration |

---

## Useful npm Scripts (run in `server/`)

| Script | Description |
| --- | --- |
| `npm run start:dev` | Start Nest in watch mode |
| `npm run build` | Compile to `dist/` |
| `npm run start:prod` | Run compiled app |
| `npm run lint` | ESLint checks |
| `npm run format` | Prettier formatting |
| `npm run test` / `npm run test:cov` | Jest tests & coverage |

---

## CI/CD

- GitHub Actions workflow (`.github/workflows/ci.yml`) runs lint, unit tests, and coverage on each push/PR.
- Enable branch protection to require passing CI before merging.

---

## Additional Notes

- A seed admin user is created automatically on startup:
  ```json
  {
    "email": "admin@email.com",
    "password": "admin123"
  }
  ```
- All the endpoints are JWT-protected (except the login).
- Product data mirrors Contentful; local deletions are soft Deletes.
- Retry/backoff values for Contentful requests are configurable via env vars.
