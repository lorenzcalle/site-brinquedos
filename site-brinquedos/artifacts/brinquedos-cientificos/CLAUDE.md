# Brinquedos Científicos — Contexto do Projeto

Site institucional do projeto **Brinquedos Científicos** (URI – Campus Santo Ângelo,
apoio CNPq/MCTI). SPA que apresenta o projeto, um portfólio de brinquedos, vídeos
tutoriais, eventos, equipe e um formulário para a comunidade enviar brinquedos.

Site no ar: **bc.san.uri.br**

## Stack

- **React + Vite + TypeScript** (SPA)
- **Tailwind CSS v4** + shadcn/ui (Radix)
- **Framer Motion** (animações)
- **wouter** para rotas (NÃO é react-router)
- **Supabase** acessado direto do cliente (sem backend próprio) — chave pública (anon) + RLS
- **EmailJS** para o formulário de contato
- pnpm workspace

## Como rodar (dev)

```bash
cd site-brinquedos/artifacts/brinquedos-cientificos
pnpm dev          # http://localhost:5173
pnpm typecheck    # tsc --noEmit
pnpm build        # gera dist/public
```

Precisa do `.env` (NÃO versionado) com:
```
VITE_SUPABASE_URL=https://ssreltrosmcnegmozbyf.supabase.co
VITE_SUPABASE_ANON_KEY=<chave publishable>
```
(O `VITE_ADMIN_PASSWORD` antigo NÃO é mais usado — admin agora usa Supabase Auth.)

## Arquitetura e decisões

- **Supabase direto no front**: as páginas leem/escrevem via `@/lib/supabase`. A
  segurança é 100% via **RLS** (a chave anon é pública, vai no bundle).
- **`cachifyImage()`** (`@/lib/utils`): troca a URL do storage do Supabase por
  `/img-cache/`, servida por um proxy nginx em produção (e proxy do Vite em dev).
  ⚠️ Usar em TODAS as imagens de brinquedo. Hoje só a home usa — portfolio/toy-detail
  ainda batem direto no Supabase (pendência).
- **Rotas** em `src/App.tsx` (wouter). `ScrollToTop` rola pro topo ao navegar.
- **Contato** usa EmailJS (envia para `bc@san.uri.br`). IDs no topo de `contact.tsx`
  (são públicos por natureza). Template/Service/Public key configurados no painel EmailJS.
- **Admin** (`/admin`) usa **Supabase Auth** (`signInWithPassword`). A sessão persiste.
  Operações privilegiadas só funcionam logado (papel `authenticated` no RLS).

## Banco de dados (Supabase)

Tabelas (todas com RLS fechado — público só lê o que deve, admin gerencia):
- **`toys`** — portfólio. Público lê só `status='approved'`. Campos: id, title,
  description, image, concepts[], materials[], concepts_description, guide_url, status.
- **`submissions`** — envios do formulário. Público só INSERE (não lê — contém e-mails).
  `concepts`/`materials` podem ser string (envios antigos) OU array (envios novos) —
  usar `toArray()` no admin.
- **`events`** — eventos. Público lê. type = 'upcoming' | 'past'.
- **`materials`** — vídeos tutoriais (YouTube). Público lê. Campos: id, title,
  description, category, level, video_url.

SQL das políticas/tabelas versionado em `site-brinquedos/supabase/`.
Buckets de storage: `toy-images`, `toy-guides` (leitura pública; insert público p/ o form).

## Deploy

O site é servido pelo nginx a partir de `dist/public` no checkout principal
(`/var/www/bc.san.uri.br/...`). Fluxo:

1. Trabalho é feito num worktree do git (branch `claude/...`)
2. `git merge` na `main` (fast-forward) no checkout principal `/var/www/bc.san.uri.br`
3. `pnpm install` + `pnpm build` no checkout principal (regenera `dist/`)
4. `git push origin main`

Mudanças de **banco/Supabase** (RLS, tabelas, usuários) NÃO precisam de commit —
aplicam direto no painel do Supabase. Só código precisa de deploy.

## Credenciais (NÃO guardar senha aqui)

- **Admin** (`/admin`): login via Supabase Auth, e-mail `bc@san.uri.br`. A senha fica
  no gerenciador de senhas / Supabase Auth — não escrever em arquivo versionado.
- Chave **secreta** do Supabase: só no painel (nunca no front nem no git).

## Convenções / armadilhas

- Há um hook (em `.claude/settings.json`) que roda `tsc --noEmit` após cada edição.
- Antes de remover um import/export, conferir se não é usado em outro lugar (`grep`).
- Vídeos dos materiais devem ser horizontais e subir no YouTube (ver `infos.txt`).
- O vídeo `src/assets/videos/videobrinquedos.mp4` (~154MB) é embutido no build e deixa
  o `dist` enorme — mover para o YouTube e remover o arquivo local (pendência).

## Pendências conhecidas (melhorias)

- [ ] **Deploy** do admin novo (Supabase Auth + CRUD + rejeitados + edição) e dos
      materiais/vídeos — está só no worktree, ainda não foi pro ar.
- [ ] `cachifyImage()` em portfolio.tsx e toy-detail.tsx (hoje sem cache).
- [ ] Vídeo de 154MB embutido no dist → subir no YouTube e remover.
- [ ] `not-found.tsx` está em inglês e sem Layout (navbar/footer).
- [ ] SEO no `index.html`: falta `meta description` e Open Graph (preview no WhatsApp).
- [ ] Footer: e-mail placeholder (`contato@brinquedoscientificos...`) → `bc@san.uri.br`;
      redes sociais com `href="#"`; links "Guias de Construção"/"Vídeo Tutoriais" mortos.
- [ ] Telefones/WhatsApp placeholder a confirmar.
- [ ] Bundle JS ~800KB sem code-splitting.
