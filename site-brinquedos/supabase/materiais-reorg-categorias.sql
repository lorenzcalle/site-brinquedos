-- Reorganização de categorias dos vídeos (rodar UMA vez no Supabase > SQL Editor)
-- Física -> Impressão 3D (vídeo Impressao3D) | Disco de Newton: Física -> Montagem
-- Idempotente: pode rodar de novo sem problema (só re-aplica os mesmos valores).

-- Impressao3D: passa de "Desenvolvimento de Produto" para a nova aba "Impressão 3D"
update public.materials set category = 'Impressão 3D'
  where video_url like '%1kOUH7lWOKschfsRdzca2yBPGWGCJwCHK%';

-- Disco de Newton: passa de "Física" para "Montagem"
update public.materials set category = 'Montagem'
  where video_url like '%1jCw2L-zmbDGsjKE7EU_j8lKX4UZNGty0%';
