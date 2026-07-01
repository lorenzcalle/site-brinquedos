# Brinquedos Científicos — raiz do repositório

Repositório do site **bc.san.uri.br** (projeto **Brinquedos Científicos**).
Este é o **checkout principal**: a `main` é buildada aqui e servida pelo nginx.

## Onde está o que importa
- **Código do site:** `site-brinquedos/artifacts/brinquedos-cientificos/`
  → há um **CLAUDE.md detalhado** lá (stack React/Vite/Tailwind v4, Supabase, deploy, banco,
  convenções). **Leia-o** ao trabalhar no site.
- **Status/pendências da Mostra 2026:** `site-brinquedos/PLAN.md`.

## Deploy (resumo — detalhes no CLAUDE.md do projeto)
Worktree (`.claude/worktrees/…`) → `merge` na `main` aqui no checkout principal →
`pnpm build` em `site-brinquedos/artifacts/brinquedos-cientificos/` (regenera `dist/public`,
que o nginx serve) → `git push`. Dados no Supabase mudam na hora, **sem** deploy.

## Ambiente
- Rodo como usuário **`projeto`**. `/var/www` (acima daqui) é de `root` — mexer na raiz precisa de `sudo`.
- Eventos são editados por scripts `.mjs` na worktree (não pelo `/admin`) — ver `PLAN.md`.
