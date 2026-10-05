-- English translations of the resume text. Each `*_en` column is nullable: the
-- app falls back to the French value when it is empty. Fields that read the
-- same in both languages (names, skill labels, links) get no column.
alter table public.cv_profile
  add column about_en text,
  add column availability_title_en text,
  add column availability_detail_en text;

alter table public.cv_experiences
  add column role_en text,
  add column location_en text;

alter table public.cv_education
  add column degree_en text,
  add column details_en text;

alter table public.cv_tools add column purpose_en text;

alter table public.cv_languages
  add column name_en text,
  add column level_en text;

alter table public.cv_mobility
  add column label_en text,
  add column detail_en text;

-- Initial translations, matched on the seeded French values.
update public.cv_profile set
  about_en = 'Soon entering the **3rd year** of a **Web Development** Bachelor at **Digital Campus Paris**, I am looking for a **one-year work-study placement**, from **September 2025** to **September 2026**. Curious, rigorous and passionate about web development, I already have a **significant first work-study experience** on a monorepo project based on **Angular**, **NestJS**, **Tailwind** and **Docker**. I now want to **strengthen my skills** by joining a **dynamic** tech team, on site or remote.',
  availability_title_en = 'Looking for a work-study placement',
  availability_detail_en = 'September 2025 to September 2026, on site or remote';

update public.cv_experiences set
  role_en = 'Digital solutions designer and developer',
  location_en = 'Trappes (78) and remote'
where company = 'FD Formation';
update public.cv_experiences set
  role_en = 'Digital solutions designer and developer',
  location_en = 'Remote'
where company = 'EStack consulting';
update public.cv_experiences set
  role_en = 'Volunteer graphic designer',
  location_en = 'Remote'
where company = 'Team FURY (équipe e-sport)';

update public.cv_education set
  degree_en = 'Bachelor in web development and digital solutions design'
where school = 'Digital Campus';
update public.cv_education set
  degree_en = 'General baccalaureate (French high school diploma)',
  details_en = 'NSI/SES specialisations, with Assez bien honours (merit)'
where school = 'Lycée Montesquieu';

update public.cv_tools set purpose_en = 'Code editor' where name = 'VS Code';

update public.cv_languages set name_en = 'French', level_en = 'Native' where name = 'Français';
update public.cv_languages set name_en = 'English' where name = 'Anglais';

update public.cv_mobility set label_en = 'Driving licence (B)' where label = 'Permis B';
update public.cv_mobility set label_en = 'Navigo pass', detail_en = 'Paris and Île-de-France' where label = 'Carte Navigo';
update public.cv_mobility set label_en = 'Remote work', detail_en = 'If needed' where label = 'Télétravail';
