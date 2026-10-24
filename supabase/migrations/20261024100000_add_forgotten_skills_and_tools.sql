-- Stack seen across the GitHub repos but missing from the resume. Logos (logo_url) are uploaded
-- afterwards from /admin: until then the skills wheel keeps the plain orb for these items.
insert into public.cv_skills (category, label, details, sort_order) values
  ('development', 'Python', '{Django,LangChain}', 12),
  ('development', 'GSAP', '{three.js}', 13),
  ('development', 'Symfony', '{}', 14),
  ('development', 'React Native', '{}', 15),
  ('development', 'Flutter', '{Dart}', 16),
  ('development', 'Vue', '{}', 17);

insert into public.cv_tools (name, purpose, purpose_en, icon_key, sort_order) values
  ('Supabase', 'Base de données, auth', 'Database, auth', 'supabase', 5),
  ('Vercel', 'Déploiement', 'Deployment', 'vercel', 6);
