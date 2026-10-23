-- Fila do botão "Publicar" do /admin (Fase 4 do painel).
--
-- O admin insere uma linha; o scripts/publish-worker.mjs (cron do servidor, a cada
-- minuto) vê o pedido mais novo e roda o build. A tabela só guarda id e horário, por
-- isso a leitura é pública: o worker usa a chave anon e não precisa da service_role.
-- Rodar UMA vez no SQL Editor do Supabase. É idempotente.

create table if not exists public.publish_requests (
  id           bigint generated always as identity primary key,
  requested_at timestamptz not null default now()
);

alter table public.publish_requests enable row level security;

drop policy if exists "publish_requests: leitura pública" on public.publish_requests;
drop policy if exists "publish_requests: pedido de logados" on public.publish_requests;

create policy "publish_requests: leitura pública"
  on public.publish_requests for select to anon, authenticated using (true);

create policy "publish_requests: pedido de logados"
  on public.publish_requests for insert to authenticated with check (true);
