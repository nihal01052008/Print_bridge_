# PrintBridge

Cloud-based printing platform connecting customers to nearby cyber cafés / print shops.
Upload from any device, walk in, print — no downloads, no queues.

## Structure

```
printbridge/
├── backend/          Express API, MongoDB models, Socket.io, Cloudinary
└── frontend/         Vite + React + Tailwind v4, glassmorphism design system
```

## Stack

- **Frontend:** React, Vite, Tailwind CSS v4, Framer Motion, React Router, Socket.io client
- **Backend:** Node.js, Express, MongoDB (Mongoose), Socket.io, Cloudinary, JWT auth
- **Real-time:** Socket.io rooms scoped per shop for live order updates
- **Storage:** Cloudinary (no local file storage, no downloads required to print)

## Getting started

### Fastest way — one command from the project root

```bash
npm run install:all   # installs backend + frontend deps
npm run dev            # runs both servers together, color-coded logs
```
Backend on `http://localhost:5000`, frontend on `http://localhost:5173`. You still need a `backend/.env` filled in first (see below) — the server will refuse to start with a clear error message if `MONGO_URI` or `JWT_SECRET` is missing.

### Or run them separately

**Backend**

```bash
cd backend
cp .env.example .env   # fill in your MongoDB URI, JWT secret, Cloudinary keys
npm install
npm run dev             # http://localhost:5000
```

**Frontend**

```bash
cd frontend
npm install
npm run dev              # http://localhost:5173
```

The Vite dev server proxies `/api` and `/socket.io` to the backend, so both
just need to be running side by side — no CORS config needed locally.

## Build phases

This project was built incrementally, in this order:

1. ✅ Project scaffold
2. ✅ Backend API + MongoDB models
3. ✅ Landing page
4. ✅ Customer upload flow
5. ✅ Shop dashboard (QR code panel for the walk-in scan flow)
6. ✅ Admin dashboard
7. ✅ Final polish & responsive pass

**Not yet done — deployment.** Everything above runs locally on `localhost`.
Making it reachable from any phone/device on the internet is a separate step:
deploy the backend (e.g. Render, Railway, Fly.io) and frontend (e.g. Vercel,
Netlify) as their own hosted services, then point them at each other with
real URLs instead of `localhost`. Ask when you're ready for that walkthrough.

## What changed in the polish pass

- Routes are now lazy-loaded (`React.lazy` + `Suspense`), cutting the single
  500KB+ bundle down to route-sized chunks (~50-160KB each)
- Added an `ErrorBoundary` so a component crash shows a recovery screen
  instead of a blank page
- Scroll position resets on every route change
- Framer Motion animations now respect `prefers-reduced-motion` globally
- Fixed two color-contrast failures caught by a WCAG check: secondary text
  (`ink-faint`) was 3.27:1, now 4.82:1; the amber status color was 2.45:1
  on its own badge background, now 4.76:1 — both meet AA for normal text
- Added a real ESLint config (was referenced in `package.json` but had no
  actual config file) — fixed the 2 real errors and 4 real warnings it caught
- Backend now validates required env vars on boot with a clear message
  instead of a cryptic crash
- Removed an unused dependency (`express-validator`) that was never wired up
- Added a root-level `npm run dev` that runs both servers together

## API overview

**Auth** (`/api/auth`) — shops and admins log in here; customers never need an account.
- `POST /login` — `{ email, password }` → `{ token, user }`
- `GET /me` — current user (requires `Authorization: Bearer <token>`)

**Shops** (`/api/shops`)
- `GET /public` — public, browse shops currently open for orders (customer upload flow, no shop link)
- `GET /me` — shop only, the logged-in owner's own shop profile (used for the QR panel)
- `GET /:slug` — public, used by the upload page to confirm a specific shop is open
- `GET /` — admin only, list all shops with order counts
- `POST /` — admin only, onboard a new shop (creates the shop + its owner login)
- `PATCH /:id` — admin (any field) or shop owner (own settings, e.g. pause orders)
- `DELETE /:id` — admin only

**Orders** (`/api/orders`)
- `POST /:shopSlug` — public, multipart upload (`files` field, up to 10), returns a pickup code like `PB4X7Q9`
- `GET /lookup/:code` — public, look up an order by its pickup code
- `GET /shop/mine` — shop only, live incoming orders (optionally `?status=`)
- `GET /shop/search` — shop only, search by code/name/phone (`?q=`)
- `PATCH /:id/status` — shop only, advance order status — also pushes a `order:updated` Socket.io event

**Admin** (`/api/admin`)
- `GET /stats` — shop/order counts, today's orders, breakdown by status
- `GET /orders/recent` — latest 50 orders across all shops

## First-time setup

After filling in `backend/.env`, create your first admin login:

```bash
cd backend
npm run seed:admin "Your Name" "you@printbridge.local" "a-strong-password"
```

Then create shops either by calling `POST /api/shops` as that admin, or once the
Admin Dashboard UI exists (Phase 6).

## Design system

Apple-inspired glassmorphism, grounded in a paper-and-ink motif:

| Token | Value | Use |
|---|---|---|
| `--color-paper` | `#faf9f6` | Base background |
| `--color-ink` | `#1c1c1e` | Primary text |
| `--color-accent` | `#2b4c7e` | Fountain-pen indigo — CTAs, links, active states |
| `--color-stamp` | `#d4823c` | Warm amber — sparing use, status highlights |
| `.glass` | `rgba(255,255,255,.55)` + blur(20px) | Card surfaces |

Defined in `frontend/src/index.css` and consumed via Tailwind v4's `@theme` block,
so every page pulls from the same source of truth.
