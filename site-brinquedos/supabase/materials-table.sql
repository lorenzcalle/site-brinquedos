-- =============================================================================
-- Tabela de Materiais (vídeos tutoriais) — Brinquedos Científicos
-- Cole no Supabase → SQL Editor → Run
-- =============================================================================

create table if not exists public.materials (
  id          uuid default gen_random_uuid() primary key,
  title       text not null,
  description text,
  category    text,           -- Montagem / Eletrônica / Física / Química / Desenvolvimento de Produto / Oficina de Design
  level       text,           -- Iniciante / Intermediário / Avançado
  video_url   text not null,  -- link do YouTube ou do Google Drive
  created_at  timestamptz default now()
);

-- ── RLS: público só lê, logado (admin) gerencia ──────────────────────────────
alter table public.materials enable row level security;

do $$
declare r record;
begin
  for r in select policyname from pg_policies
           where schemaname = 'public' and tablename = 'materials'
  loop execute format('drop policy if exists %I on public.materials', r.policyname); end loop;
end $$;

create policy "materials: leitura pública"
  on public.materials for select
  to anon
  using (true);

create policy "materials: gestão para logados"
  on public.materials for all
  to authenticated
  using (true)
  with check (true);
