# Talking HealthTech

The project contains an existing React/Vite frontend in `frontend/` and an Express/MongoDB API in `backend/`. The backend is an independent npm package; frontend source files and package configuration are not changed by it.

## Backend setup

Requirements: Node.js 20+, MongoDB 6+ (local or Atlas), and a long random JWT secret.

1. Copy `backend/.env.example` to `backend/.env`.
2. Set `MONGO_URI`, `JWT_SECRET` (at least 32 characters), and `FRONTEND_URL`. For development, the frontend origin is `http://localhost:5173`.
3. To create the initial admin account, also set `ADMIN_NAME`, `ADMIN_EMAIL`, and a unique `ADMIN_PASSWORD` of at least 12 characters. Never use example credentials in a real environment.
4. For subscription confirmations, newsletter campaigns, and contact notifications, configure `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_FROM_EMAIL`, and optionally `SMTP_USER`/`SMTP_PASSWORD`. Set `CONTACT_EMAIL` to receive contact-form notifications. SMTP is optional for local development; contact messages are saved for admin review and newsletter subscriptions are stored when email is not configured.
5. Install and start the API:

   ```sh
   cd backend
   npm install
   npm run dev
   ```

   The API listens at `http://localhost:5000/api/v1`. It waits for MongoDB and reports a clear startup error if it cannot connect.
6. Seed the admin and idempotent sample content:

   ```sh
   npm run seed
   ```

   The seed script only inserts missing records; it does not overwrite existing content.

For MongoDB Atlas, create a database user, allow the application host in the Atlas network access list, and put the Atlas connection URI in `MONGO_URI`. Do not commit `.env`. For production, use HTTPS and set `NODE_ENV=production`, `COOKIE_SECURE=true`, and an appropriate `COOKIE_SAME_SITE`. If the browser frontend is on a different site, use `COOKIE_SAME_SITE=none` with secure cookies and configure its exact origin in `FRONTEND_URL`.

## Frontend setup

1. Copy `frontend/.env.example` to `frontend/.env` and set `VITE_API_URL` to the backend API origin (development default: `http://localhost:5000/api/v1`).
2. Keep the frontend origin consistent with backend `FRONTEND_URL`. For local development, open the Vite app at `http://localhost:5173` so credentialed requests and HttpOnly cookies use the configured origin.
3. Start the frontend:

   ```sh
   cd frontend
   npm install
   npm run dev
   ```

The frontend restores the current session from `/auth/me`; it does not save credentials or JWTs in browser storage. The admin-only page at `/admin` requires an account with the backend admin role. Admins can manage editorial content, companies, and jobs; review contact messages and newsletter subscribers; and send newsletter campaigns when SMTP is configured. Community membership links to the hosted THT+ and community services.

## Deploying to Vercel

Deploy this monorepo as two Vercel projects connected to the same repository:

1. Create the frontend project with **Root Directory** set to `frontend`. Use the Vite preset, `npm run build`, and `dist` as the output directory. Add `VITE_API_URL=https://YOUR-API-PROJECT.vercel.app/api/v1` as an environment variable for Production (and Preview if needed). The `frontend/vercel.json` rewrite supports client-side routes such as `/admin` and `/directory`.
2. Create a second project with **Root Directory** set to `backend`. The API is served by `backend/api/[...path].js`; it connects to MongoDB on demand and reuses the connection while the function instance stays warm.
3. Configure the backend project's Vercel environment variables for Production:

   - Required: `MONGO_URI`, `JWT_SECRET` (at least 32 random characters), and `FRONTEND_URL` (the exact deployed frontend origin, without a path).
   - Cookies/proxy: `NODE_ENV=production`, `COOKIE_SECURE=true`, `COOKIE_SAME_SITE=none`, and `TRUST_PROXY=1`.
   - Optional initial admin: `ADMIN_NAME`, `ADMIN_EMAIL`, and a unique `ADMIN_PASSWORD` (at least 12 characters). These values do not create an account by themselves; run the seed script once against the production database from a trusted machine.
   - Optional email: `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_FROM_EMAIL`, optional `SMTP_USER`/`SMTP_PASSWORD`, and `CONTACT_EMAIL`.
   - Optional media: all three `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, and `CLOUDINARY_API_SECRET`, or none.

   Add variables separately for Preview only if you intend preview deployments to access a database; use a separate non-production database for previews.
4. In MongoDB Atlas, allow network access from Vercel (Atlas may require `0.0.0.0/0` because Vercel function egress IPs are not fixed on standard plans). Use a strong database user password and a least-privilege database account.
5. After both projects deploy, verify `https://YOUR-API-PROJECT.vercel.app/api/v1/health`, then browse the frontend and test login/session restoration. If you add a custom frontend domain, update the backend `FRONTEND_URL` to that exact origin and redeploy the backend.

The frontend and API are on different Vercel origins, so the backend uses secure cross-site cookies (`COOKIE_SAME_SITE=none`). Keep `VITE_API_URL` pointed at the API project, and do not put backend secrets in frontend variables. Never commit `.env` files or Vercel secrets.

## Scripts and checks

- `npm run dev` — Node watch mode
- `npm start` — production server
- `npm run seed` — create initial admin and sample content
- `npm test` — HTTP/middleware and validation tests (does not need MongoDB)
- `npm run test:integration` — authentication and CRUD tests against an isolated local MongoDB test database (MongoDB must be running on `127.0.0.1:27017`)

`GET /api/v1/health` reports server uptime and the database connection state. It returns HTTP 503 when MongoDB is not connected.

