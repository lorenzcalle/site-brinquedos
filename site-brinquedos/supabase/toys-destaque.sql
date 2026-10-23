-- Destaque na página inicial (Fase 2 do painel).
--
-- A seção "Nossa missão" da home mostrava 2 brinquedos cujos IDs estavam fixos no
-- home.tsx. Agora é a coluna `featured`, marcada pela estrela em /admin → Brinquedos.
-- Rodar UMA vez no SQL Editor do Supabase. É idempotente.

alter table public.toys
  add column if not exists featured boolean not null default false;

-- Os dois que estavam fixos no código: EcoConcha e H2SOL.
update public.toys set featured = true
where id in ('803ca654-3c2f-4982-9ba5-e4681975d86a', '283adb6c-d7bf-46ac-91d5-446604fb8f6a');
