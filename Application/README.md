# Movie Catalog (Backend + Frontend)

This repository contains a simple demo Movie Catalog application with a NestJS backend and a Next.js frontend.
The project is intentionally small and designed to demonstrate authentication, simple token-based API protection, pagination, search, and a small seed dataset.

---

## Table of Contents

- Project Overview
- Requirements
- Backend
  - Install
  - Seed database
  - Run (dev / production)
  - API token and JWT
  - Pagination and search
  - Protected endpoints
- Frontend
  - Install
  - Default user
  - Run (dev)
- Modules and Features
- Useful commands
- Example requests

---

## Project Overview

- Backend: NestJS + TypeORM with SQLite (located in `Server/`).
- Frontend: Next.js (React) application (located in `FrontEnd/`). Uses Tailwind CSS for styling.
- The backend provides REST endpoints for `movies`, `actors`, and `ratings`, plus a minimal `auth` service that issues JWTs.
- Some endpoints (create/update/delete) are protected by an API token guard; all non-public endpoints are protected by a JWT guard at the app level.

---

## Requirements

- Node.js (v18+ recommended)
- npm (bundled with Node) or yarn

---

## Backend (Server)

Location: `Server/`

### 1) Install dependencies

```bash
cd Server
npm install
```

### 2) Seed the database

The project includes a seeding script that creates sample movies, actors and ratings into a SQLite database.

```bash
# from Server/
npm run seed
```

This will create `Server/data/database.sqlite` (and the `data/` folder if missing) and populate it with ~10 movies, actors, and ratings.

### 3) Run the backend

Development (watch mode):

```bash
npm run start:dev
```

Production build + run:

```bash
npm run build
npm start
```

By default the Nest server listens on port `3000` (standard Nest defaults). API endpoints are available under `/` (e.g. `http://localhost:3000/movies`).

### JWT secret

The backend uses a simple JWT implementation (see `Server/src/auth/auth.service.ts`). The signing secret defaults to:

```
demo-jwt-secret
```

You can override it by setting the environment variable `JWT_SECRET` before running the server.

### API token (for administrative endpoints)

Some create/update/delete endpoints require a static API token. The token is configured in `Server/src/common/guards/api-token.guard.ts` and defaults to:

```
demo-supersecret-token
```

You can provide this token in either:
- `x-api-token` header
- `Authorization` header (as `Authorization: Bearer eyJhbGciOi...` or just the token)

Example header:

```
Authorization: Bearer demo-supersecret-token
```

### Authentication (login)

The backend contains an in-memory user store. A default user is automatically registered on service start (see `Server/src/auth/auth.service.ts`):

- username: `user`
- password: `12345`

To obtain a JWT use the auth login endpoint (POST `/auth/login`) with JSON body:

```json
{ "username": "user", "password": "12345" }
```

The response will be:

```json
{ "access_token": "<jwt-token>" }
```

Use that token in requests to protected endpoints via the `Authorization: Bearer <token>` header.

### Pagination and Search

List and search endpoints accept query parameters:
- `page` (default `1`)
- `limit` (default `10`)
- `q` (for search endpoints)

Examples:

- `GET /movies?page=2&limit=5`
- `GET /movies/search?q=matrix&page=1&limit=10`

List endpoints return an object like:

```json
{ "items": [ ... ], "total": 42, "page": 1, "limit": 10 }
```

### Protected endpoints

- `POST /movies`, `PUT /movies/:id`, `DELETE /movies/:id` require the API token (see above)
- Equivalent create/update/delete on `actors` also require the API token
- The application additionally uses a JWT guard for auth on non-public routes. Provide the JWT in `Authorization` header when necessary.

### Swagger / API docs

You can view interactive API documentation (Swagger UI) on the running backend. By default the docs are available at:

- `http://localhost:3000/api/docs`
- `http://localhost:3000/docs` (redirects to `/api/docs`)
- `http://localhost:3000/swagger` (redirects to `/api/docs`)

Using Swagger with protected endpoints:

