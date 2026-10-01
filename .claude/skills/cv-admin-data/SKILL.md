---
name: cv-admin-data
description: Données et backoffice du CV (cv.elwen.dev). Schéma Supabase cv_* (profil, expériences, éducation, compétences, tools, langues, liens, mobilité), RLS, bucket cv-assets, migrations versionnées, lecture côté serveur + revalidation, /admin protégé par Supabase Auth, Server Actions validées avec Zod, uploads d'images. À charger pour tout travail sur le schéma, les requêtes Supabase, /admin, l'authentification ou les uploads.
---

# Données & admin (projet Supabase partagé avec le portfolio)

Projet Supabase **`portfolio`** (ref `pxfauyqwldigcxjfynzz`), qui contient déjà `projects` (portfolio), `artworks` et `videos` (adobe-apps). Ce repo n'y ajoute que des objets **préfixés `cv_`** / `cv-` et ne touche jamais aux tables des autres repos. **Relire « Invariants elwen.dev » de `../portfolio/.claude/skills/check-security/CHECKLIST.md` avant tout travail ici.**

## Règle de vie privée

**Tout ce qui est stocké dans une table `cv_*` est public par conception** (lisible par `anon` via l'API REST, même si la page ne l'affiche pas : la RLS filtre des lignes, pas des colonnes). Donc : ne jamais stocker une donnée qu'on ne veut pas publier « en masqué ». Un téléphone non publié = champ vide, pas un flag `show_phone`. L'adresse se limite à ville + code postal.

## Schéma (migrations dans `supabase/migrations/`, horodatées `YYYYMMDDHHMMSS_*.sql`)

Pourquoi relationnel plutôt qu'un document JSON unique : contraintes en base (dernière ligne de défense), réordonnancement par entité, cohérence avec les autres repos. Coût : plus de formulaires dans l'admin, assumé.

```sql
-- Singleton : une seule ligne (id = 1)
create table public.cv_profile (
  id smallint primary key default 1 check (id = 1),
  full_name text not null,
  headline text not null,                 -- 'Full-Stack Developer'
  quote text, quote_author text,          -- 'People ignore design that ignore people.' / 'Frank Chimero'
  about text not null,                    -- markup léger : **mot** = mot-clé mis en avant
  email text not null check (email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  phone text,                             -- vide = non publié
  location text,                          -- 'Herblay-sur-Seine, 95220'
  avatar_url text,
  availability_title text,                -- 'Ouvert à une alternance'
  availability_detail text,               -- 'Septembre 2026, présentiel ou télétravail'
  is_available boolean not null default true,
  updated_at timestamptz not null default now()
);

create table public.cv_experiences (
  id uuid primary key default gen_random_uuid(),
  role text not null, company text not null,
  logo_url text,
  start_date date not null, end_date date,  -- end_date null = en cours
  location text,                            -- 'Trappes (78) et travail à distance'
  description text,
  sort_order int not null default 0, visible boolean not null default true,
  created_at timestamptz not null default now(),
  check (end_date is null or end_date >= start_date)
);

create table public.cv_education (
  id uuid primary key default gen_random_uuid(),
  school text not null, city text,
  degree text not null, details text,
  start_year int not null check (start_year between 1990 and 2100),
  end_year int check (end_year is null or end_year >= start_year),
  logo_url text,
  sort_order int not null default 0, visible boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.cv_skills (
  id uuid primary key default gen_random_uuid(),
  category text not null check (category in ('design', 'development')),
  label text not null,                      -- 'CSS'
  details text[] not null default '{}',     -- {'Tailwind'} / {'NextJS','NestJS','PHP'}
  sort_order int not null default 0, visible boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.cv_tools (
  id uuid primary key default gen_random_uuid(),
  name text not null, purpose text,         -- 'Figma' / 'UI Design, prototyping'
  icon_key text not null,                   -- clé d'un composant SVG local, jamais un SVG uploadé
  sort_order int not null default 0, visible boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.cv_languages (
  id uuid primary key default gen_random_uuid(),
  name text not null, level text not null,  -- 'Anglais' / 'B2'
  flag_code text not null check (flag_code ~ '^[a-z]{2}$'),
  sort_order int not null default 0, visible boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.cv_links (
  id uuid primary key default gen_random_uuid(),
  platform text not null check (platform in ('linkedin', 'github', 'freecodecamp', 'website', 'other')),
  label text not null,                      -- 'elwen-coussot'
  url text not null check (url ~ '^https://'),
  sort_order int not null default 0, visible boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.cv_mobility (
  id uuid primary key default gen_random_uuid(),
  label text not null, detail text,         -- 'Carte Navigo' / 'Paris et Île-de-France'
  icon_key text not null,
  sort_order int not null default 0, visible boolean not null default true,
  created_at timestamptz not null default now()
);
```

