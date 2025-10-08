<div align="center">

# SellPoint Client (Next.js)

Ukrainian marketplace — SellPoint. Live: https://sellpoint.pp.ua

<p>
	<img src="public/avatar.png" alt="SellPoint banner" width="720" />
	<br/>
	<em>SellPoint — the Ukrainian marketplace</em>
</p>

</div>

## Overview

This repository contains the frontend (client) for SellPoint — a modern Ukrainian marketplace. It is a Next.js App Router application with TypeScript, Tailwind CSS, and a small serverless API proxy layer. The client integrates with the SellPoint ASP.NET Web API for authentication, products, stores, users, and more.

Key capabilities:
- Product browsing and search, product details with media
- Auth (login/register, email verification, password reset)
- Favorites, cart/checkout flows, orders, reviews
- Seller/store flows and admin pages
- Local API routes that proxy to the backend for auth and selected endpoints

## Tech Stack

- Next.js 15 (App Router, Turbopack for dev)
- React 19, TypeScript 5
- Tailwind CSS v4
- ESLint 9 (next/eslint-config), strict typing
- Icons: heroicons, lucide-react
- react-markdown for content pages

Images are served from approved remote hosts (see `next.config.js`).

## Architecture (client-side)

- App Router structure under `src/app/*` (pages, layouts, route handlers)
- Components under `src/components/*` (feature, layout, shared, notifications, etc.)
- Services under `src/services/*` (auth, product, store, user) — single-responsibility wrappers around fetch
- Hooks under `src/hooks/*` (auth, password reset)
- Types under `src/types/*` (product, category, auth, store)
- Local API routes under `src/app/api/*` used mainly for auth-related proxying to the backend

Backend integration patterns:
- Most data calls go directly to the API base (see `NEXT_PUBLIC_API_URL`).
- Security-sensitive or browser‑restricted flows (auth checks, email verification) go through Next.js route handlers which proxy to the API and forward the `Authorization` header.
- Auth token is stored in `localStorage` as `auth_token` on the client. Local routes read `Authorization` from request headers.

## Prerequisites

- Node.js 20 LTS (recommended) or newer
- npm (the repo contains a `package-lock.json`)

## Setup & Run (Windows PowerShell)

1) Configure environment

Copy `.env.example` to `.env.local` and set values:

```
NEXT_PUBLIC_API_URL=https://api.sellpoint.pp.ua/api
NEXT_PUBLIC_GOOGLE_CLIENT_ID=<your-google-oauth-client-id>
```

Notes:
- `NEXT_PUBLIC_API_URL` points to the SellPoint API base. You can use the public URL above or your local instance.
- Google OAuth Client ID is optional unless you enable Google login.

2) Install dependencies

```powershell
npm ci
```

3) Start the dev server

```powershell
npm run dev
```

Open http://localhost:3000

## Scripts

- `npm run dev` — start Next.js dev server (Turbopack)
- `npm run build` — production build
- `npm start` — start production server
- `npm run lint` — run ESLint

## Environment Variables

- `NEXT_PUBLIC_API_URL` — base URL for backend API (e.g., `https://api.sellpoint.pp.ua/api`)
- `NEXT_PUBLIC_GOOGLE_CLIENT_ID` — Google OAuth client ID (public)
- `DISABLE_SERVER_LOGS` — set to `true` to silence client logger in dev (used by `src/lib/logger.ts`)

## Project Structure (high level)

```
src/
	app/                # App Router pages/layouts/route handlers
		api/              # Next API routes (proxies): auth, products, users, etc.
		product/[id]/     # Product detail
		search/           # Search
		favorites/        # Favorites
		checkout/         # Checkout flows
		orders/           # Orders & tracking
		admin/            # Admin area
	components/         # UI components (feature, layout, shared)
	services/           # API client wrappers (auth/product/store/user)
	hooks/              # Reusable client hooks
	types/              # Shared TS types
public/
	content/uk/         # Markdown content (UA)
```

## Backend Interaction (quick guide)

- API base: `NEXT_PUBLIC_API_URL` (default public: `https://api.sellpoint.pp.ua/api`)
- Direct calls: `productService`, `storeService`, `userService` typically call the API directly.
- Proxied calls: `src/app/api/auth/*` and some others forward requests to the API and attach the `Authorization` header.
- Auth token: persisted in `localStorage` as `auth_token`. Logout clears it.

Relevant services:
- `src/services/authService.ts` — login/register, email verification, admin/auth checks, password reset
- `src/services/productService.ts` — get/search/create/update/delete products, upload media
- `src/services/storeService.ts` — store requests and membership
- `src/services/userService.ts` — user profile endpoints

## Docker (optional)

This project includes a `Dockerfile` and `docker-compose.yml`.

Build and run:

```powershell
docker build -t sellpoint-client .
docker compose up --build
```

See `DOCKER_README.md` for more details.

## Contributing

We welcome contributions! Suggested flow:

1. Pick an Issue (look for labels like `good first issue` or the comparison/i18n issues).
2. Fork or create a feature branch from `dev`.
3. Develop with `npm run dev` and verify linting via `npm run lint`.
4. Keep changes focused and well-typed; prefer small, reusable components and typed services.
5. Open a Pull Request to `dev` with a clear description, screenshots (if UI), and notes about any env changes.

Coding guidelines:
- TypeScript strictness: prefer explicit types in public interfaces.
- API calls: centralize in `src/services/*`; avoid calling fetch directly from components.
- UI text: avoid hardcoded strings in deep components; prepare for i18n.

## Troubleshooting

- 401/Unauthorized in dev: ensure the `auth_token` exists (login) and is sent via `Authorization: Bearer <token>`.
- CORS issues: use local Next API proxies for auth-sensitive calls; verify API URL in `.env.local`.
- Images not showing: confirm the host is allowed in `next.config.js` under `images.remotePatterns`.
- Env not applied: restart `npm run dev` after changing `.env.local`.

## License

See the repository root for the project license and terms.

