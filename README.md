# TaskNest: Student Task & Assignment Tracker

A web-based task manager for college students. It keeps assignments, projects, practical files, presentations and tests in one place, with deadlines, priorities and progress tracking.

## Problem Statement

Students get academic work through WhatsApp groups, classroom notices, learning platforms and verbal instructions. With no single place to record it all, deadlines get missed and it is hard to tell what needs attention first.

TaskNest solves one problem: **tracking academic tasks and their deadlines**. It is deliberately small and does not try to be a full college management system.

## Features

**Accounts**
- Sign up, log in and log out using Supabase Auth
- Dashboard, task and settings pages are protected from logged-out users

**Task management**
- Add, edit, delete and complete tasks
- Each task has a title, description, subject, type, deadline, priority and status
- Task types: Assignment, Project, Practical, Presentation, Test, Other
- Priority: Low, Medium, High
- Status: Pending, In Progress, Completed

**Dashboard**
- Counts for Pending, In Progress, Completed and Overdue tasks
- The next 5 upcoming tasks, ordered by deadline
- Recently updated tasks
- Weekly progress, for example "3 of 5 tasks completed this week"

**Task list**
- Search by title
- Filter by status, priority, subject and task type
- Sort by earliest or latest deadline

**Other**
- Simple subjects (such as DBMS or Data Structures) used to organise and filter tasks
- Automatic overdue detection: a task is overdue when `deadline < now` and `status != Completed`
- Loading, error and empty states, with toast feedback and form validation
- Responsive layout: sidebar on desktop, collapsible menu and floating add button on mobile
- Accessibility: semantic HTML, labelled form fields, keyboard navigation, visible focus states, and status shown in text as well as color

## Technology Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14 (App Router), React, TypeScript |
| Styling | Tailwind CSS |
| Icons | lucide-react |
| Database | Supabase PostgreSQL |
| Authentication | Supabase Auth |
| Security | Supabase Row Level Security (RLS) |
| Optional service | Python, FastAPI |
| Hosting | Vercel (app), Supabase (database) |

## System Architecture

```
Browser (Next.js pages and components)
        |
        |  services/tasks.ts  (all database calls in one place)
        v
Supabase
  |- Auth: user sessions
  |- PostgreSQL + Row Level Security: each user can only access their own rows

middleware.ts    redirects logged-out users away from protected pages
python/main.py   optional read-only FastAPI service for task summaries
```

The app has no custom API routes. Row Level Security lets the browser talk to Supabase directly with the public anon key, which keeps the codebase small. The service-role key is never used in the app.

**Role of the Python service:** a small, separate FastAPI service (`/health` and `/summary`). It shows how a Python service can sit beside the web app and reuse the same Supabase security rules, because it forwards the user's own token. It does not duplicate the Next.js backend, and the app works without it.

## Project Structure

```
app/          pages and routes
components/   reusable UI components
hooks/        data-loading and user hooks
services/     database logic (Supabase queries)
lib/          utilities and Supabase client
types/        shared TypeScript types
supabase/     SQL schema, RLS policies, sample data function
python/       optional FastAPI service
```

## Database Schema

| Table | Key columns |
|---|---|
| `profiles` | id, name, email, created_at |
| `subjects` | id, user_id, name, color, created_at |
| `tasks` | id, user_id, subject_id, title, description, task_type, priority, status, deadline, created_at, updated_at, completed_at |

- Foreign keys link subjects and tasks to the user, and tasks to subjects
- `check` constraints restrict task type, priority and status to the allowed values
- A database trigger keeps `updated_at` and `completed_at` consistent with the task status
- RLS policies allow a user to select, insert, update and delete only their own rows

## Software Engineering Considerations

| Risk | How the project addresses it |
|---|---|
| Scope creep | The MVP is limited to tasks, deadlines and subjects. There is no chat, attendance, notes or notification system. |
| Requirements ambiguity | Fixed fields and enumerated values for type, priority and status, enforced in both TypeScript and SQL. |
| Schedule slippage | One framework, one database and no custom API layer keep the architecture simple and modular. |
| Poor maintainability | UI components, database services, types, hooks and utilities live in separate folders. |

## Future Scope

- Teacher task sharing
- Email reminders
- Calendar integration

These are not implemented in the current version.