## API overview

All responses use `{ "success": true, "message": "...", "data": ... }`; list responses also include `pagination` with `page`, `limit`, `total`, and `totalPages`. Errors use `{ "success": false, "message": "..." }`. Request validation errors include field details only outside production.

| Method | Endpoint | Access |
|---|---|---|
| GET | `/health` | Public |
| POST | `/auth/register` | Public; always creates a regular user |
| POST | `/auth/login` | Public; rate limited |
| POST | `/auth/logout` | Signed in |
| GET | `/auth/me` | Signed in |
| PUT | `/auth/update-profile` | Signed in |
| PUT | `/auth/change-password` | Signed in |
| GET, POST | `/articles` | Public list; admin create |
| GET | `/articles/:slugOrId` | Published public; admin can read drafts |
| PUT, DELETE | `/articles/:id` | Admin |
| GET, POST | `/podcasts`, `/categories`, `/glossary`, `/events` | Public list; admin create |
| GET | `/{podcasts,categories,glossary,events}/:slugOrId` | Public published/active records |
| PUT, DELETE | `/{podcasts,categories,glossary,events}/:id` | Admin |
| GET, POST | `/companies`, `/jobs` | Public list; admin create |
| GET | `/companies/:slugOrId`, `/jobs/:slugOrId` | Public published records |
| PUT, DELETE | `/companies/:id`, `/jobs/:id` | Admin |
| POST | `/contact` | Public; rate limited and stored for admin review |
| POST | `/newsletter/subscribe` | Public; rate limited |
| POST | `/newsletter/unsubscribe` | Public secure token; rate limited |
| GET | `/admin/newsletter-subscribers`, `/admin/contact-messages` | Admin |
| POST | `/admin/newsletter-campaign` | Admin; SMTP required; rate limited |

Resource lists accept `page` (maximum 10,000), `limit` (maximum 100), `search`, `category` (category slug), `sort` (`latest`, `oldest`, `title_asc`, `title_desc`, `popular`, `event_soonest`), and `status` where applicable. Category listings also accept `type` (`article`, `podcast`, `event`, or `glossary`). Public article, podcast, company and job listings only return published content; event listings only include upcoming dates and jobs exclude past closing dates. Admin list requests can include drafts and inactive categories.

Writes to content, categories, glossary terms, events and subscriber exports require an admin session. Admin accounts are created only by the seed script; no public admin registration exists. Authentication uses an HttpOnly cookie. Development login responses also include a token for API clients; production responses do not. Postman can retain the cookie from login or send the token as `Authorization: Bearer <token>`. Cookie-authenticated writes require the configured frontend `Origin`.

### Example requests

Register a regular account:

```http
POST http://localhost:5000/api/v1/auth/register
Content-Type: application/json

{"name":"Taylor Reader","email":"taylor@example.com","password":"a-unique-password-123"}
```

Login:

```http
POST http://localhost:5000/api/v1/auth/login
Content-Type: application/json

{"email":"admin@example.com","password":"your-seed-admin-password"}
```

Search and paginate articles:

```http
GET http://localhost:5000/api/v1/articles?page=1&limit=10&search=AI&category=artificial-intelligence&sort=latest
```

Create an article as an admin (provide the 24-character category ID returned by `/categories?type=article`):

```http
POST http://localhost:5000/api/v1/articles
Content-Type: application/json
Authorization: Bearer <development-token>

{"title":"Designing a connected care journey","excerpt":"How thoughtful digital services support care.","content":"A longer editorial article body with practical detail about care teams, patients, and digital services.","category":"<category-id>","status":"draft","tags":["digital health"]}
```

Subscribe and unsubscribe:

```http
POST http://localhost:5000/api/v1/newsletter/subscribe
Content-Type: application/json

{"email":"newsletter-reader@example.com"}
```

```http
POST http://localhost:5000/api/v1/newsletter/unsubscribe
Content-Type: application/json
Authorization: Bearer <admin-token>

{"token":"<token-from-the-unsubscribe-link>"}
```

Newsletter confirmation and campaign messages contain a random unsubscribe token. Contact submissions remain accessible to admins even when SMTP notifications are not configured.

## Frontend integration

The existing frontend Axios service is intentionally unchanged. To connect it to this API, configure `VITE_API_BASE_URL=http://localhost:5000/api/v1` in `frontend/.env.local` and set `withCredentials: true` on the Axios instance. Example:

```js
import axios from 'axios'

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true,
  headers: { Accept: 'application/json' },
})
```

Restart Vite after changing environment variables. SMTP must be configured on the backend to send subscription confirmations, newsletter campaigns, and contact notifications. Contact messages and subscriptions are stored in MongoDB. The API does not expose an image upload endpoint; Cloudinary credentials are supported by the optional adapter in `backend/config/cloudinary.js`.

## Security and operations

The API uses bcrypt password hashing, signed JWTs with per-user revocation on logout and password change, HttpOnly cookies, same-site/secure cookie configuration, exact-origin credentialed CORS, origin checks on cookie-authenticated writes, Helmet, Mongo query sanitization, Joi allowlisted validation, auth/newsletter rate limits, bounded request bodies, role checks from the database, and centralized safe errors. Public list endpoints use indexed Mongo queries, projections, pagination and selective population. Set `TRUST_PROXY` to the exact proxy hop count or supported proxy subnet name only when deployed behind a trusted reverse proxy; leave it `false` otherwise. Configure a shared rate-limit store before scaling across multiple server instances.
