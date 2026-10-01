-- Initial resume content, copied from the Figma resume (file
-- 0xFIzZIyxruyvJlxDVLimS, node 316:11498). Kept as in the Figma on purpose:
-- dates are updated from the /admin backoffice. Images (avatar, logos) are
-- uploaded from the backoffice, hence null URLs here.

insert into public.cv_profile (
  full_name, headline, quote, quote_author, about, email, phone, location,
  availability_title, availability_detail, is_available
) values (
  'Elwen Coussot',
  'Full-Stack Developer',
  'People ignore design that ignore people.',
  'Frank Chimero',
  'Bientôt en **3ᵉ année** de Bachelor **Développement Web** à **Digital Campus Paris**, je suis à la recherche d''une **alternance d''un an**, de **septembre 2025** à **septembre 2026**. Curieux, rigoureux et passionné par le développement web, j''ai déjà une **première expérience significative en alternance** sur un projet monorepo basé sur **Angular**, **NestJS**, **Tailwind** et **Docker**. Je souhaite aujourd''hui **renforcer mes compétences** en intégrant une équipe tech **dynamique**, en présentiel ou en télétravail.',
  'contact@elwen.dev',
  null,
  'Herblay-sur-Seine, 95220',
  'Recherche d''alternance',
  'Septembre 2025 à septembre 2026, en présentiel ou en télétravail',
  true
);

insert into public.cv_experiences (role, company, start_date, end_date, location, sort_order) values
  ('Concepteur et développeur de solutions numériques', 'FD Formation', '2025-09-01', '2026-09-01', 'Trappes (78) et travail à distance', 0),
  ('Concepteur et développeur de solutions numériques', 'EStack consulting', '2024-06-01', '2025-09-01', 'Travail à distance', 1),
  ('Graphiste bénévole', 'Team FURY (équipe e-sport)', '2020-11-01', '2021-09-01', 'Travail à distance', 2);

insert into public.cv_education (school, city, degree, details, start_year, end_year, sort_order) values
  ('Digital Campus', 'Paris', 'Bachelor en développement web et conception de solutions numériques', null, 2023, 2026, 0),
  ('Lycée Montesquieu', 'Herblay-sur-Seine', 'Baccalauréat général', 'Spécialisations NSI/SES, avec mention Assez bien', null, 2023, 1);

insert into public.cv_skills (category, label, details, sort_order) values
  ('design', 'User Experience', '{}', 0),
  ('design', 'Design System', '{}', 1),
  ('design', 'Web Design', '{}', 2),
  ('design', 'Mobile Design', '{}', 3),
  ('design', 'Wireframing', '{}', 4),
  ('design', 'Prototyping', '{}', 5),
  ('design', 'Testing', '{}', 6),
  ('development', 'React JS', '{}', 0),
  ('development', 'NextJS', '{}', 1),
  ('development', 'NestJS', '{}', 2),
  ('development', 'PHP', '{}', 3),
  ('development', 'TypeScript', '{}', 4),
  ('development', 'Angular', '{}', 5),
  ('development', 'HTML', '{}', 6),
  ('development', 'CSS', '{Tailwind}', 7),
  ('development', 'JavaScript', '{}', 8),
  ('development', 'Git', '{}', 9),
  ('development', 'Databases', '{}', 10),
  ('development', 'Docker', '{}', 11);

insert into public.cv_tools (name, purpose, icon_key, sort_order) values
  ('VS Code', 'Éditeur de code', 'vscode', 0),
  ('Figma', 'UI Design, prototyping', 'figma', 1),
  ('Adobe suite', 'Graphic Design', 'adobe', 2),
  ('GitHub', 'Collaboration', 'github', 3);

insert into public.cv_languages (name, level, flag_code, sort_order) values
  ('Français', 'Natif', 'fr', 0),
  ('Anglais', 'B2', 'gb', 1);

insert into public.cv_links (platform, label, url, sort_order) values
  ('linkedin', 'elwen-coussot', 'https://www.linkedin.com/in/elwen-coussot/', 0),
  ('github', 'iMxSquash', 'https://github.com/iMxSquash', 1),
  ('freecodecamp', 'b2b', 'https://www.freecodecamp.org/b2b', 2);

insert into public.cv_mobility (label, detail, icon_key, sort_order) values
  ('Permis B', null, 'car', 0),
  ('Carte Navigo', 'Paris et Île-de-France', 'metro', 1),
  ('Télétravail', 'Si nécessaire', 'home', 2);
