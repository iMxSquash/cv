-- Public URL of a flat logo (png, webp, jpeg or avif in the cv-assets bucket, never svg) that the
-- skills scene morphs the orb into while the item is on the center line.
alter table public.cv_skills add column logo_url text check (logo_url ~ '^https://');
alter table public.cv_tools add column logo_url text check (logo_url ~ '^https://');
