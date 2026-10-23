-- Soft skills join the skill categories, and projects get their own list
-- (printed between the experiences and the education on /print).

alter type public.cv_skill_category add value 'soft';

create table public.cv_projects (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  -- One line per bullet point on the printable resume.
  description text,
  stack text[] not null default '{}',
  url text check (url is null or url ~ '^https://'),
  sort_order integer not null default 0,
  visible boolean not null default true,
  created_at timestamptz not null default now()
);

comment on table public.cv_projects is 'Resume projects managed from the cv repo /admin backoffice.';

alter table public.cv_projects enable row level security;

create policy "Public can read visible projects"
  on public.cv_projects for select to anon using (visible = true);
create policy "Authenticated users can manage projects"
  on public.cv_projects for all to authenticated using (true) with check (true);

revoke insert, update, delete, truncate on public.cv_projects from anon;
