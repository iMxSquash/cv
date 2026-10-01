-- Resume content for cv.elwen.dev, managed from the cv repo /admin backoffice
-- (cv TODO.md Phase 1). Everything stored here is public by design: RLS
-- filters rows, not columns, so never store a value meant to stay private.

-- Shared trigger function: keeps `updated_at` in sync on every update.
create function public.cv_set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

-- Singleton row (id = 1): identity, about text, contact and availability.
create table public.cv_profile (
  id smallint primary key default 1 check (id = 1),
  full_name text not null,
  headline text not null,
  quote text,
  quote_author text,
  -- Light markup: **word** marks a highlighted keyword (parsed, never rendered as HTML).
  about text not null,
  email text not null check (email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  -- Empty means "not published": there is no hidden value.
  phone text,
  -- City and postcode only, never a street address.
  location text,
  avatar_url text,
  availability_title text,
  availability_detail text,
  is_available boolean not null default true,
  updated_at timestamptz not null default now()
);

create table public.cv_experiences (
  id uuid primary key default gen_random_uuid(),
  role text not null,
  company text not null,
  logo_url text,
  start_date date not null,
  -- null = ongoing.
  end_date date,
  location text,
  description text,
  sort_order int not null default 0,
  visible boolean not null default true,
  created_at timestamptz not null default now(),
  check (end_date is null or end_date >= start_date)
);

create table public.cv_education (
  id uuid primary key default gen_random_uuid(),
  school text not null,
  city text,
  degree text not null,
  details text,
  -- null = single-year entry (e.g. a diploma obtained in `end_year`).
  start_year int check (start_year between 1990 and 2100),
  end_year int not null check (end_year between 1990 and 2100),
  logo_url text,
  sort_order int not null default 0,
  visible boolean not null default true,
  created_at timestamptz not null default now(),
  check (start_year is null or end_year >= start_year)
);

create table public.cv_skills (
  id uuid primary key default gen_random_uuid(),
  category text not null check (category in ('design', 'development')),
  label text not null,
  -- Secondary labels shown under the skill, e.g. {'Tailwind'} for CSS.
  details text[] not null default '{}',
  sort_order int not null default 0,
  visible boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.cv_tools (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  purpose text,
  -- Key of a local SVG icon component: uploaded SVGs are never allowed.
  icon_key text not null check (icon_key ~ '^[a-z0-9-]+$'),
  sort_order int not null default 0,
  visible boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.cv_languages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  level text not null,
  flag_code text not null check (flag_code ~ '^[a-z]{2}$'),
  sort_order int not null default 0,
  visible boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.cv_links (
  id uuid primary key default gen_random_uuid(),
  platform text not null check (platform in ('linkedin', 'github', 'freecodecamp', 'website', 'other')),
  label text not null,
  url text not null check (url ~ '^https://'),
  sort_order int not null default 0,
  visible boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.cv_mobility (
  id uuid primary key default gen_random_uuid(),
  label text not null,
  detail text,
  icon_key text not null check (icon_key ~ '^[a-z0-9-]+$'),
  sort_order int not null default 0,
  visible boolean not null default true,
  created_at timestamptz not null default now()
);

comment on table public.cv_profile is 'Resume profile singleton managed from the cv repo /admin backoffice (cv TODO.md Phase 1).';
comment on table public.cv_experiences is 'Resume work experiences managed from the cv repo /admin backoffice (cv TODO.md Phase 1).';
comment on table public.cv_education is 'Resume education entries managed from the cv repo /admin backoffice (cv TODO.md Phase 1).';
comment on table public.cv_skills is 'Resume skills (design / development) managed from the cv repo /admin backoffice (cv TODO.md Phase 1).';
comment on table public.cv_tools is 'Resume tools managed from the cv repo /admin backoffice (cv TODO.md Phase 1).';
comment on table public.cv_languages is 'Resume spoken languages managed from the cv repo /admin backoffice (cv TODO.md Phase 1).';
comment on table public.cv_links is 'Resume social links managed from the cv repo /admin backoffice (cv TODO.md Phase 1).';
comment on table public.cv_mobility is 'Resume mobility and availability items managed from the cv repo /admin backoffice (cv TODO.md Phase 1).';

create trigger cv_profile_set_updated_at
  before update on public.cv_profile
  for each row execute function public.cv_set_updated_at();

create index cv_experiences_sort_order_idx on public.cv_experiences (sort_order);
create index cv_education_sort_order_idx on public.cv_education (sort_order);
create index cv_skills_category_sort_order_idx on public.cv_skills (category, sort_order);
create index cv_tools_sort_order_idx on public.cv_tools (sort_order);
create index cv_languages_sort_order_idx on public.cv_languages (sort_order);
create index cv_links_sort_order_idx on public.cv_links (sort_order);
create index cv_mobility_sort_order_idx on public.cv_mobility (sort_order);

-- Row Level Security: anonymous visitors read visible rows only; the single
-- authenticated admin (signup disabled in Supabase Auth) manages everything.
-- One policy per role avoids overlapping permissive SELECT policies.
alter table public.cv_profile enable row level security;
alter table public.cv_experiences enable row level security;
alter table public.cv_education enable row level security;
alter table public.cv_skills enable row level security;
alter table public.cv_tools enable row level security;
alter table public.cv_languages enable row level security;
alter table public.cv_links enable row level security;
alter table public.cv_mobility enable row level security;

create policy "Public can read the profile"
  on public.cv_profile for select to anon using (true);
create policy "Authenticated users can manage the profile"
  on public.cv_profile for all to authenticated using (true) with check (true);

create policy "Public can read visible experiences"
  on public.cv_experiences for select to anon using (visible = true);
create policy "Authenticated users can manage experiences"
  on public.cv_experiences for all to authenticated using (true) with check (true);

create policy "Public can read visible education"
  on public.cv_education for select to anon using (visible = true);
create policy "Authenticated users can manage education"
  on public.cv_education for all to authenticated using (true) with check (true);

create policy "Public can read visible skills"
  on public.cv_skills for select to anon using (visible = true);
create policy "Authenticated users can manage skills"
  on public.cv_skills for all to authenticated using (true) with check (true);

create policy "Public can read visible tools"
  on public.cv_tools for select to anon using (visible = true);
create policy "Authenticated users can manage tools"
  on public.cv_tools for all to authenticated using (true) with check (true);

create policy "Public can read visible languages"
  on public.cv_languages for select to anon using (visible = true);
create policy "Authenticated users can manage languages"
  on public.cv_languages for all to authenticated using (true) with check (true);

create policy "Public can read visible links"
  on public.cv_links for select to anon using (visible = true);
create policy "Authenticated users can manage links"
  on public.cv_links for all to authenticated using (true) with check (true);

create policy "Public can read visible mobility items"
  on public.cv_mobility for select to anon using (visible = true);
create policy "Authenticated users can manage mobility items"
  on public.cv_mobility for all to authenticated using (true) with check (true);

-- Defense in depth: anon never needs to write, whatever the policies say.
revoke insert, update, delete, truncate on
  public.cv_profile, public.cv_experiences, public.cv_education, public.cv_skills,
  public.cv_tools, public.cv_languages, public.cv_links, public.cv_mobility
from anon;