- Administrative endpoints that create/update/delete movies and actors are protected by a static API token. Swagger exposes an API Key security scheme named `api-token` that maps to the `x-api-token` header. To call these endpoints from the UI click the `Authorize` button and enter the API token value (the default token is `demo-supersecret-token`). You can enter just the token value — Swagger will send it in the `x-api-token` header.
- Endpoints that require a logged-in user require a JWT. Obtain a JWT by POSTing credentials to `/api/auth/login` (use the default user `user` / `12345`). Click `Authorize` in Swagger and paste `Bearer <your-jwt>` into the `jwt` / Bearer auth field (include the `Bearer ` prefix).

Example workflow in Swagger:

1. Open `http://localhost:3000/api/docs`.
2. Click `Authorize`.
3. In the `api-token` (API Key) field enter `demo-supersecret-token` to enable create/update/delete for movies and actors.
4. (Optional) Call `POST /api/auth/login` with the default credentials to get a JWT, then authorize with the `jwt` Bearer token to access JWT-protected endpoints.

Notes:

- The API token may also be provided via the `Authorization` header (as the raw token or `Bearer <token>`), but Swagger will normally set the `x-api-token` header when you use the `api-token` authorize field.
- If Swagger UI is not available, the server will still provide a minimal `/api/docs` page explaining that Swagger is disabled and showing the required `x-api-token` header for protected endpoints.

---

## Frontend (Next.js)

Location: `FrontEnd/`

### 1) Install dependencies

```bash
cd FrontEnd
npm install
```

### 2) Default user

The frontend expects a login endpoint on the backend. Use the default credentials to log in from `/login` page in the frontend:

- username: `user`
- password: `12345`

On successful login the frontend stores the `access_token` in `localStorage` under `access_token`.

### 3) Run the frontend (dev)

```bash
npm run dev
```

This starts Next.js on port `3001` by default (see `FrontEnd/package.json`).

The frontend `fetcher` function will try same-origin `/api` routes first, then fall back to the explicit backend host. You can configure the backend host with the environment variable `NEXT_PUBLIC_API` (for example `http://localhost:3000`).

Example when running frontend locally and backend on `http://localhost:3000`:

```bash
# start backend (port 3000)
cd Server && npm run start:dev
# start frontend (port 3001)
cd FrontEnd && npm run dev
```

Open `http://localhost:3001` in your browser.

---

## Modules and Project Structure (Backend)

- `MoviesModule` (routes: `/movies`) - movie entity, search, ratings relation
- `ActorsModule` (routes: `/actors`) - actor entity, link to movies
- `RatingsModule` (routes: `/ratings`) - ratings attached to movies
- `AuthModule` (routes: `/auth`) - simple in-memory user store, login endpoint
- `common/guards` - `JwtAuthGuard` enforces JWT checks, `ApiTokenGuard` enforces the static API admin token

---

## Features

- Seed script to pre-populate the SQLite DB with example movies, actors, and ratings
- Search endpoints for movies and actors
- Paginated list endpoints
- Lightweight JWT issuance and verification (custom implementation for demo)
- Static API token for elevated operations (create/update/delete)
- Next.js frontend that consumes the API and stores JWT in localStorage

---

## Useful commands

Backend

```bash
cd Server
npm install
npm run seed    # create and populate DB
npm run start:dev
# or production
npm run build
npm start
```

Frontend

```bash
cd FrontEnd
npm install
npm run dev
```

---

## Example requests

1) Login to get JWT (curl)

```bash
curl -X POST http://localhost:3000/auth/login -H "Content-Type: application/json" -d '{"username":"user","password":"12345"}'
```

2) Create a movie (requires API token)

```bash
curl -X POST http://localhost:3000/movies \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer demo-supersecret-token" \
  -d '{"title":"New Movie","description":"...","actorIds":[]}'
```

3) List movies (paginated)

```bash
curl http://localhost:3000/movies?page=1&limit=10
```

---

If you need help adapting this README for deployment or adding environment-specific configuration (for example production secrets or Dockerfiles), open an issue or request more instructions.
