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

## How the design addresses project risks
| Risk | Response |
|---|---|
| Scope creep | MVP limited to tasks, deadlines and subjects; no chat, attendance, notes or notifications |
| Requirements ambiguity | Fixed fields and enumerated values for type, priority and status, enforced in TypeScript and in SQL `check` constraints |
| Schedule slippage | One framework, one database, no custom API layer |
| Poor maintainability | Separate `components/`, `services/`, `types/`, `hooks/`, `lib/`; no file over ~150 lines |

## Future scope
Teacher task sharing · Email reminders · Calendar integration (not implemented).