- Index `(sort_order)` (et `(category, sort_order)` pour `cv_skills`), `comment on table` sur chaque table (cohérence avec les autres repos).
- **RLS sur chaque table**, même modèle que `artworks` : `select` public `using (visible = true)` (profil : `using (true)`), `select` complet + `insert/update/delete` pour `authenticated`. Trigger `updated_at` sur `cv_profile`.
- Bucket **`cv-assets`** : public en lecture, écriture `authenticated`, `allowed_mime_types` = png/webp/jpeg/avif, `file_size_limit` 5 Mo. Policies sur `storage.objects` filtrées par `bucket_id = 'cv-assets'`.
- Migration de **seed** avec le contenu actuel du CV Figma (à valider avec Elwen : certaines dates semblent dépassées au 1er octobre 2026).
- Après chaque migration : `get_advisors` (security + performance) via le MCP Supabase, puis `generate_typescript_types` vers `src/lib/database.types.ts`.

## Lecture côté site public

- `src/lib/cv/queries.ts` : une fonction `getCv()` qui lit toutes les tables en parallèle (`Promise.all`) avec le client **anon** (`@supabase/supabase-js`, sans cookies) et renvoie un objet typé `Cv`. Les sections reçoivent des props, jamais de requête dans un composant.
- Page `/` **statique**, invalidée à la demande : `revalidatePath("/")` (et `/print`) après chaque écriture admin. Le badge « Actuel » dépend de la date du jour : le calculer au rendu et ajouter un `revalidate` quotidien (`export const revalidate = 86400`) pour qu'il bascule sans action.
- `about` : parser le markup `**mot**` en segments `{ text, isKeyword }` (fonction pure testée), rendus en `<strong>`. **Jamais de `dangerouslySetInnerHTML`.**

## Admin `/admin`

- Proxy Next 16 : `src/proxy.ts` (nom Next 16 du middleware), matcher `/admin/:path*`, rafraîchit la session `@supabase/ssr` et redirige vers `/admin/login` si pas d'utilisateur. Reprendre le modèle de `../adobe-apps/src/proxy.ts` et `../adobe-apps/src/lib/admin/auth.ts` (`requireAdminPage`, `requireAdminAction`).
- **Chaque Server Action** commence par `requireAdminAction()` (`getUser()`, jamais `getSession()`), puis `schema.safeParse()` Zod sur le `FormData`, puis écriture, puis `revalidatePath`. Erreurs renvoyées en messages génériques à l'UI, détail en log serveur.
- Schémas Zod dans `src/lib/cv/schemas.ts`, **les mêmes contraintes que la base** (URL https, regex, bornes d'années) ; testés avec Vitest.
- Login : email + mot de passe Supabase (même compte que le portfolio), message d'erreur générique, inscriptions désactivées dans Supabase Auth. Le rate limiting est celui de Supabase Auth : ne pas le contourner par un endpoint maison.
- `/admin` en `noindex` (`robots: { index: false }`) et exclu du sitemap.
- UX : une page par entité (liste + formulaire), réordonnancement par flèches ↑↓ (écrit `sort_order`), toggle `visible` inline, confirmation avant suppression, lien « Voir le site » qui ouvre `/` dans un nouvel onglet. Formulaires accessibles (labels, erreurs reliées par `aria-describedby`).

## Uploads (avatar, logos)

- Formats png/webp/jpeg/avif, **SVG refusé**. Vérifier côté serveur le MIME déclaré **et** les magic bytes ; taille max 5 Mo.
- Nom régénéré `{entity}-{uuid}.{ext}`, jamais le nom d'origine.
- Remplacement ou suppression d'une entité : supprimer l'ancien fichier du bucket (pas d'orphelins).
- Affichage via `next/image` (`remotePatterns` limité à `/storage/v1/object/public/cv-assets/**`, déjà configuré dans `next.config.ts`).
