-- TaskNest schema. Run once in Supabase: SQL Editor > New query > paste > Run.

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null default '',
  email text not null default '',
  created_at timestamptz not null default now()
);

create table public.subjects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null check (char_length(name) between 1 and 60),
  color text not null default '#3b4a9e',
  created_at timestamptz not null default now(),
  unique (user_id, name)
);

create table public.tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  subject_id uuid references public.subjects(id) on delete set null,
  title text not null check (char_length(title) between 1 and 150),
  description text,
  task_type text not null default 'Assignment' check (task_type in ('Assignment','Project','Practical','Presentation','Test','Other')),
  priority text not null default 'Medium' check (priority in ('Low','Medium','High')),
  status text not null default 'Pending' check (status in ('Pending','In Progress','Completed')),
  deadline timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  completed_at timestamptz
);
create index tasks_user_deadline_idx on public.tasks (user_id, deadline);

-- Keep updated_at / completed_at consistent with status.
create function public.tasks_before_write() returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  if new.status = 'Completed' then new.completed_at := coalesce(new.completed_at, now());
  else new.completed_at := null; end if;
  return new;
end $$;
create trigger tasks_before_write before insert or update on public.tasks
  for each row execute function public.tasks_before_write();

-- Create a profile row whenever someone signs up.
create function public.handle_new_user() returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, name, email)
  values (new.id, coalesce(new.raw_user_meta_data->>'name', ''), coalesce(new.email, ''));
  return new;
end $$;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- Row Level Security: each user can only touch their own rows.
alter table public.profiles enable row level security;
alter table public.subjects enable row level security;
alter table public.tasks enable row level security;

create policy "profiles_select_own" on public.profiles for select using (auth.uid() = id);
create policy "profiles_insert_own" on public.profiles for insert with check (auth.uid() = id);
create policy "profiles_update_own" on public.profiles for update using (auth.uid() = id) with check (auth.uid() = id);
create policy "profiles_delete_own" on public.profiles for delete using (auth.uid() = id);

create policy "subjects_select_own" on public.subjects for select using (auth.uid() = user_id);
create policy "subjects_insert_own" on public.subjects for insert with check (auth.uid() = user_id);
create policy "subjects_update_own" on public.subjects for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "subjects_delete_own" on public.subjects for delete using (auth.uid() = user_id);

-- Tasks may only reference a subject owned by the same user.
create policy "tasks_select_own" on public.tasks for select using (auth.uid() = user_id);
create policy "tasks_insert_own" on public.tasks for insert with check (
  auth.uid() = user_id and (subject_id is null or exists (select 1 from public.subjects s where s.id = subject_id and s.user_id = auth.uid())));
create policy "tasks_update_own" on public.tasks for update using (auth.uid() = user_id) with check (
  auth.uid() = user_id and (subject_id is null or exists (select 1 from public.subjects s where s.id = subject_id and s.user_id = auth.uid())));
create policy "tasks_delete_own" on public.tasks for delete using (auth.uid() = user_id);

-- Demo data, called from Settings > Load sample data. Runs as the caller, so RLS still applies.
create function public.seed_demo_data() returns void language plpgsql security invoker as $$
declare uid uuid := auth.uid(); ds uuid; db uuid; ai uuid; wd uuid;
begin
  if uid is null then raise exception 'not authenticated'; end if;
  insert into subjects (user_id, name, color) values (uid,'Data Structures','#3b4a9e') on conflict (user_id,name) do nothing;
  insert into subjects (user_id, name, color) values (uid,'DBMS','#2f7d6d') on conflict (user_id,name) do nothing;
  insert into subjects (user_id, name, color) values (uid,'Artificial Intelligence','#a23b5a') on conflict (user_id,name) do nothing;
  insert into subjects (user_id, name, color) values (uid,'Web Development','#b45f06') on conflict (user_id,name) do nothing;
  select id into ds from subjects where user_id = uid and name = 'Data Structures';
  select id into db from subjects where user_id = uid and name = 'DBMS';
  select id into ai from subjects where user_id = uid and name = 'Artificial Intelligence';
  select id into wd from subjects where user_id = uid and name = 'Web Development';
  insert into tasks (user_id, subject_id, title, description, task_type, priority, status, deadline) values
    (uid, ds, 'Complete Linked List Assignment', 'Singly and doubly linked list operations, with output screenshots.', 'Assignment', 'Medium', 'In Progress', date_trunc('day', now()) + interval '3 days 17 hours'),
    (uid, db, 'DBMS ER Diagram', 'ER diagram for the library management case study.', 'Assignment', 'High', 'Pending', date_trunc('day', now()) + interval '1 day 10 hours'),
    (uid, ai, 'AI Unit 2 Preparation', 'Search algorithms: BFS, DFS, A*. Class test next week.', 'Test', 'Medium', 'Pending', date_trunc('day', now()) + interval '5 days 9 hours'),
    (uid, wd, 'React Mini Project', 'Small CRUD app with a README and a demo link.', 'Project', 'High', 'In Progress', date_trunc('day', now()) + interval '6 days 23 hours'),
    (uid, null, 'Operating Systems Practical File', 'Programs 1 to 8 with viva questions.', 'Practical', 'Low', 'Pending', date_trunc('day', now()) - interval '1 day' + interval '16 hours');
end $$;
