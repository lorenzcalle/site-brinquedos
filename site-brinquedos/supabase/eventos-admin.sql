-- Eventos editáveis pelo /admin (Fase 1 do painel).
--
-- Antes, inscrição, prazo, fotos e álbum de cada evento viviam em constantes no
-- events.tsx (chaveadas pelo título) e só mudavam com deploy. Agora são colunas da
-- própria tabela, e as fotos novas sobem para o bucket `event-media`.
--
-- Rodar UMA vez no SQL Editor do Supabase. É idempotente (pode rodar de novo).

-- ============ COLUNAS NOVAS EM EVENTS ========================================
alter table public.events
  add column if not exists registration_url      text,   -- formulário externo de inscrição
  add column if not exists registration_deadline date,   -- último dia de inscrição
  add column if not exists album_url             text,   -- pasta do Drive com o álbum completo
  add column if not exists album_label           text,   -- texto do botão do álbum
  add column if not exists photos                jsonb not null default '[]'::jsonb;
  -- photos: [{ "mini": "<url 400x225>", "full": "<url 1600x900>" }, ...]

-- ============ BUCKET DE FOTOS DOS EVENTOS ====================================
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('event-media', 'event-media', true, 10485760, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do nothing;

-- Leitura é pública pelo próprio bucket (public = true). Escrita só para quem está
-- logado no /admin.
drop policy if exists "event-media: upload para logados"  on storage.objects;
drop policy if exists "event-media: update para logados"  on storage.objects;
drop policy if exists "event-media: delete para logados"  on storage.objects;

create policy "event-media: upload para logados"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'event-media');

create policy "event-media: update para logados"
  on storage.objects for update to authenticated
  using (bucket_id = 'event-media');

create policy "event-media: delete para logados"
  on storage.objects for delete to authenticated
  using (bucket_id = 'event-media');

-- Conferir:
--   select column_name from information_schema.columns where table_name = 'events';
--   select policyname from pg_policies where tablename = 'objects' and policyname like 'event-media%';
