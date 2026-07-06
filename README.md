# hw4 — Announcements API with JWT Authentication

Announcements API extended with JWT-based authentication (access + refresh
tokens), protected routes, and ownership checks.

## Stack

- Node.js / Express
- Prisma ORM + PostgreSQL
- JWT (`jsonwebtoken`) with separate access/refresh secrets
- `bcrypt` for password hashing
- `celebrate` (Joi) for request validation
- `swagger-jsdoc` + `swagger-ui-express` for API docs

## Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Start a local PostgreSQL instance (a ready-made `docker-compose.yml` is
   included):

   ```bash
   docker compose up -d
   ```

   Or point `DATABASE_URL` in `.env` at any PostgreSQL instance you already
   have running.

3. Copy/check `.env` and fill in real secrets for production use:

   ```
   DATABASE_URL="postgresql://postgres:postgres@localhost:5432/hw4?schema=public"
   JWT_SECRET=your_secret_key_here
   JWT_REFRESH_SECRET=your_refresh_secret_key_here
   PORT=3000
   ```

4. Run the migration:

   ```bash
   npm run prisma:migrate
   ```

5. Start the server:

   ```bash
   npm run dev
   # or
   npm start
   ```

6. Open API docs at [http://localhost:3000/api-docs](http://localhost:3000/api-docs).

7. Use `requests.http` (REST Client extension for VS Code, or IntelliJ's
   built-in HTTP client) to try out every route, including the unauthenticated
   / cross-user failure cases.

## Auth flow summary

| Route                     | Method | Auth required | Notes |
|---------------------------|--------|----------------|-------|
| `/auth/register`          | POST   | No             | Creates user, returns token pair |
| `/auth/login`             | POST   | No             | Returns new token pair, replaces stored refresh token |
| `/auth/refresh`           | POST   | No (refresh token via cookie or body) | Rotates refresh token |
| `/auth/logout`            | POST   | Yes            | Deletes stored refresh token(s), clears cookie |
| `/auth/me`                | GET    | Yes            | Returns current user profile |
| `/announcements`          | GET    | No             | Public list |
| `/announcements/:id`      | GET    | No             | Public detail |
| `/announcements`          | POST   | Yes            | Creates announcement owned by `req.user.id` |
| `/announcements/:id`      | PATCH  | Yes + ownership | 403 if not the owner |
| `/announcements/:id`      | DELETE | Yes + ownership | 403 if not the owner |

Access tokens expire in 15 minutes, refresh tokens in 7 days. Refresh tokens
are persisted in the `RefreshToken` table and rotated on every `/auth/refresh`
call.
