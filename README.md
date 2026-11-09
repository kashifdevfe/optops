# Islamabad Optics (OptOps)

Multi-tenant optics operations platform: Express/Prisma API, company dashboard, and public ecommerce storefront.

| App | Folder | Local URL | Role |
| --- | --- | --- | --- |
| API | `backend` | http://localhost:5000 | Auth, POS, inventory, ecommerce API |
| Dashboard | `frontend` | http://localhost:5173 | Company staff + super-admin UI |
| Storefront | `frontend-ecommerce` | http://localhost:3001 | Customer-facing shop |

## Git (clone / pull / push)

Repo (public): https://github.com/kashifdevfe/optops

```bash
# First time
git clone https://github.com/kashifdevfe/optops.git
cd optops

# Get latest
git pull origin main

# Save your work
git add .
git commit -m "Describe your change"
git push origin main
```

- Anyone can **clone/pull** (repo is public).
- **Push** needs write access — ask the repo owner to add your GitHub username as a collaborator (Write).
- No branch protection on `main`; push directly once invited.
- Never commit `.env` or secrets (they are gitignored). Use `.env.example` only.

Invite a teammate (owner):

```bash
gh api repos/kashifdevfe/optops/collaborators/GITHUB_USERNAME -X PUT -f permission=push
```

Or: GitHub → repo → **Settings** → **Collaborators** → **Add people**.

## Prerequisites

- **Node.js 20+** and npm
- **PostgreSQL** (local), **or** a teammate’s shared **Prisma Accelerate** `DATABASE_URL`

## Quick start (colleagues)

From the repo root:

```bash
npm run setup
```

That will:

1. Copy `.env.example` → `.env` where missing  
2. `npm install` in `backend`, `frontend`, and `frontend-ecommerce`  
3. Run `prisma generate`

Then finish DB + run apps:

```bash
# 1. Edit backend/.env — set DATABASE_URL (see below)

# 2. Apply migrations
npm run prisma:migrate

# 3. Optional: create default super admin
npm run prisma:seed

# 4. Start (three terminals)
npm run dev:backend
npm run dev:frontend
npm run dev:ecommerce
```

### Database URL

**Option A — local Postgres** (recommended for isolated work):

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/islamabadoptics?schema=public"
```

Create the database once (`CREATE DATABASE islamabadoptics;`), then run `npm run prisma:migrate`.

**Option B — shared Prisma Accelerate** (same remote DB as the team):

Ask a teammate for `DATABASE_URL` (`prisma+postgres://accelerate.prisma-data.net/?api_key=...`) and paste it into `backend/.env`. Do **not** commit real keys.

### Env files

| File | Required? | Notes |
| --- | --- | --- |
| `backend/.env` | Yes | Copy from `backend/.env.example` |
| `frontend/.env` | Optional | Defaults via Vite proxy; example sets `VITE_API_URL` |
| `frontend-ecommerce/.env` | Optional | Proxy uses `/api` → backend |

MailJet vars are optional locally (only needed for password-reset emails).

## Manual setup (without `npm run setup`)

```bash
# Backend
cd backend
copy .env.example .env   # Windows — or: cp .env.example .env
npm install
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed      # optional
npm run dev

# Dashboard (new terminal)
cd frontend
copy .env.example .env   # optional
npm install
npm run dev

# Storefront (new terminal)
cd frontend-ecommerce
npm install
npm run dev
```

## Default accounts (after seed)

Super admin (dashboard admin area):

| Field | Value |
| --- | --- |
| URL | http://localhost:5173/admin/login |
| Email | `kashif.devfe@gmail.com` |
| Password | `optops123` |

Change this password before any shared/staging use.

Company accounts: register at http://localhost:5173/signup, then sign in at `/login`.

Recreate/reset super admin anytime:

```bash
cd backend
npm run create-superuser
```

## Useful commands

```bash
npm run prisma:studio    # browse DB in browser
npm run prisma:migrate   # create/apply migrations (dev)
npm run prisma:seed      # seed super admin
```

## Project layout

```
islamabadoptics/
├── backend/                 # Express + Prisma + PostgreSQL
│   ├── prisma/              # schema + migrations + seed
│   ├── scripts/             # one-off utilities (superuser, etc.)
│   └── src/                 # API server
├── frontend/                # Vite + React dashboard (port 5173)
├── frontend-ecommerce/      # Vite + React shop (port 3001)
├── scripts/setup.mjs        # one-command install helper
└── package.json             # root convenience scripts
```

## API notes

- Base path: `/api`
- Company auth: `/api/auth/login`, `/api/auth/signup`
- Super admin: `/api/admin/login`
- Ecommerce: `/api/ecommerce/products`, `/api/ecommerce/orders`, …

Both Vite apps proxy `/api` → `http://localhost:5000` in development.

## Troubleshooting

| Problem | Fix |
| --- | --- |
| `DATABASE_URL` / Prisma errors | Confirm Postgres is running, DB exists, URL in `backend/.env` is correct, then `npm run prisma:generate` |
| CORS / cookies in browser | Use the documented local ports; keep `FRONTEND_URL` / `FRONTEND_ECOMMERCE_URL` matching Vite |
| Frontend can’t reach API | Start backend on port 5000; or set `VITE_API_URL=http://localhost:5000/api` |
| Port already in use | Change `PORT` in `backend/.env`, or Vite `server.port` in the matching `vite.config.ts` |
| bcrypt install fails on Windows | Use Node 20 LTS; install [Visual Studio Build Tools](https://visualstudio.microsoft.com/visual-cpp-build-tools/) if native compile fails |

## Security

- Never commit `.env` files (they are gitignored).
- Share secrets out-of-band (chat/password manager), not in the repo.
- Rotate JWT/session secrets and MailJet keys if they were ever committed historically.
