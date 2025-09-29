# Apply Digital Backend Challenge

This project implements a **NestJS API** with **PostgreSQL** following the challenge requirements.  
It includes public and private endpoints, integration with Contentful, Swagger documentation, and Docker setup.

---

## 📦 Project Structure

```
be-apply-digital/
│── docker-compose.yml       # Orchestrates API + DB
│── .env                     # Environment variables for docker-compose
│── .gitignore
│── README.md                # This file
│
├── server/                  # NestJS API source code
│   ├── Dockerfile
│   ├── package.json         # API dependencies
│   ├── tsconfig*.json
│   ├── nest-cli.json
│   ├── .env                 # Local env vars for development only
│   ├── src/                 # Source code
│   ├── test/                # Tests
│   └── dist/                # Build output (gitignored)
```

---

## 🚀 Run with Docker (recommended)

### 1. Clone the repo
```bash
git clone https://github.com/<your-username>/be-apply-digital.git
cd be-apply-digital
```

### 2. Create a `.env` file in the root
Example:

```env
# Server
PORT=3000

# Database
DATABASE_HOST=db
DATABASE_PORT=5432
DATABASE_USER=postgres
DATABASE_PASSWORD=postgres
DATABASE_NAME=products_db

# Contentful
CONTENTFUL_SPACE_ID=xxxx
CONTENTFUL_ACCESS_TOKEN=xxxx
CONTENTFUL_ENVIRONMENT=master
CONTENTFUL_CONTENT_TYPE=product

# JWT
JWT_SECRET=supersecret
```

### 3. Build and run services
```bash
docker compose up --build
```

This will start:
- API at `http://localhost:3000`
- PostgreSQL on `localhost:5433`

### 4. Access Swagger docs
👉 [http://localhost:3000/api/docs](http://localhost:3000/api/docs)

---

## ⚡ Run locally (without Docker)

### 1. Install dependencies
At the root (tooling only):
```bash
npm install
```

Inside `/server`:
```bash
cd server
npm install
```

### 2. Environment variables
Create `server/.env` with the same configuration as root `.env`, but pointing to your local DB.

### 3. Run in dev mode
```bash
npm run start:dev
```

---

## 🧪 Tests

Inside `/server`:
```bash
npm run test
npm run test:cov
```

---

## 🐶 Prettier + Lint-Staged

- The root includes configuration for **Prettier**, **Husky**, and **lint-staged**.  
- Every commit will automatically format staged files.  

---

## 🔒 Modules

- **Public module**  
  - `GET /products`: Paginated results (5 per page), filterable by name, category, price range.  
  - `DELETE /products/:id`: Mark product as deleted (it won’t reappear on restart).  

- **Private module (JWT required)**  
  - `GET /reports/deleted-percentage`: Percentage of deleted products.  
  - `GET /reports/non-deleted-percentage`: Percentage of non-deleted products, filterable by price or date range.  
  - `GET /reports/custom`: Custom report of choice.  

JWT authentication must be sent in the `Authorization` header:  
```
Authorization: Bearer <token>
```

---

## ⚠️ Notes

- If using `docker compose` results in a permissions error (`Permission denied` on `/var/run/docker.sock`), make sure your user belongs to the `docker` group:
  ```bash
  sudo usermod -aG docker $USER
  newgrp docker
  ```
  Or run with `sudo docker compose up`.

- `dist/`, `node_modules/` and `.env` are ignored in git.  

http://localhost:3000/api/docs#/