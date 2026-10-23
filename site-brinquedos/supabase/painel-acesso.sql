-- Fase C do painel: registro de alterações ("quem alterou o quê") e contas por pessoa.
-- Rodar UMA vez no SQL Editor do Supabase. É idempotente.
--
-- 1) activity_log: preenchido por gatilhos nas tabelas do site — o front não precisa
--    lembrar de registrar nada. Quem fez vem do login (auth.jwt()); scripts com a chave
--    secreta aparecem como "sistema" e o formulário público como "formulário do site".
-- 2) account_requests: fila de "adicionar pessoa / nova senha provisória / remover
--    acesso". O scripts/accounts-worker.mjs (cron do servidor) atende com a chave
--    secreta, que fica só no servidor.
-- 3) admin_users(): lista quem tem acesso ao painel (só para quem está logado).

-- ============ 1. REGISTRO DE ALTERAÇÕES =========================================
create table if not exists public.activity_log (
  id         bigint generated always as identity primary key,
  at         timestamptz not null default now(),
  actor      text,          -- e-mail de quem fez (null = sistema / formulário)
  actor_name text,
  action     text not null, -- criou | editou | excluiu | aprovou | rejeitou | restaurou | publicou | recebeu
  entity     text not null, -- brinquedo | evento | video | pessoa | grupo | texto | envio | site
  record_id  text,
  title      text
);
create index if not exists activity_log_at_idx on public.activity_log (at desc);
create index if not exists activity_log_record_idx on public.activity_log (entity, record_id, at desc);

alter table public.activity_log enable row level security;
drop policy if exists "activity_log: leitura para logados" on public.activity_log;
create policy "activity_log: leitura para logados"
  on public.activity_log for select to authenticated using (true);
-- Sem política de escrita: só os gatilhos (security definer) gravam.

create or replace function public.log_activity() returns trigger
language plpgsql security definer set search_path = public as $$
declare
  r       jsonb := to_jsonb(coalesce(new, old));
  claims  jsonb := nullif(current_setting('request.jwt.claims', true), '')::jsonb;
  ent     text  := tg_argv[0];
  act     text;
  ignorar text[] := array['position', 'updated_at'];
begin
  if tg_op = 'INSERT' then
    act := case when ent = 'site' then 'publicou' when ent = 'envio' then 'recebeu' else 'criou' end;
  elsif tg_op = 'DELETE' then
    act := 'excluiu';
  else
    -- Só mudou a ordem (arrastar na Equipe) ou o carimbo de hora: não polui o histórico.
    if (to_jsonb(new) - ignorar) = (to_jsonb(old) - ignorar) then return new; end if;
    act := 'editou';
    if ent = 'envio' and (to_jsonb(new) ->> 'status') is distinct from (to_jsonb(old) ->> 'status') then
      act := case to_jsonb(new) ->> 'status' when 'approved' then 'aprovou' when 'rejected' then 'rejeitou' else 'restaurou' end;
    end if;
  end if;

  insert into public.activity_log (actor, actor_name, action, entity, record_id, title)
  values (
    claims ->> 'email',
    coalesce(claims -> 'user_metadata' ->> 'name', claims ->> 'email'),
    act, ent, coalesce(r ->> 'id', r ->> 'key'), -- site_texts não tem id: usa a chave
    coalesce(r ->> 'title', r ->> 'name', r ->> 'key')
  );
  return coalesce(new, old);
end $$;

do $$
declare t text; e text;
begin
  for t, e in select * from (values
    ('toys', 'brinquedo'), ('events', 'evento'), ('materials', 'video'),
    ('team_members', 'pessoa'), ('team_groups', 'grupo'), ('site_texts', 'texto'),
    ('submissions', 'envio'), ('publish_requests', 'site')
  ) as v(t, e) loop
    execute format('drop trigger if exists log_activity on public.%I', t);
    execute format(
      'create trigger log_activity after insert or update or delete on public.%I for each row execute function public.log_activity(%L)',
      t, e);
  end loop;
end $$;

-- ============ 2. PEDIDOS DE CONTA ===============================================
create table if not exists public.account_requests (
  id            bigint generated always as identity primary key,
  created_at    timestamptz not null default now(),
  requested_by  text default (auth.jwt() ->> 'email'),
  kind          text not null check (kind in ('create', 'reset_password', 'remove')),
  user_id       uuid,          -- para reset/remove
  email         text,          -- para create
  name          text,
  temp_password text,          -- apagada pelo worker assim que a conta é criada/alterada
  status        text not null default 'pending' check (status in ('pending', 'done', 'error')),
  message       text,
  handled_at    timestamptz
);

alter table public.account_requests enable row level security;
drop policy if exists "account_requests: leitura para logados" on public.account_requests;
drop policy if exists "account_requests: pedido de logados" on public.account_requests;
create policy "account_requests: leitura para logados"
  on public.account_requests for select to authenticated using (true);
create policy "account_requests: pedido de logados"
  on public.account_requests for insert to authenticated with check (status = 'pending');

-- ============ 3. QUEM TEM ACESSO ================================================
create or replace function public.admin_users()
returns table (id uuid, email text, name text, created_at timestamptz, last_sign_in_at timestamptz, must_change_password boolean)
language plpgsql security definer set search_path = public, auth as $$
begin
  if coalesce(auth.role(), '') <> 'authenticated' then
    raise exception 'só para quem está logado';
  end if;
  return query
    select u.id, u.email::text, coalesce(u.raw_user_meta_data ->> 'name', '')::text,
           u.created_at, u.last_sign_in_at,
           coalesce((u.raw_user_meta_data ->> 'must_change_password')::boolean, false)
    from auth.users u
    order by u.created_at;
end $$;
revoke all on function public.admin_users() from public, anon;
grant execute on function public.admin_users() to authenticated;
