-- These tables hold a few dozen rows at most: Postgres always seq-scans and
-- sorts them in memory, so the sort_order indexes were never used (Supabase
-- performance advisor: unused_index) and only cost writes.
drop index public.cv_experiences_sort_order_idx;
drop index public.cv_education_sort_order_idx;
drop index public.cv_skills_category_sort_order_idx;
drop index public.cv_tools_sort_order_idx;
drop index public.cv_languages_sort_order_idx;
drop index public.cv_links_sort_order_idx;
drop index public.cv_mobility_sort_order_idx;
