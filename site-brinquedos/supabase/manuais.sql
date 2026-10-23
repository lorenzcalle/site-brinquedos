-- Manuais em PDF da página /materiais (aba "Manuais"), editáveis no /admin → Manuais.
-- Rodar UMA vez no SQL Editor do Supabase. É idempotente.
-- Depende do painel-acesso.sql (função log_activity) para entrar no histórico.

create table if not exists public.manuals (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  position    int not null default 0,  -- ordem na página (arrastar no admin)
  title       text not null,
  description text,
  file_url    text not null,           -- PDF no bucket `manuais`
  file_size   bigint,                  -- bytes
  pages       int,
  cover_url   text                     -- imagem da 1ª página (gerada no admin)
);

alter table public.manuals enable row level security;
drop policy if exists "manuals: leitura pública" on public.manuals;
drop policy if exists "manuals: gestão para logados" on public.manuals;
create policy "manuals: leitura pública"
  on public.manuals for select to anon, authenticated using (true);
create policy "manuals: gestão para logados"
  on public.manuals for all to authenticated using (true) with check (true);

drop trigger if exists log_activity on public.manuals;
create trigger log_activity after insert or update or delete on public.manuals
  for each row execute function public.log_activity('manual');

-- Bucket: PDFs (até 50 MB) e as capas.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('manuais', 'manuais', true, 52428800, array['application/pdf', 'image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do nothing;

drop policy if exists "manuais: upload para logados" on storage.objects;
drop policy if exists "manuais: update para logados" on storage.objects;
drop policy if exists "manuais: delete para logados" on storage.objects;
create policy "manuais: upload para logados"
  on storage.objects for insert to authenticated with check (bucket_id = 'manuais');
create policy "manuais: update para logados"
  on storage.objects for update to authenticated using (bucket_id = 'manuais');
create policy "manuais: delete para logados"
  on storage.objects for delete to authenticated using (bucket_id = 'manuais');
