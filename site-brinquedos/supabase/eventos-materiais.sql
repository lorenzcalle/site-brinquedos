-- Materiais para participantes de um evento (regulamento, fichas, modelos, datas
-- importantes), editáveis no /admin → Eventos. Antes era o bloco MostraEscolas fixo no
-- events.tsx. Rodar UMA vez no SQL Editor do Supabase. É idempotente.

-- participant_info: { title, intro, dates: [{label, date}],
--                     docs: [{title, description, note, files: [{label, url, sub}]}] }
alter table public.events
  add column if not exists participant_info jsonb;

-- Bucket para documentos (PDF, Word, PowerPoint…). O modelo de banner da Mostra tem 14 MB.
insert into storage.buckets (id, name, public, file_size_limit)
values ('event-files', 'event-files', true, 52428800)
on conflict (id) do nothing;

drop policy if exists "event-files: upload para logados" on storage.objects;
drop policy if exists "event-files: update para logados" on storage.objects;
drop policy if exists "event-files: delete para logados" on storage.objects;

create policy "event-files: upload para logados"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'event-files');

create policy "event-files: update para logados"
  on storage.objects for update to authenticated
  using (bucket_id = 'event-files');

create policy "event-files: delete para logados"
  on storage.objects for delete to authenticated
  using (bucket_id = 'event-files');
