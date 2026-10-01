-- Storage bucket `cv-assets` (avatar, company and school logos): public read,
-- authenticated write. SVG is deliberately excluded (stored XSS) and uploads
-- are capped at 5 MB.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'cv-assets',
  'cv-assets',
  true,
  5242880,
  array['image/png', 'image/webp', 'image/jpeg', 'image/avif']
)
on conflict (id) do nothing;

-- No public SELECT policy on purpose: files of a public bucket are served by
-- URL without one, and a SELECT policy would also let anyone list the bucket.

create policy "Authenticated users can upload cv assets"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'cv-assets');

create policy "Authenticated users can update cv assets"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'cv-assets')
  with check (bucket_id = 'cv-assets');

create policy "Authenticated users can delete cv assets"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'cv-assets');

-- The admin lists files to clean up replaced ones.
create policy "Authenticated users can read cv assets"
  on storage.objects for select
  to authenticated
  using (bucket_id = 'cv-assets');
