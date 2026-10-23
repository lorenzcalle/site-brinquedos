-- Equipe e textos do site editáveis pelo /admin (Fase 3 do painel).
--
-- Antes, a equipe (grupos, pessoas e fotos) ficava em src/lib/data.ts e os textos das
-- páginas direto no JSX; qualquer troca exigia deploy. Rodar UMA vez no SQL Editor do
-- Supabase. É idempotente.

-- ============ EQUIPE =========================================================
create table if not exists public.team_groups (
  id        uuid primary key default gen_random_uuid(),
  title     text not null,
  subtitle  text,
  position  int  not null default 0
);

create table if not exists public.team_members (
  id         uuid primary key default gen_random_uuid(),
  group_id   uuid not null references public.team_groups(id) on delete restrict,
  name       text not null,
  role       text,          -- cargo (ex.: "Coordenadora", "Bolsista CNPq")
  bio        text,          -- quebras de linha aparecem no site
  photo_url  text,
  position   int  not null default 0,
  created_at timestamptz not null default now()
);

-- ============ TEXTOS DO SITE =================================================
-- Chave → texto. Chave sem linha aqui usa o texto padrão que está no código
-- (src/lib/site-texts.ts), então a tabela pode começar vazia.
create table if not exists public.site_texts (
  key        text primary key,
  value      text not null,
  updated_at timestamptz not null default now()
);

-- ============ RLS: público lê, logado gerencia ===============================
do $$
declare t text;
begin
  foreach t in array array['team_groups', 'team_members', 'site_texts'] loop
    execute format('alter table public.%I enable row level security', t);
    execute format('drop policy if exists "%s: leitura pública" on public.%I', t, t);
    execute format('drop policy if exists "%s: gestão para logados" on public.%I', t, t);
    execute format('create policy "%s: leitura pública" on public.%I for select to anon, authenticated using (true)', t, t);
    execute format('create policy "%s: gestão para logados" on public.%I for all to authenticated using (true) with check (true)', t, t);
  end loop;
end $$;

-- ============ BUCKET site-media (fotos da equipe, banner da home) ============
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('site-media', 'site-media', true, 10485760, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do nothing;

drop policy if exists "site-media: upload para logados" on storage.objects;
drop policy if exists "site-media: update para logados" on storage.objects;
drop policy if exists "site-media: delete para logados" on storage.objects;

create policy "site-media: upload para logados"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'site-media');

create policy "site-media: update para logados"
  on storage.objects for update to authenticated
  using (bucket_id = 'site-media');

create policy "site-media: delete para logados"
  on storage.objects for delete to authenticated
  using (bucket_id = 'site-media');
