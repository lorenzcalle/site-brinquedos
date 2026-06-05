-- =============================================================================
-- Políticas de segurança (RLS) — Brinquedos Científicos
-- =============================================================================
-- Cole TUDO no Supabase → SQL Editor → Run.
--
-- Modelo de segurança:
--   • Público (anon)         → só LÊ brinquedos aprovados e eventos; só INSERE
--                              submissões (formulário). NÃO lê dados pessoais,
--                              NÃO apaga, NÃO edita, NÃO publica brinquedos.
--   • Logado (authenticated) → acesso total (é o que o /admin usará após login).
--
-- IMPORTANTE: depois de rodar isto, o /admin para de funcionar até existir
-- login (Supabase Auth), porque ele hoje usa a chave pública. O site público
-- e o formulário de envio continuam funcionando normalmente.
-- =============================================================================


-- ============ TOYS (portfólio) ===============================================
alter table public.toys enable row level security;

-- Remove qualquer política permissiva existente, para partir de um estado limpo
do $$
declare r record;
begin
  for r in select policyname from pg_policies
           where schemaname = 'public' and tablename = 'toys'
  loop execute format('drop policy if exists %I on public.toys', r.policyname); end loop;
end $$;

-- Público lê SOMENTE brinquedos aprovados
create policy "toys: leitura pública de aprovados"
  on public.toys for select
  to anon
  using (status = 'approved');

-- Usuário logado (admin) lê tudo
create policy "toys: leitura total para logados"
  on public.toys for select
  to authenticated
  using (true);

-- Só logado pode inserir / atualizar / deletar
create policy "toys: escrita só para logados"
  on public.toys for all
  to authenticated
  using (true)
  with check (true);


-- ============ SUBMISSIONS (formulário de envio) ==============================
alter table public.submissions enable row level security;

do $$
declare r record;
begin
  for r in select policyname from pg_policies
           where schemaname = 'public' and tablename = 'submissions'
  loop execute format('drop policy if exists %I on public.submissions', r.policyname); end loop;
end $$;

-- Público pode APENAS inserir (enviar um brinquedo). Não pode ler/editar/apagar.
create policy "submissions: inserção pública"
  on public.submissions for insert
  to anon
  with check (true);

-- Só logado (admin) pode ler / atualizar / deletar as submissões (contêm e-mails)
create policy "submissions: leitura só para logados"
  on public.submissions for select
  to authenticated
  using (true);

create policy "submissions: update só para logados"
  on public.submissions for update
  to authenticated
  using (true)
  with check (true);

create policy "submissions: delete só para logados"
  on public.submissions for delete
  to authenticated
  using (true);


-- ============ EVENTS (eventos) ===============================================
alter table public.events enable row level security;

do $$
declare r record;
begin
  for r in select policyname from pg_policies
           where schemaname = 'public' and tablename = 'events'
  loop execute format('drop policy if exists %I on public.events', r.policyname); end loop;
end $$;

-- Público só lê
create policy "events: leitura pública"
  on public.events for select
  to anon
  using (true);

-- Logado gerencia
create policy "events: gestão para logados"
  on public.events for all
  to authenticated
  using (true)
  with check (true);


-- =============================================================================
-- Conferência rápida (opcional): rode depois para ver as políticas aplicadas
--   select tablename, policyname, roles, cmd
--   from pg_policies
--   where schemaname = 'public'
--   order by tablename, cmd;
-- =============================================================================
