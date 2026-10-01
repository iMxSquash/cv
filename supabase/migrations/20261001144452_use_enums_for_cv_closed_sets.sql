-- Closed value sets become Postgres enums instead of text + CHECK: the
-- generated TypeScript types then carry the unions for Row, Insert and Update,
-- so the app no longer narrows them by hand. Add a value with
-- `alter type ... add value`.
create type public.cv_skill_category as enum ('design', 'development');
create type public.cv_link_platform as enum ('linkedin', 'github', 'freecodecamp', 'website', 'other');

alter table public.cv_skills drop constraint cv_skills_category_check;
alter table public.cv_skills
  alter column category type public.cv_skill_category using category::public.cv_skill_category;

alter table public.cv_links drop constraint cv_links_platform_check;
alter table public.cv_links
  alter column platform type public.cv_link_platform using platform::public.cv_link_platform;
