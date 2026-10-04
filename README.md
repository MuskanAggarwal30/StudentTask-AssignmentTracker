# TaskNest — Student Task & Assignment Tracker

## Problem statement
Students receive assignments, project work, practical files and test dates through WhatsApp groups, classroom notices, learning platforms and verbal instructions. Deadlines get missed because nothing brings them together. TaskNest is one small place to record academic tasks, see what is due next, and see what is overdue.

## Features
- Sign up, log in, log out (Supabase Auth); dashboard, tasks and settings are protected
- Add, edit, delete and complete tasks (title, description, subject, type, deadline, priority, status)
- Dashboard: counts (Pending / In Progress / Completed / Overdue), next 5 upcoming tasks, recent tasks, weekly progress
- Task list: search, filter by status / priority / subject / type, sort by deadline
- Simple subjects used for organising and filtering
- Overdue is computed automatically: `deadline < now AND status != Completed`
- Loading, error and empty states; toast feedback; keyboard and screen-reader friendly

## Technology stack
Next.js 14 (App Router) · TypeScript · React · Tailwind CSS · Supabase (PostgreSQL + Auth + Row Level Security) · lucide-react · FastAPI (optional)

Recharts is not used: a plain progress bar covers the one visualisation needed.

## System architecture
```
Browser (Next.js pages, client components)
   │  services/tasks.ts  (all database calls live here)
   ▼
Supabase  ── Auth (sessions in cookies)
          ── PostgreSQL + RLS (users only see their own rows)

middleware.ts  → redirects logged-out users away from protected routes
python/main.py → optional read-only FastAPI /summary, uses the caller's token
```
```
app/         routes          components/  UI pieces      hooks/   useLoad, useUser
services/    DB logic        lib/         utils, client  types/   shared types
supabase/    schema.sql      python/      FastAPI service
```
There are no custom Next.js API routes: with Row Level Security the browser can talk to Supabase safely using the public anon key, which keeps the project small.

### Why Python exists
It is a deliberately tiny, separate service (`GET /health`, `GET /summary`) showing how a non-JavaScript service can sit beside the app and reuse the same Supabase security rules. It does not duplicate the app backend, and the app works without it.

## Database schema
| Table | Columns |
|---|---|
| profiles | id (= auth user id), name, email, created_at |
| subjects | id, user_id → auth.users, name, color, created_at (unique per user + name) |
| tasks | id, user_id, subject_id → subjects (set null on delete), title, description, task_type, priority, status, deadline, created_at, updated_at, completed_at |

Allowed values — task_type: Assignment, Project, Practical, Presentation, Test, Other · priority: Low, Medium, High · status: Pending, In Progress, Completed. A trigger keeps `updated_at` and `completed_at` consistent with status.

## Installation
1. Install Node.js 18.17 or newer.
2. `npm install`

## Environment variables
```
cp .env.example .env.local
```
Fill in `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` (Supabase → Project Settings → API). Never put the service-role key in this app.

## Supabase setup
1. Create a project at supabase.com.
2. **SQL Editor** → new query → paste all of `supabase/schema.sql` → Run. This creates tables, triggers, RLS policies and the sample-data function.
3. **Authentication → Providers → Email**: for easiest testing, turn off "Confirm email". If left on, new users must confirm by email before logging in.
4. **Authentication → URL Configuration**: add `http://localhost:3000` (and your Vercel URL later).

## Running locally
```
npm run dev      # http://localhost:3000
```
Sign up, then open **Settings → Load sample data** to get 4 subjects and 5 tasks.

## Build
```
npm run build && npm start
```

## Deployment (Vercel)
1. Push the project to GitHub.
2. Vercel → Add New Project → import the repo (framework: Next.js is detected).
3. Add the two environment variables above → Deploy.
4. Add the Vercel URL to Supabase → Authentication → URL Configuration.

## Python service
```
cd python
python -m venv .venv && source .venv/bin/activate    # Windows: .venv\Scripts\activate
pip install -r requirements.txt
export SUPABASE_URL=https://xxxx.supabase.co SUPABASE_ANON_KEY=your-anon-key
uvicorn main:app --reload --port 8000
```
- `GET /health` → `{"status":"ok"}`
- `GET /summary` with header `Authorization: Bearer <user access token>` → task counts and completion percent

To deploy it, use any Python host (Render, Railway, Fly.io) with start command `uvicorn main:app --host 0.0.0.0 --port $PORT` and the two env vars. It is optional; skip it if you only deploy the web app.

## Troubleshooting
- **"Supabase is not configured"** — `.env.local` is missing or the dev server was not restarted after editing it.
- **Signup says to check email** — email confirmation is on; confirm or disable it (Supabase setup step 3).
- **Tasks fail to load / save** — `schema.sql` was not run, or ran partly. Re-run in a fresh project.
- **Redirect loop to /login** — wrong URL or anon key; sign in again after fixing.
- **"Load sample data" fails** — you must be logged in, and `seed_demo_data` must exist (part of `schema.sql`).

## How the design addresses project risks
| Risk | Response |
|---|---|
| Scope creep | MVP limited to tasks, deadlines and subjects; no chat, attendance, notes or notifications |
| Requirements ambiguity | Fixed fields and enumerated values for type, priority and status, enforced in TypeScript and in SQL `check` constraints |
| Schedule slippage | One framework, one database, no custom API layer |
| Poor maintainability | Separate `components/`, `services/`, `types/`, `hooks/`, `lib/`; no file over ~150 lines |

## Future scope
Teacher task sharing · Email reminders · Calendar integration (not implemented).
