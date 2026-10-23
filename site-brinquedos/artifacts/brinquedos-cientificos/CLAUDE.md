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
  Painel em seções (`/admin#brinquedos` etc.): `src/pages/admin.tsx` só tem login, menu e
  contagens; cada seção é um componente em `src/components/admin/` (Início, Brinquedos,
  Submissões, Vídeos, Eventos) que carrega os próprios dados. O painel tem layout próprio
  (menu lateral; no celular, ☰), sem o `Layout` do site. Peças comuns em
  `components/admin/ui.tsx`: `Modal` (Radix; pergunta antes de descartar se `dirty`),
  `cardCls` + `OpenButton` (card inteiro clicável), `ItemMenu` (menu ⋯), `btn.*`, `Field`
  (liga rótulo ao campo; `required`, `error`, `help`), `useFieldErrors` (erro embaixo do
  campo, não em toast), `DropZone` (clique ou arraste o arquivo), `TagInput`, `useDragSort`
  (reordenar arrastando), `PillTabs`, `useConfirm` no lugar do `confirm()`. Imagens são
  redimensionadas no navegador antes do upload (`src/lib/image.ts`).
- **Textos editáveis**: `src/lib/site-texts.tsx` é o catálogo (chave, rótulo, texto padrão)
  que monta o formulário de /admin → Textos; a página usa `const t = useSiteTexts()` e
  `t("chave")`. Chave sem linha em `site_texts` = texto padrão do código. Para tornar um
  texto novo editável, acrescente-o ao catálogo.
- **Equipe** vem de `team_groups`/`team_members` (`src/lib/team.ts`), não mais de `data.ts`.

## Banco de dados (Supabase)

Tabelas (todas com RLS fechado — público só lê o que deve, admin gerencia):
- **`toys`** — portfólio. Público lê só `status='approved'`. Campos: id, title,
  description, image, concepts[], materials[], concepts_description, guide_url, status,
  featured (os 2 da seção “Nossa missão” da home — `supabase/toys-destaque.sql`).
- **`submissions`** — envios do formulário. Público só INSERE (não lê — contém e-mails).
  `concepts`/`materials` podem ser string (envios antigos) OU array (envios novos) —
  usar `toArray()` no admin.
- **`events`** — eventos. Público lê. type = 'upcoming' | 'past'. Editados na aba Eventos
  do `/admin`. Inscrição (`registration_url`, `registration_deadline`), álbum do Drive
  (`album_url`, `album_label`) e fotos (`photos` jsonb `[{mini, full}]`) são colunas —
  ver `supabase/eventos-admin.sql`. Fotos novas vão para o bucket `event-media`.
  Evento “upcoming” cuja data já passou é tratado como passado no site e no admin
  (`isPast()` em `src/lib/events.ts`) — não precisa trocar o `type` à mão.
  `participant_info` (jsonb) = materiais para participantes (datas, documentos) que
  aparecem enquanto o evento é “Próximo” — `supabase/eventos-materiais.sql`; arquivos no
  bucket `event-files` (até 50 MB).
- **`team_groups`**, **`team_members`** — equipe (ordem por `position`). **`site_texts`** —
  textos das páginas (key → value). Ver `supabase/equipe-e-textos.sql`.
- **`materials`** — vídeos tutoriais (YouTube). Público lê. Campos: id, title,
  description, category, level, video_url.

SQL das políticas/tabelas versionado em `site-brinquedos/supabase/`.
Buckets de storage: `toy-images`, `toy-guides` (leitura pública; insert público p/ o form);
`event-media` (leitura pública; escrita só logado — fotos e capas de eventos);
`site-media` (idem — fotos da equipe e imagens dos textos, como o banner da home).

## Contas e histórico (Fase C do painel)

- Cada pessoa tem login próprio. **/admin → Acesso ao painel** grava pedidos em
  `account_requests`; `scripts/accounts-worker.mjs` (cron `# bc-accounts`, a cada minuto)
  cria a conta / troca a senha / remove com a chave secreta, lida de
  `~/.config/bc-site/service-role.env` (modo 600, fora do git). Sem e-mail: senha
  provisória repassada pela pessoa que convidou; `user_metadata.must_change_password`
  obriga a criar a própria senha no 1º acesso. Log em `~/.local/state/bc-site/accounts.log`.
- **`activity_log`** é preenchido por gatilhos no banco (`supabase/painel-acesso.sql`) em
  toys, events, materials, team_*, site_texts, submissions e publish_requests. O Início
  mostra "Últimas alterações"; as janelas mostram quem alterou por último; o Publicar
  conta as alterações depois da última publicação.
- Cadastro público do Supabase Auth deve ficar **desligado** (Authentication → Sign In /
  Providers → "Allow new users to sign up"), senão qualquer um vira `authenticated`.

## Deploy

**Botão “Publicar” do /admin**: grava em `publish_requests`; o cron do usuário `projeto`
roda `scripts/publish-worker.mjs` a cada minuto, que chama `scripts/publicar.sh` (build em
`dist/next` + troca no fim, sem derrubar o site; `flock` evita dois builds) e escreve
`dist/public/publish-status.json`. Log em `~/.local/state/bc-site/publish.log`.
Para deploy de código, prefira `pnpm build:site` a `pnpm build` (este último apaga o
dist/public no início e o site fica ~1 min fora).

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
